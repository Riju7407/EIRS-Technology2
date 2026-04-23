const service = require('../model/serviceSchema.js');

const services = async (req, res, next) => {
    try {
        const services = await service.find();
        if (!services || services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No services found"
            });
        }
        return res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        next(error);
    }
}

//Get all services
const getAllServices = async (req, res, next) => {
    try {
        const services = await service.find();
        if (!services || services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No services found"
            });
        }
        return res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        next(error);
    }
}

//Add more service controller functions as needed
const addService = async (req, res, next) => {
    try {
        let { name, description, price, availableDates, image, features } = req.body;

        console.log('[addService] Raw request body:', { name, description, price, availableDates, image, features });
        console.log('[addService] req.file from multer:', req.file);
        console.log('[addService] Features type:', typeof features);
        console.log('[addService] Features value:', features);

        // Handle image from multer if file was uploaded
        if (req.file && req.file.path) {
            image = req.file.path;
            console.log('[addService] Using image from multer:', image);
        }

        // Parse features if it's a JSON string (comes from FormData)
        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
                console.log('[addService] Parsed features successfully:', features);
            } catch (e) {
                console.log('[addService] Failed to parse features:', e.message);
                features = [];
            }
        }

        // Parse availableDates if it's a string array (comes from FormData)
        if (Array.isArray(availableDates) && availableDates.length > 0 && typeof availableDates[0] === 'string') {
            availableDates = availableDates.map(d => new Date(d));
            console.log('[addService] Converted availableDates to Date objects:', availableDates);
        }

        console.log('[addService] Final data to save:', { name, description, price, availableDates, image, features });

        const newService = new service({
            name,
            description,
            price,
            availableDates: availableDates || [],
            image: image || null,
            features: features || []
        });

        const savedService = await newService.save();
        console.log('[addService] Service saved successfully:', savedService);
        return res.status(201).json({
            success: true,
            data: savedService
        });
    } catch (error) {
        console.log('[addService] Error:', error);
        next(error);
    }
};

//Update service controller function can be added here
const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        let { name, description, price, availableDates, image, features } = req.body;

        console.log('[updateService] Request for service ID:', id);
        console.log('[updateService] Raw request body:', { name, description, price, availableDates, image, features });
        console.log('[updateService] req.file from multer:', req.file);
        console.log('[updateService] Features type:', typeof features);

        // Handle image from multer if file was uploaded
        if (req.file && req.file.path) {
            image = req.file.path;
            console.log('[updateService] Using image from multer:', image);
        }

        // Parse features if it's a JSON string (comes from FormData)
        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
                console.log('[updateService] Parsed features successfully:', features);
            } catch (e) {
                console.log('[updateService] Failed to parse features:', e.message);
                features = [];
            }
        }

        // Parse availableDates if it's a string array (comes from FormData)
        if (Array.isArray(availableDates) && availableDates.length > 0 && typeof availableDates[0] === 'string') {
            availableDates = availableDates.map(d => new Date(d));
            console.log('[updateService] Converted availableDates to Date objects:', availableDates);
        }

        console.log('[updateService] Final data to update:', { name, description, price, availableDates, image, features });

        const updatedService = await service.findByIdAndUpdate(id, {
            name,
            description,
            price,
            availableDates: availableDates || [],
            image: image || undefined,
            features: features || []
        }, { new: true });

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        console.log('[updateService] Service updated successfully:', updatedService);
        return res.status(200).json({
            success: true,
            data: updatedService
        });
    } catch (error) {
        console.log('[updateService] Error:', error);
        next(error);
    }
};

// Get a service by ID
const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const found = await service.findById(id);
        if (!found) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: found
        });
    } catch (error) {
        next(error);
    }
};

//Delete a service by ID
const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedService = await service.findByIdAndDelete(id);
        if (!deletedService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    services,
    getAllServices,
    deleteService,
    addService,
    updateService,
    getServiceById
};