const { uploadImage, deleteImage } = require('../config/cloudinary');
const nodemailer = require('nodemailer');
const SiteSettings = require('../models/SiteSettings');

// Gmail SMTP configuration
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }

  console.log('Creating email transporter with:', {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'NOT SET',
    pass: process.env.EMAIL_PASS ? '***CONFIGURED***' : 'NOT SET'
  });

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });
};

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    // Get site settings for email configuration
    const siteSettings = await SiteSettings.getCurrentSettings();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      inquiryType,
      subject,
      message
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !inquiryType || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Handle file attachment if provided
    let attachment = null;
    if (req.file) {
      try {
        const uploadResult = await uploadImage(
          req.file.buffer,
          {
            folder: 'nissal/attachments',
            resource_type: 'auto'
          }
        );
        
        attachment = {
          filename: req.file.originalname,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          mimeType: req.file.mimetype,
          size: req.file.size
        };
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        // Continue without attachment rather than failing
      }
    }


    // Send email notification to company
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log('Starting email sending process...');
      const transporter = createTransporter();
      
      // First verify the connection
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      
      const emailBody = `
        <h2>Nova poruka sa kontakt forme - Nissal Website</h2>
        
        <h3>Podaci o pošaljaocu:</h3>
        <p><strong>Ime:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        ${company ? `<p><strong>Kompanija:</strong> ${company}</p>` : ''}
        ${position ? `<p><strong>Pozicija:</strong> ${position}</p>` : ''}
        
        <h3>Detalji poruke:</h3>
        <p><strong>Tip upita:</strong> ${inquiryType}</p>
        <p><strong>Predmet:</strong> ${subject}</p>
        <p><strong>Poruka:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        
        ${attachment ? `<p><strong>Prilog:</strong> <a href="${attachment.url}" target="_blank">${attachment.filename}</a></p>` : ''}
        
        <hr>
        <p><small>Vreme slanja: ${new Date().toLocaleString('sr-RS')}</small></p>
      `;

      console.log('Sending notification email to company...');
      const notificationResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: siteSettings.companyEmail || process.env.EMAIL_USER,
        subject: `Nova poruka: ${subject}`,
        html: emailBody
      });
      console.log('✅ Notification email sent:', notificationResult.messageId);

      // Send confirmation email to sender
      const confirmationBody = `
        <h2>Potvrda - Vaša poruka je uspešno poslata</h2>
        
        <p>Poštovani/a ${firstName},</p>
        
        <p>Hvala vam što ste nas kontaktirali! Vaša poruka je uspešno primljena i biće obrađena u najkraćem mogućem roku.</p>
        
        <h3>Detalji vaše poruke:</h3>
        <p><strong>Predmet:</strong> ${subject}</p>
        <p><strong>Tip upita:</strong> ${inquiryType}</p>
        <p><strong>Datum slanja:</strong> ${new Date().toLocaleString('sr-RS')}</p>
        
        <p>Odgovoriće vam što je pre moguće na email adresu: ${email}</p>
        
        <hr>
        <p>
          Srdačan pozdrav,<br>
          <strong>${siteSettings.emailSettings?.emailFromName || 'Nissal Tim'}</strong><br>
          Telefon: ${siteSettings.companyPhone}<br>
          Email: ${siteSettings.companyEmail}
        </p>
      `;

      console.log('Sending confirmation email to sender...');
      const confirmationResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Potvrda - Poruka uspešno poslata - Nissal',
        html: confirmationBody
      });
      console.log('✅ Confirmation email sent:', confirmationResult.messageId);
      
      emailSent = true;

    } catch (error) {
      console.error('❌ Email sending error:', error);
      emailError = error;
      
      // If email fails, we should still return an error to the user
      return res.status(500).json({
        success: false,
        message: 'Failed to send email notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Email service unavailable'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      emailSent: emailSent
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


module.exports = {
  submitContactForm
};