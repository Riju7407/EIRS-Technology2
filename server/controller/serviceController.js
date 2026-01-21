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
        const { name, description, price } = req.body;

        const newService = new service({
            name,
            description,
            price
        });

        const savedService = await newService.save();
        return res.status(201).json({
            success: true,
            data: savedService
        });
    } catch (error) {
        next(error);
    }
};

//Update service controller function can be added here
const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const updatedService = await service.findByIdAndUpdate(id, {
            name,
            description,
            price
        }, { new: true });

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedService
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
    updateService
};