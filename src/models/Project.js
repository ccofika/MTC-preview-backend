const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    sr: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: null
    },
    en: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: null
    },
    de: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: null
    }
  },
  description: {
    sr: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
      default: null
    },
    en: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
      default: null
    },
    de: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
      default: null
    }
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
    sr: {
      type: String,
      default: null
    },
    en: {
      type: String,
      default: null
    },
    de: {
      type: String,
      default: null
    }
  },
  client: {
    sr: {
      type: String,
      trim: true,
      default: null
    },
    en: {
      type: String,
      trim: true,
      default: null
    },
    de: {
      type: String,
      trim: true,
      default: null
    }
  },
  location: {
    sr: {
      type: String,
      trim: true,
      default: null
    },
    en: {
      type: String,
      trim: true,
      default: null
    },
    de: {
      type: String,
      trim: true,
      default: null
    }
  },
  completionDate: {
    type: Date
  },
  tags: {
    sr: [String],
    en: [String],
    de: [String]
  },
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