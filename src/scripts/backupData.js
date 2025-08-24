const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Project = require('../models/Project');

async function backupData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create backup directory
    const backupDir = path.join(__dirname, '..', 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    // Backup products
    console.log('Backing up products...');
    const products = await Product.find({}).lean();
    await fs.writeFile(
      path.join(backupDir, 'products_backup.json'),
      JSON.stringify(products, null, 2)
    );
    console.log(`Backed up ${products.length} products`);

    // Backup projects
    console.log('Backing up projects...');
    const projects = await Project.find({}).lean();
    await fs.writeFile(
      path.join(backupDir, 'projects_backup.json'),
      JSON.stringify(projects, null, 2)
    );
    console.log(`Backed up ${projects.length} projects`);

    console.log('Backup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backupData();