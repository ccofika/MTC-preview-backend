const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // Contact information
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    default: 'constructions@mtc.co.rs'
  },
  companyPhone: {
    type: String,
    required: [true, 'Company phone is required'],
    trim: true,
    default: '+381 062 213 492'
  },
  companyPhoneTechnical: {
    type: String,
    trim: true,
    default: '+381 065 94 88 576'
  },
  companyAddress: {
    street: {
      type: String,
      required: true,
      default: 'Gandijeva 235/13'
    },
    city: {
      type: String,
      required: true,
      default: '11073 Beograd'
    },
    country: {
      type: String,
      required: true,
      default: 'Srbija'
    }
  },
  
  // Working hours
  workingHours: {
    weekdays: {
      type: String,
      default: 'Ponedeljak-Petak: 08:00-16:00'
    },
    saturday: {
      type: String,
      default: 'Subota: Zatvoreno'
    },
    sunday: {
      type: String,
      default: 'Nedelja: Zatvoreno'
    }
  },

  // Social media links
  socialMedia: {
    facebook: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },


  // Email settings
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPass: String,
    emailFrom: String,
    emailFromName: {
      type: String,
      default: 'Nissal Tim'
    }
  },

  // Other settings
  siteTitle: {
    type: String,
    default: 'NISSAL - Aluminijumski sistemi'
  },
  siteDescription: {
    type: String,
    default: 'Specijalizovani za proizvodnju i ugradnju aluminijumskih sistema najvećeg kvaliteta'
  },
  siteKeywords: {
    type: String,
    default: 'aluminijum, sistemi, prozori, vrata, fasade, Beograd, Srbija'
  },

  // Analytics
  googleAnalyticsId: String,
  facebookPixelId: String,

  // Legal
  privacyPolicy: String,
  termsOfService: String,
  cookiePolicy: String,

  // Notification settings
  notifications: {
    emailOnNewContact: {
      type: Boolean,
      default: true
    },
    emailOnNewOrder: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    }
  },

  // Version tracking
  version: {
    type: String,
    default: '1.0.0'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
siteSettingsSchema.index({ lastModifiedBy: 1 });

// Static method to get current settings (singleton pattern)
siteSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne({});
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({});
  }
  
  return settings;
};

// Method to update settings
siteSettingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.getCurrentSettings();
  
  // Apply updates
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null && !(updates[key] instanceof Date)) {
        // Handle nested objects
        if (!settings[key] || typeof settings[key] !== 'object') {
          settings[key] = {};
        }
        
        // Only assign if updates[key] has properties
        if (Object.keys(updates[key]).length > 0) {
          Object.assign(settings[key], updates[key]);
        }
      } else {
        settings[key] = updates[key];
      }
    }
  });
  
  settings.lastModifiedBy = userId;
  return await settings.save();
};


module.exports = mongoose.model('SiteSettings', siteSettingsSchema);