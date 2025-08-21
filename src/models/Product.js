const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  }
}, { _id: false });

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hexCode: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Aloksaza', 'Plastifikacija'],
    required: true,
    default: 'Aloksaza'
  },
  available: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  plastificationTypes: {
    sjajna: {
      type: Boolean,
      default: false
    },
    matt: {
      type: Boolean,
      default: false
    },
    strukturalna: {
      type: Boolean,
      default: false
    },
    showOnProduct: {
      type: Boolean,
      default: false
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
    colorAssociation: {
      type: String,
      default: null // null means generic image, otherwise it should match a color name from colors array
    },
    categoryAssociation: {
      type: String,
      enum: ['Aloksaza', 'Plastifikacija', null],
      default: 'Aloksaza' // Default to Aloksaza category, null means generic
    }
  }],
  measurements: [measurementSchema],
  catalog: {
    catalogNumber: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      required: true
    },
    subcategory: {
      type: String
    },
    tags: [String]
  },
  colors: [colorSchema],
  sizes: [sizeSchema],
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'RSD'
    }
  },
  availability: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  catalogPdf: {
    url: {
      type: String,
      default: null
    },
    downloadUrl: {
      type: String,  
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    filename: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

productSchema.index({ 'catalog.category': 1 });
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);