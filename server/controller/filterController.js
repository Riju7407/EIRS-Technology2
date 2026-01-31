const Filter = require('../model/filterSchema');

// Get all filters
exports.getAllFilters = async (req, res) => {
  try {
    const filters = await Filter.find({ isActive: true }).sort({ displayOrder: 1 });
    
    res.status(200).json({
      success: true,
      data: filters,
      message: 'Filters fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filters',
      error: error.message
    });
  }
};

// Get filter by type
exports.getFilterByType = async (req, res) => {
  try {
    const { type } = req.params;
    const filter = await Filter.findOne({ type, isActive: true });
    
    if (!filter) {
      return res.status(404).json({
        success: false,
        message: `Filter of type ${type} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: filter,
      message: 'Filter fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter',
      error: error.message
    });
  }
};

// Create new filter (Admin only)
exports.createFilter = async (req, res) => {
  try {
    const { name, type, options, description, displayOrder } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Filter name and type are required'
      });
    }

    // Check if filter already exists
    const existingFilter = await Filter.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingFilter) {
      return res.status(400).json({
        success: false,
        message: 'Filter with this name already exists'
      });
    }

    const newFilter = new Filter({
      name,
      type,
      options: options || [],
      description,
      displayOrder: displayOrder || 0
    });

    const savedFilter = await newFilter.save();
    
    res.status(201).json({
      success: true,
      data: savedFilter,
      message: 'Filter created successfully'
    });
  } catch (error) {
    console.error('Error creating filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating filter',
      error: error.message
    });
  }
};

// Update filter (Admin only)
exports.updateFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating name, check for uniqueness
    if (updateData.name) {
      const existingFilter = await Filter.findOne({
        _id: { $ne: id },
        name: new RegExp(`^${updateData.name}$`, 'i')
      });
      if (existingFilter) {
        return res.status(400).json({
          success: false,
          message: 'Filter with this name already exists'
        });
      }
    }

    const updatedFilter = await Filter.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFilter) {
      return res.status(404).json({
        success: false,
        message: 'Filter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedFilter,
      message: 'Filter updated successfully'
    });
  } catch (error) {
    console.error('Error updating filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating filter',
      error: error.message
    });
  }
};

// Delete filter (Admin only)
exports.deleteFilter = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFilter = await Filter.findByIdAndDelete(id);

    if (!deletedFilter) {
      return res.status(404).json({
        success: false,
        message: 'Filter not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Filter deleted successfully',
      data: deletedFilter
    });
  } catch (error) {
    console.error('Error deleting filter:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting filter',
      error: error.message
    });
  }
};

// Soft delete (toggle isActive status)
exports.toggleFilterStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = await Filter.findById(id);
    if (!filter) {
      return res.status(404).json({
        success: false,
        message: 'Filter not found'
      });
    }

    filter.isActive = !filter.isActive;
    const updatedFilter = await filter.save();

    res.status(200).json({
      success: true,
      data: updatedFilter,
      message: `Filter ${updatedFilter.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling filter status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling filter status',
      error: error.message
    });
  }
};
