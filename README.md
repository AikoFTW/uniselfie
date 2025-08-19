# UniSelfie Website

Professional website for UniSelfie - Seattle's premier open air photobooth service.

## Features

- **Multi-page website** with dedicated sections for:
  - Home page with service overview
  - About page with owner information
  - Services page with detailed offerings
  - Gallery with filterable photo categories
  - Pricing with package comparisons
  - Contact form with booking functionality
  - Dedicated Wedding and Corporate event pages

- **Professional Design**:
  - Modern, clean aesthetic inspired by leading photobooth services
  - Fully responsive design for all devices
  - Smooth animations and interactions
  - Professional photography and imagery

- **Technical Features**:
  - Built with Node.js and Express
  - EJS templating engine
  - Security middleware (Helmet, Rate limiting)
  - Contact form with email integration
  - SEO optimized
  - Fast loading and optimized

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

For Hostinger or any hosting provider:

1. Upload all files to your hosting directory
2. Install dependencies on the server:
   ```bash
   npm install --production
   ```

3. Set environment variables in your hosting control panel
4. Start the application:
   ```bash
   npm start
   ```

## File Structure

```
uniselfie/
├── public/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── images/        # Static images
├── views/
│   ├── partials/      # Header, footer, etc.
│   └── *.ejs          # Page templates
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## Pages

- **/** - Home page with hero section and service overview
- **/about** - About Mr. Ashari and UniSelfie
- **/services** - Detailed service offerings
- **/gallery** - Photo gallery with filtering
- **/pricing** - Package pricing and comparisons
- **/contact** - Contact form and booking information
- **/weddings** - Wedding-specific information
- **/corporate** - Corporate event services

## Customization

### Adding Photos
1. Add your images to `public/images/`
2. Update image sources in the EJS templates
3. Replace placeholder images with your actual event photos

### Updating Contact Information
- Edit contact details in `views/contact.ejs`
- Update footer information in `views/partials/footer.ejs`
- Change phone numbers and email addresses throughout

### Modifying Packages/Pricing
- Edit pricing information in `views/pricing.ejs`
- Update package details on the home page

### Adding Your Logo
- Replace the text logo in `views/partials/header.ejs`
- Add your logo file to `public/images/`

## Contact Form Setup

The contact form requires email configuration:

1. Set up email service (Gmail, SendGrid, etc.)
2. Add SMTP configuration to `.env`
3. The form will automatically send emails when configured

## SEO & Analytics

- Update meta tags in `views/layout.ejs`
- Add Google Analytics ID to `.env`
- Customize page titles and descriptions

## Support

For questions about this website template, contact the developer or refer to the Express.js and EJS documentation.

## License

This website template is created for UniSelfie.

