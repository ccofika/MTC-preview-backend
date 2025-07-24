const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  gallery: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isMain: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  category: {
    type: String,
    required: true
  },
  client: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  completionDate: {
    type: Date
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ category: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ completionDate: -1 });

module.exports = mongoose.model('Project', projectSchema);