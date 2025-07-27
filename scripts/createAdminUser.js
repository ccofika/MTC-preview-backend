const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nissal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'nissalmtctestmail@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin._id);
      await mongoose.disconnect();
      return existingAdmin;
    }

    // Create admin user
    const adminUser = new User({
      name: 'NISSAL Admin',
      email: 'nissalmtctestmail@gmail.com',
      password: 'nissalmtctestmail123',
      role: 'admin',
      isActive: true,
      permissions: [
        'manage_products',
        'manage_projects', 
        'manage_users',
        'view_analytics',
        'system_settings'
      ]
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully:', adminUser._id);

    await mongoose.disconnect();
    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then((user) => {
      console.log('Admin user ready:', user._id);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create admin user:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;