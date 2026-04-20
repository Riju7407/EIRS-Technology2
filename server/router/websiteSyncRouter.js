const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/userSchema');
const Order = require('../model/orderSchema');
const ServiceBooking = require('../model/serviceBookingSchema');
const Contact = require('../model/contactSchema');
const jwtAuth = require('../middleware/jwtAuth');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

const parsePagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 500);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toObjectId = (value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return null;
    }
    return new mongoose.Types.ObjectId(value);
};

router.use(jwtAuth, adminMiddleware);

router.get('/stats', async (_req, res) => {
    try {
        const [users, orders, bookings, contacts] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
            ServiceBooking.countDocuments(),
            Contact.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                users,
                orders,
                bookings,
                contacts,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch stats' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const search = String(req.query.search || '').trim();
        const filter = search
            ? {
                $or: [
                    { name: { $regex: escapeRegex(search), $options: 'i' } },
                    { email: { $regex: escapeRegex(search), $options: 'i' } },
                    { phoneNumber: { $regex: escapeRegex(search), $options: 'i' } },
                    { address: { $regex: escapeRegex(search), $options: 'i' } },
                ],
            }
            : {};

        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .select('-password -otp -otpExpiry -otpPurpose -resetPasswordToken -resetPasswordExpiry')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.status(200).json({
            success: true,
            users,
            pagination: { total, page, limit },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const payload = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            city: req.body.city || '',
            state: req.body.state || '',
            pincode: req.body.pincode || '',
            isAdmin: Boolean(req.body.isAdmin),
            password: req.body.password || 'ChangeMe@123',
        };

        const user = await User.create(payload);
        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.otp;
        delete safeUser.otpExpiry;
        delete safeUser.otpPurpose;
        delete safeUser.resetPasswordToken;
        delete safeUser.resetPasswordExpiry;

        return res.status(201).json({ success: true, user: safeUser });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to create user' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            isAdmin: req.body.isAdmin,
        };

        Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
            select: '-password -otp -otpExpiry -otpPurpose -resetPasswordToken -resetPasswordExpiry',
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to update user' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to delete user' });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const search = String(req.query.search || '').trim();
        const status = String(req.query.status || '').trim();

        const filter = {};
        if (status) {
            filter.status = status;
        }

        if (search) {
            const searchRegex = { $regex: escapeRegex(search), $options: 'i' };
            const parsedObjectId = toObjectId(search);
            filter.$or = [
                { _id: parsedObjectId || undefined },
                { customerEmail: searchRegex },
                { customerPhone: searchRegex },
                { 'shippingAddress.fullName': searchRegex },
            ].filter((item) => item._id || item.customerEmail || item.customerPhone || item['shippingAddress.fullName']);
        }

        const [total, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter).sort({ orderDate: -1 }).skip(skip).limit(limit),
        ]);

        const normalizedOrders = orders.map((order) => ({
            ...order.toObject(),
            externalOrderId: order._id,
            customerName: order.shippingAddress?.fullName || order.customerEmail || 'Unknown Customer',
        }));

        return res.status(200).json({
            success: true,
            orders: normalizedOrders,
            pagination: { total, page, limit },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch orders' });
    }
});

router.post('/orders', async (req, res) => {
    try {
        let userId = toObjectId(req.body.userId);

        if (!userId) {
            const fallbackUser = await User.findOne({}, { _id: 1 }).sort({ createdAt: 1 });
            if (!fallbackUser) {
                return res.status(400).json({ success: false, message: 'No users found. Create a website user first.' });
            }
            userId = fallbackUser._id;
        }

        const totalPrice = Number(req.body.totalPrice || 0);
        const totalItems = Number(req.body.totalItems || 1);
        const itemQuantity = Math.max(totalItems, 1);
        const unitPrice = itemQuantity > 0 ? totalPrice / itemQuantity : totalPrice;

        const payload = {
            userId,
            items: Array.isArray(req.body.items) && req.body.items.length > 0
                ? req.body.items
                : [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        productName: 'Manual CRM Entry',
                        price: Number.isFinite(unitPrice) ? unitPrice : 0,
                        quantity: itemQuantity,
                    },
                ],
            totalPrice,
            totalItems,
            status: req.body.status || 'Pending',
            paymentStatus: req.body.paymentStatus || 'Pending',
            paymentMethod: req.body.paymentMethod || 'CashOnDelivery',
            notes: req.body.notes || '',
            customerEmail: req.body.customerEmail || '',
            customerPhone: req.body.customerPhone || '',
            shippingAddress: {
                fullName: req.body.customerName || 'Website Customer',
                email: req.body.customerEmail || '',
                phone: req.body.customerPhone || '',
            },
        };

        const order = await Order.create(payload);
        return res.status(201).json({ success: true, order });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to create order' });
    }
});

