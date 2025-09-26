const SiteSettings = require('../models/SiteSettings');

const seedSiteSettings = async () => {
  try {
    console.log('Seeding site settings...');
    
    // Check if settings already exist
    const existingSettings = await SiteSettings.findOne({});
    if (existingSettings) {
      console.log('Site settings already exist, skipping...');
      return;
    }

    // Create default site settings
    const defaultSettings = new SiteSettings({
      companyEmail: 'constructions@mtc.co.rs',
      companyPhone: '+381 062 213 492',
      companyPhoneTechnical: '+381 065 94 88 576',
      companyAddress: {
        street: 'Gandijeva 235/13',
        city: '11073 Beograd',
        country: 'Srbija'
      },
      workingHours: {
        weekdays: 'Ponedeljak-Petak: 08:00-16:00',
        saturday: 'Subota: Zatvoreno',
        sunday: 'Nedelja: Zatvoreno'
      },
      socialMedia: {
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: ''
      },
      maintenanceEnabled: false,
      maintenanceMessage: 'Sajt je trenutno u režimu održavanja. Molimo pokušajte kasnije.',
      siteTitle: 'NISSAL - Aluminijumski sistemi',
      siteDescription: 'Specijalizovani za proizvodnju i ugradnju aluminijumskih sistema najvećeg kvaliteta',
      siteKeywords: 'aluminijum, sistemi, prozori, vrata, fasade, Beograd, Srbija',
      notifications: {
        emailOnNewContact: true,
        emailOnNewOrder: true,
        smsNotifications: false
      },
      version: '1.0.0'
    });

    await defaultSettings.save();
    console.log('✅ Site settings seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding site settings:', error);
    throw error;
  }
};

module.exports = seedSiteSettings;