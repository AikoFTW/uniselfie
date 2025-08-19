const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
    const { name, email, phone, eventDate, eventType, message } = req.body;
    
    // Here you would typically send an email using nodemailer
    // For now, we'll just log the submission
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      eventDate,
      eventType,
      message,
      timestamp: new Date()
    });

    res.json({ success: true, message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'There was an error sending your message. Please try again.' });
  }
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
});
