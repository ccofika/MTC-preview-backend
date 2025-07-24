const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['contact', 'order', 'inquiry', 'complaint', 'other'],
    default: 'contact'
  },
  sender: {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    }
  },
  subject: {
    type: String,
    required: [true, 'Message subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message content cannot exceed 2000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    publicId: String,
    mimeType: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'in_progress', 'resolved', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replies: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['website', 'admin', 'email', 'phone'],
      default: 'website'
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ 'sender.email': 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ priority: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ subject: 'text', content: 'text' });

messageSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'new') {
    this.metadata.receivedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);