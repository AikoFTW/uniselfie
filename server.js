const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3022;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://via.placeholder.com"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------------------------------------------------------------------------
// Contact submissions: saved to a JSON file so they survive restarts
// ---------------------------------------------------------------------------
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'submissions.json');

function loadSubmissions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Could not read submissions file:', err.message);
    return [];
  }
}

function saveSubmissions() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(contactSubmissions, null, 2));
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('Could not save submissions file:', err.message);
  }
}

let contactSubmissions = loadSubmissions();

// ---------------------------------------------------------------------------
// Admin login (username + password from .env, signed cookie session)
// ---------------------------------------------------------------------------
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const SESSION_HOURS = Number(process.env.SESSION_HOURS) || 12;
const COOKIE_NAME = 'uniselfie_admin';
const ADMIN_ENABLED = ADMIN_PASSWORD.length > 0 && SESSION_SECRET.length >= 32;

if (!ADMIN_ENABLED) {
  console.warn('WARNING: Admin panel is locked. Set ADMIN_PASSWORD and SESSION_SECRET (32+ characters) in .env');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function createSessionToken(username) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600 * 1000 })).toString('base64url');
  return payload + '.' + sign(payload);
}

function readSessionToken(token) {
  if (!ADMIN_ENABLED || !token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

function requireAdmin(req, res, next) {
  const session = readSessionToken(getCookie(req, COOKIE_NAME));
  if (session) {
    req.adminUser = session.u;
    res.locals.adminUser = session.u;
    return next();
  }
  if (req.method === 'GET') return res.redirect('/admin/login');
  return res.status(401).json({ success: false, message: 'Please log in again.' });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).render('admin/login', {
    title: 'Admin Login - UniSelfie',
    error: 'Too many login attempts. Please wait 15 minutes and try again.',
    adminEnabled: ADMIN_ENABLED
  })
});

const ALLOWED_STATUSES = ['new', 'viewed', 'replied'];

function clean(value, max) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'UniSelfie - Seattle Open Air Photobooth Rentals',
    page: 'home'
  });
});

app.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About Us - UniSelfie',
    page: 'about'
  });
});

app.get('/services', (req, res) => {
  res.render('services', { 
    title: 'Our Services - UniSelfie',
    page: 'services'
  });
});

app.get('/gallery', (req, res) => {
  res.render('gallery', { 
    title: 'Photo Gallery - UniSelfie',
    page: 'gallery'
  });
});

app.get('/pricing', (req, res) => {
  res.render('pricing', { 
    title: 'Pricing Packages - UniSelfie',
    page: 'pricing'
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact & Booking - UniSelfie',
    page: 'contact'
  });
});

app.get('/corporate', (req, res) => {
  res.render('corporate', { 
    title: 'Corporate Events - UniSelfie',
    page: 'corporate'
  });
});

app.get('/weddings', (req, res) => {
  res.render('weddings', { 
    title: 'Wedding Photobooths - UniSelfie',
    page: 'weddings'
  });
});

// Contact form submission
app.post('/contact', async (req, res) => {
  try {
    const b = req.body || {};
    const submission = {
      id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      name: clean(b.name, 120),
      email: clean(b.email, 200),
      phone: clean(b.phone, 40),
      eventDate: clean(b.eventDate, 40),
      eventType: clean(b.eventType, 60),
      guestCount: clean(b.guestCount, 20),
      venue: clean(b.venue, 200),
      message: clean(b.message, 5000),
      status: 'new'
    };

    if (!submission.name || !submission.email) {
      return res.status(400).json({ success: false, message: 'Please include your name and email.' });
    }

    // Newest first, so it shows at the top of the admin panel
    contactSubmissions.unshift(submission);
    saveSubmissions();

    console.log(`New contact inquiry from ${submission.name} (${submission.eventType || 'no event type'})`);

    res.json({ success: true, message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'There was an error sending your message. Please try again.' });
  }
});

// Admin routes
app.get('/admin/login', (req, res) => {
  if (readSessionToken(getCookie(req, COOKIE_NAME))) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login - UniSelfie', error: null, adminEnabled: ADMIN_ENABLED });
});

app.post('/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (ADMIN_ENABLED && safeEqual(username || '', ADMIN_USERNAME) && safeEqual(password || '', ADMIN_PASSWORD)) {
    res.cookie(COOKIE_NAME, createSessionToken(ADMIN_USERNAME), { ...cookieOptions, maxAge: SESSION_HOURS * 3600 * 1000 });
    return res.redirect('/admin');
  }
  res.status(401).render('admin/login', {
    title: 'Admin Login - UniSelfie',
    error: ADMIN_ENABLED ? 'Wrong username or password.' : 'Admin login is not set up yet. Add ADMIN_PASSWORD and SESSION_SECRET to the .env file.',
    adminEnabled: ADMIN_ENABLED
  });
});

app.post('/admin/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.redirect('/admin/login');
});

app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin/dashboard', { 
    title: 'Admin Dashboard - UniSelfie',
    contactSubmissions,
    inquiries: []
  });
});

app.get('/admin/contacts', requireAdmin, (req, res) => {
  res.render('admin/contacts', { 
    title: 'Contact Submissions - UniSelfie Admin',
    submissions: contactSubmissions
  });
});

app.post('/admin/contacts/:id/status', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = req.body && req.body.status;
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  const submission = contactSubmissions.find(s => s.id === id);
  if (!submission) return res.status(404).json({ success: false, message: 'Not found.' });
  submission.status = status;
  saveSubmissions();
  res.json({ success: true });
});

app.delete('/admin/contacts/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = contactSubmissions.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Not found.' });
  contactSubmissions.splice(index, 1);
  saveSubmissions();
  res.json({ success: true });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found - UniSelfie',
    page: '404'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).render('500', { 
    title: 'Server Error - UniSelfie',
    page: '500'
  });
});

app.listen(PORT, () => {
  console.log(`UniSelfie website running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin${ADMIN_ENABLED ? '' : ' (locked: set ADMIN_PASSWORD and SESSION_SECRET in .env)'}`);
});