router.put('/orders/:id', async (req, res) => {
    try {
        const updates = {
            status: req.body.status,
            paymentStatus: req.body.paymentStatus,
            paymentMethod: req.body.paymentMethod,
            notes: req.body.notes,
            customerEmail: req.body.customerEmail,
            customerPhone: req.body.customerPhone,
        };

        Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

        const shippingAddressUpdates = {
            fullName: req.body.customerName,
            email: req.body.customerEmail,
            phone: req.body.customerPhone,
        };
        Object.keys(shippingAddressUpdates).forEach((key) => shippingAddressUpdates[key] === undefined && delete shippingAddressUpdates[key]);
        if (Object.keys(shippingAddressUpdates).length > 0) {
            updates.shippingAddress = shippingAddressUpdates;
        }

        const order = await Order.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to update order' });
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to delete order' });
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const search = String(req.query.search || '').trim();
        const filter = search
            ? {
                $or: [
                    { serviceName: { $regex: escapeRegex(search), $options: 'i' } },
                    { customerName: { $regex: escapeRegex(search), $options: 'i' } },
                    { phoneNumber: { $regex: escapeRegex(search), $options: 'i' } },
                    { email: { $regex: escapeRegex(search), $options: 'i' } },
                ],
            }
            : {};

        const [total, bookings] = await Promise.all([
            ServiceBooking.countDocuments(filter),
            ServiceBooking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ]);

        return res.status(200).json({
            success: true,
            bookings,
            pagination: { total, page, limit },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch bookings' });
    }
});

router.post('/bookings', async (req, res) => {
    try {
        let userId = toObjectId(req.body.userId);
        if (!userId) {
            const fallbackUser = await User.findOne({}, { _id: 1 }).sort({ createdAt: 1 });
            if (!fallbackUser) {
                return res.status(400).json({ success: false, message: 'No users found. Create a website user first.' });
            }
            userId = fallbackUser._id;
        }

        const payload = {
            userId,
            serviceId: toObjectId(req.body.serviceId) || new mongoose.Types.ObjectId(),
            serviceName: req.body.serviceName,
            servicePrice: Number(req.body.servicePrice || 0),
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email || '',
            address: req.body.address,
            preferredDate: req.body.preferredDate || null,
            notes: req.body.notes || '',
            status: req.body.status || 'Pending',
        };

        const booking = await ServiceBooking.create(payload);
        return res.status(201).json({ success: true, booking });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to create booking' });
    }
});

router.put('/bookings/:id', async (req, res) => {
    try {
        const updates = {
            serviceName: req.body.serviceName,
            servicePrice: req.body.servicePrice,
            customerName: req.body.customerName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            preferredDate: req.body.preferredDate,
            notes: req.body.notes,
            status: req.body.status,
        };

        Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

        const booking = await ServiceBooking.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        return res.status(200).json({ success: true, booking });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to update booking' });
    }
});

router.delete('/bookings/:id', async (req, res) => {
    try {
        const booking = await ServiceBooking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        return res.status(200).json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to delete booking' });
    }
});

router.get('/contacts', async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const search = String(req.query.search || '').trim();
        const filter = search
            ? {
                $or: [
                    { name: { $regex: escapeRegex(search), $options: 'i' } },
                    { email: { $regex: escapeRegex(search), $options: 'i' } },
                    { phoneNumber: { $regex: escapeRegex(search), $options: 'i' } },
                    { subject: { $regex: escapeRegex(search), $options: 'i' } },
                ],
            }
            : {};

        const [total, contacts] = await Promise.all([
            Contact.countDocuments(filter),
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ]);

        return res.status(200).json({
            success: true,
            contacts,
            pagination: { total, page, limit },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch contacts' });
    }
});

router.post('/contacts', async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        return res.status(201).json({ success: true, contact });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to create contact' });
    }
});

router.put('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        return res.status(200).json({ success: true, contact });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to update contact' });
    }
});

router.delete('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        return res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Failed to delete contact' });
    }
});

module.exports = router;