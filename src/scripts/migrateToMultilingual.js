const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Project = require('../models/Project');

async function migrateData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read backup data
    const backupDir = path.join(__dirname, '..', 'backups');
    const productsBackup = JSON.parse(await fs.readFile(path.join(backupDir, 'products_backup.json'), 'utf8'));
    const projectsBackup = JSON.parse(await fs.readFile(path.join(backupDir, 'projects_backup.json'), 'utf8'));

    console.log('Starting migration...');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await Product.deleteMany({});
    await Project.deleteMany({});

    // Migrate products
    console.log('Migrating products...');
    for (const product of productsBackup) {
      const migratedProduct = {
        ...product,
        title: {
          sr: product.title,
          en: null,
          de: null
        },
        description: {
          sr: product.description,
          en: null,
          de: null
        },
        catalog: {
          catalogNumber: product.catalog.catalogNumber,
          tags: {
            sr: product.catalog.tags || [],
            en: [],
            de: []
          }
        }
      };

      // Migrate colors
      if (product.colors) {
        migratedProduct.colors = product.colors.map(color => ({
          ...color,
          name: {
            sr: color.name,
            en: null,
            de: null
          }
        }));
      }

      // Migrate sizes
      if (product.sizes) {
        migratedProduct.sizes = product.sizes.map(size => ({
          ...size,
          name: {
            sr: size.name,
            en: null,
            de: null
          }
        }));
      }

      await Product.create(migratedProduct);
    }

    console.log(`Migrated ${productsBackup.length} products`);

    // Migrate projects
    console.log('Migrating projects...');
    for (const project of projectsBackup) {
      const migratedProject = {
        ...project,
        title: {
          sr: project.title,
          en: null,
          de: null
        },
        description: {
          sr: project.description,
          en: null,
          de: null
        },
        client: {
          sr: project.client || null,
          en: null,
          de: null
        },
        location: {
          sr: project.location || null,
          en: null,
          de: null
        },
        tags: {
          sr: project.tags || [],
          en: [],
          de: []
        }
      };

      await Project.create(migratedProject);
    }

    console.log(`Migrated ${projectsBackup.length} projects`);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();