// Admin: Update booking status
exports.updateServiceBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        const booking = await ServiceBooking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const ServiceBooking = require('../model/serviceBookingSchema');
const Service = require('../model/serviceSchema');
const User = require('../model/userSchema');
const { syncServiceBookingToCrm, fireAndForget } = require('../services/crmSyncService');

exports.createServiceBooking = async (req, res) => {
    try {
        const { serviceId, customerName, phoneNumber, email, address, preferredDate, notes } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: 'Service is required'
            });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const user = await User.findById(req.user.id).select('name email phoneNumber address');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const booking = await ServiceBooking.create({
            userId: req.user.id,
            serviceId: service._id,
            serviceName: service.name,
            servicePrice: service.price || 0,
            customerName: (customerName || user.name || '').trim(),
            phoneNumber: (phoneNumber || user.phoneNumber || '').trim(),
            email: (email || user.email || '').trim(),
            address: (address || user.address || '').trim(),
            preferredDate: preferredDate || service.preferredDate || null,
            notes: (notes || '').trim()
        });

        fireAndForget(
            () => syncServiceBookingToCrm(booking),
            `service-booking:${booking._id}`
        );

        return res.status(201).json({
            success: true,
            message: 'Service booked successfully',
            data: booking
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserServiceBookings = async (req, res) => {
    try {
        const bookings = await ServiceBooking.find({ userId: req.user.id })
            .populate('serviceId', 'name description price preferredDate')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllServiceBookings = async (req, res) => {
    try {
        const bookings = await ServiceBooking.find()
            .populate('serviceId', 'name price')
            .populate('userId', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
