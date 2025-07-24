const Message = require('../models/Message');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
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

    // Create message document
    const newMessage = new Message({
      type: inquiryType,
      sender: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        company: company || undefined,
      },
      subject,
      content: message,
      attachments: attachment ? [attachment] : [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'website'
      }
    });

    // Add position if provided
    if (position) {
      newMessage.sender.position = position;
    }

    // Save to database
    const savedMessage = await newMessage.save();

    // Send email notification to company
    try {
      const transporter = createTransporter();
      
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
        <p><small>ID poruke: ${savedMessage._id}</small></p>
        <p><small>Vreme slanja: ${new Date().toLocaleString('sr-RS')}</small></p>
      `;

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `Nova poruka: ${subject}`,
        html: emailBody
      });

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
          <strong>Nissal Tim</strong><br>
          Telefon: +381 11 123 4567<br>
          Email: info@nissal.rs
        </p>
      `;

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Potvrda - Poruka uspešno poslata - Nissal',
        html: confirmationBody
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue without failing the request
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: savedMessage._id,
        status: savedMessage.status
      }
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

// Get all messages (admin)
const getMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { 'sender.name': { $regex: search, $options: 'i' } },
        { 'sender.email': { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find(filter)
      .populate('assignedTo', 'name email')
      .populate('replies.sentBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(filter);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get message by ID (admin)
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate('assignedTo', 'name email')
      .populate('replies.sentBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read if it was new
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Update message status (admin)
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'in_progress', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
};

// Reply to message (admin)
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add reply to message
    const reply = {
      content,
      sentBy: userId,
      sentAt: new Date()
    };

    message.replies.push(reply);
    message.status = 'replied';
    message.assignedTo = userId;

    await message.save();

    // Send email reply
    try {
      const transporter = createTransporter();
      
      const replyEmailBody = `
        <h2>Odgovor na vašu poruku - Nissal</h2>
        
        <p>Poštovani/a ${message.sender.name.split(' ')[0]},</p>
        
        <p>Hvala vam što ste nas kontaktirali. Evo našeg odgovora na vašu poruku:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        
        <h3>Originalna poruka:</h3>
        <p><strong>Predmet:</strong> ${message.subject}</p>
        <p><strong>Datum:</strong> ${message.createdAt.toLocaleString('sr-RS')}</p>
        <div style="background-color: #e9ecef; padding: 10px; border-radius: 5px;">
          ${message.content.replace(/\n/g, '<br>')}
        </div>
        
        <hr>
        <p>
          Ako imate dodatnih pitanja, ne ustručavajte se da nas kontaktirate.<br><br>
          Srdačan pozdrav,<br>
          <strong>Nissal Tim</strong><br>
          Telefon: +381 11 123 4567<br>
          Email: info@nissal.rs
        </p>
      `;

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: message.sender.email,
        subject: `Re: ${message.subject}`,
        html: replyEmailBody
      });

      reply.emailSent = true;
      reply.emailSentAt = new Date();
      await message.save();

    } catch (emailError) {
      console.error('Reply email error:', emailError);
    }

    const updatedMessage = await Message.findById(id)
      .populate('assignedTo', 'name email')
      .populate('replies.sentBy', 'name email');

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
};

// Delete message (admin)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Delete attachments from Cloudinary
    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        try {
          await deleteImage(attachment.publicId);
        } catch (deleteError) {
          console.error('Attachment deletion error:', deleteError);
        }
      }
    }

    await Message.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Get message statistics (admin)
const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Message.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Message.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalMessages = await Message.countDocuments();
    const newMessages = await Message.countDocuments({ status: 'new' });
    const todayMessages = await Message.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        newMessages,
        todayMessages,
        statusStats: stats,
        typeStats,
        priorityStats
      }
    });

  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics'
    });
  }
};

module.exports = {
  submitContactForm,
  getMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage,
  getMessageStats
};