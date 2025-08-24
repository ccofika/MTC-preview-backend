const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TranslationService {
  async translateText(text, fromLanguage, toLanguage) {
    try {
      const languageMap = {
        'sr': 'Serbian',
        'en': 'English', 
        'de': 'German'
      };

      const prompt = `Translate the following text from ${languageMap[fromLanguage]} to ${languageMap[toLanguage]}. Maintain the original meaning and context. Only return the translated text, no additional explanations:

${text}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Changed from gpt-5-nano as it may not be available
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent translations
        max_tokens: 1000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation failed');
    }
  }

  async translateProduct(productId, targetLanguages = ['en', 'de']) {
    const Product = require('../models/Product');
    
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const updates = {};

      // Translate title
      for (const lang of targetLanguages) {
        if (!product.title[lang] && product.title.sr) {
          updates[`title.${lang}`] = await this.translateText(product.title.sr, 'sr', lang);
        }
      }

      // Translate description
      for (const lang of targetLanguages) {
        if (!product.description[lang] && product.description.sr) {
          updates[`description.${lang}`] = await this.translateText(product.description.sr, 'sr', lang);
        }
      }

      // Translate catalog category
      for (const lang of targetLanguages) {
        if (!product.catalog.category[lang] && product.catalog.category.sr) {
          updates[`catalog.category.${lang}`] = await this.translateText(product.catalog.category.sr, 'sr', lang);
        }
      }

      // Translate catalog subcategory
      if (product.catalog.subcategory && product.catalog.subcategory.sr) {
        for (const lang of targetLanguages) {
          if (!product.catalog.subcategory[lang]) {
            updates[`catalog.subcategory.${lang}`] = await this.translateText(product.catalog.subcategory.sr, 'sr', lang);
          }
        }
      }

      // Translate tags
      if (product.catalog.tags && product.catalog.tags.sr && product.catalog.tags.sr.length > 0) {
        for (const lang of targetLanguages) {
          if (!product.catalog.tags[lang] || product.catalog.tags[lang].length === 0) {
            const translatedTags = [];
            for (const tag of product.catalog.tags.sr) {
              const translatedTag = await this.translateText(tag, 'sr', lang);
              translatedTags.push(translatedTag);
            }
            updates[`catalog.tags.${lang}`] = translatedTags;
          }
        }
      }

      // Translate color names
      if (product.colors && product.colors.length > 0) {
        const updatedColors = [...product.colors];
        for (let i = 0; i < updatedColors.length; i++) {
          for (const lang of targetLanguages) {
            if (!updatedColors[i].name[lang] && updatedColors[i].name.sr) {
              updatedColors[i].name[lang] = await this.translateText(updatedColors[i].name.sr, 'sr', lang);
            }
          }
        }
        updates.colors = updatedColors;
      }

      // Translate size names
      if (product.sizes && product.sizes.length > 0) {
        const updatedSizes = [...product.sizes];
        for (let i = 0; i < updatedSizes.length; i++) {
          for (const lang of targetLanguages) {
            if (!updatedSizes[i].name[lang] && updatedSizes[i].name.sr) {
              updatedSizes[i].name[lang] = await this.translateText(updatedSizes[i].name.sr, 'sr', lang);
            }
          }
        }
        updates.sizes = updatedSizes;
      }

      // Apply updates
      await Product.findByIdAndUpdate(productId, updates);

      return { success: true, translatedFields: Object.keys(updates) };
    } catch (error) {
      console.error('Product translation error:', error);
      throw error;
    }
  }

  async translateProject(projectId, targetLanguages = ['en', 'de']) {
    const Project = require('../models/Project');
    
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updates = {};

      // Translate title
      for (const lang of targetLanguages) {
        if (!project.title[lang] && project.title.sr) {
          updates[`title.${lang}`] = await this.translateText(project.title.sr, 'sr', lang);
        }
      }

      // Translate description
      for (const lang of targetLanguages) {
        if (!project.description[lang] && project.description.sr) {
          updates[`description.${lang}`] = await this.translateText(project.description.sr, 'sr', lang);
        }
      }

      // Translate category
      for (const lang of targetLanguages) {
        if (!project.category[lang] && project.category.sr) {
          updates[`category.${lang}`] = await this.translateText(project.category.sr, 'sr', lang);
        }
      }

      // Translate client
      if (project.client && project.client.sr) {
        for (const lang of targetLanguages) {
          if (!project.client[lang]) {
            updates[`client.${lang}`] = await this.translateText(project.client.sr, 'sr', lang);
          }
        }
      }

      // Translate location
      if (project.location && project.location.sr) {
        for (const lang of targetLanguages) {
          if (!project.location[lang]) {
            updates[`location.${lang}`] = await this.translateText(project.location.sr, 'sr', lang);
          }
        }
      }

      // Translate tags
      if (project.tags && project.tags.sr && project.tags.sr.length > 0) {
        for (const lang of targetLanguages) {
          if (!project.tags[lang] || project.tags[lang].length === 0) {
            const translatedTags = [];
            for (const tag of project.tags.sr) {
              const translatedTag = await this.translateText(tag, 'sr', lang);
              translatedTags.push(translatedTag);
            }
            updates[`tags.${lang}`] = translatedTags;
          }
        }
      }

      // Apply updates
      await Project.findByIdAndUpdate(projectId, updates);

      return { success: true, translatedFields: Object.keys(updates) };
    } catch (error) {
      console.error('Project translation error:', error);
      throw error;
    }
  }
}

module.exports = new TranslationService();