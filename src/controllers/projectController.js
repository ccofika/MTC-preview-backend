const Project = require('../models/Project');
const { uploadImage, deleteImage, deleteMultipleImages } = require('../config/cloudinary');

// Get all projects with filtering and pagination
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      year,
      featured,
      sortBy = 'completionDate',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      filter.completionDate = { $gte: startDate, $lte: endDate };
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          category,
          year,
          featured,
          search
        }
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

// Get featured projects
const getFeaturedProjects = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const projects = await Project.find({ 
      isActive: true,
      featured: true 
    })
      .sort({ completionDate: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects'
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Project.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: categories.filter(Boolean)
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get available years from completion dates
const getAvailableYears = async (req, res) => {
  try {
    const years = await Project.aggregate([
      { $match: { isActive: true, completionDate: { $exists: true } } },
      { 
        $group: {
          _id: { $year: '$completionDate' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id'
        }
      },
      { $sort: { year: -1 } }
    ]);

    res.json({
      success: true,
      data: years.map(y => y.year)
    });

  } catch (error) {
    console.error('Get available years error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available years'
    });
  }
};

// Search projects
const searchProjects = async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const projects = await Project.find({
      isActive: true,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: projects,
      searchTerm: search
    });

  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search projects'
    });
  }
};

// Get projects by category
const getProjectsByCategory = async (req, res) => {
  try {
    const { category, limit = 12, page = 1 } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const filter = {
      isActive: true,
      category: { $regex: category, $options: 'i' }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(filter)
      .sort({ completionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        category,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get projects by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects by category'
    });
  }
};

// Create project (admin)
const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    
    // Process uploaded images
    if (req.files && req.files.length > 0) {
      const gallery = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const uploadResult = await uploadImage(
            file.buffer,
            {
              folder: 'nissal/projects',
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            }
          );
          
          gallery.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            alt: projectData.title || 'Project image',
            isMain: i === 0,
            order: i
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
      
      projectData.gallery = gallery;
    }

    // Parse JSON fields if they come as strings
    if (typeof projectData.tags === 'string') {
      projectData.tags = JSON.parse(projectData.tags);
    }
    if (typeof projectData.completionDate === 'string') {
      projectData.completionDate = new Date(projectData.completionDate);
    }

    const project = new Project(projectData);
    const savedProject = await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update project (admin)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Process new uploaded images
    if (req.files && req.files.length > 0) {
      const newGallery = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const uploadResult = await uploadImage(
            file.buffer,
            {
              folder: 'nissal/projects',
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            }
          );
          
          newGallery.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            alt: updateData.title || project.title,
            isMain: i === 0 && (!project.gallery || project.gallery.length === 0),
            order: (project.gallery?.length || 0) + i
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
      
      // Combine existing and new images
      updateData.gallery = [...(project.gallery || []), ...newGallery];
    }

    // Parse JSON fields if they come as strings
    if (typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }
    if (typeof updateData.completionDate === 'string') {
      updateData.completionDate = new Date(updateData.completionDate);
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// Delete project (admin)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete images from Cloudinary
    if (project.gallery && project.gallery.length > 0) {
      const publicIds = project.gallery.map(img => img.publicId).filter(Boolean);
      if (publicIds.length > 0) {
        try {
          await deleteMultipleImages(publicIds);
        } catch (deleteError) {
          console.error('Images deletion error:', deleteError);
        }
      }
    }

    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  getFeaturedProjects,
  getCategories,
  getAvailableYears,
  searchProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteProject
};