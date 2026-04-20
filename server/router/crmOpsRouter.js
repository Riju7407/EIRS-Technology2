const express = require('express');
const Prospect = require('../model/prospectSchema');
const Employee = require('../model/employeeSchema');
const Campaign = require('../model/campaignSchema');
const Distribution = require('../model/distributionSchema');
const FollowUp = require('../model/followUpSchema');
const Interaction = require('../model/interactionSchema');
const Quotation = require('../model/quotationSchema');
const User = require('../model/userSchema');
const jwtAuth = require('../middleware/jwtAuth');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

const parsePagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 1000);
    return { page, limit, skip: (page - 1) * limit };
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildPaginatedResponse = (res, key, data, total, page, limit) => {
    return res.status(200).json({
        success: true,
        count: data.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        [key]: data,
    });
};

const generateAssignmentId = async () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Distribution.countDocuments({
        assignmentId: { $regex: `^ASG-${datePart}-` },
    });
    return `ASG-${datePart}-${String(count + 1).padStart(4, '0')}`;
};

const mapUserToClient = (user) => {
    if (!user) return null;
    const name = String(user.name || '').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    return {
        _id: user._id,
        firstName: parts[0] || name || 'Client',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        company: '',
    };
};

const hydrateUsersById = async (ids) => {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean).map((id) => String(id))));
    if (!uniqueIds.length) return new Map();
    const users = await User.find({ _id: { $in: uniqueIds } }).select('name email phoneNumber');
    const map = new Map();
    users.forEach((u) => map.set(String(u._id), u));
    return map;
};

router.use(jwtAuth, adminMiddleware);

// Service Management (Prospects)
router.get('/service-management', async (req, res) => {
    try {
        const { stage, source, search } = req.query;
        const { page, limit, skip } = parsePagination(req.query);
        const query = { isDeleted: false };

        if (stage) query.stage = stage;
        if (source) query.source = source;
        if (search) {
            const regex = { $regex: escapeRegex(search), $options: 'i' };
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { company: regex },
            ];
        }

        const [total, prospects] = await Promise.all([
            Prospect.countDocuments(query),
            Prospect.find(query)
                .populate('assignedTo', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return buildPaginatedResponse(res, 'prospects', prospects, total, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/service-management/stats', async (_req, res) => {
    try {
        const [total, qualified, negotiation, won, byStage] = await Promise.all([
            Prospect.countDocuments({ isDeleted: false }),
            Prospect.countDocuments({ isDeleted: false, stage: 'qualified' }),
            Prospect.countDocuments({ isDeleted: false, stage: 'negotiation' }),
            Prospect.countDocuments({ isDeleted: false, stage: 'won' }),
            Prospect.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$estimatedValue' } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        return res.status(200).json({ success: true, stats: { total, qualified, negotiation, won }, byStage });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/service-management', async (req, res) => {
    try {
        const prospect = await Prospect.create(req.body);
        return res.status(201).json({ success: true, message: 'Prospect created successfully', prospect });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/service-management/:id', async (req, res) => {
    try {
        const prospect = await Prospect.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email');

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        return res.status(200).json({ success: true, message: 'Prospect updated successfully', prospect });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/service-management/:id', async (req, res) => {
    try {
        const prospect = await Prospect.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!prospect) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }

        return res.status(200).json({ success: true, message: 'Prospect deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/service-management/import', async (_req, res) => {
    return res.status(501).json({ success: false, message: 'Excel import is not enabled on this backend yet' });
});

router.get('/service-management/export', async (_req, res) => {
    return res.status(501).json({ success: false, message: 'Excel export is not enabled on this backend yet' });
});

// Employees
router.get('/employees', async (req, res) => {
    try {
        const { status, region, search } = req.query;
        const { page, limit, skip } = parsePagination(req.query);
        const query = { isDeleted: false };

        if (status) query.status = status;
        if (region) query.region = region;
        if (search) {
            const regex = { $regex: escapeRegex(search), $options: 'i' };
            query.$or = [{ name: regex }, { email: regex }, { role: regex }, { region: regex }];
        }

        const [total, employees] = await Promise.all([
            Employee.countDocuments(query),
            Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ]);

        return buildPaginatedResponse(res, 'employees', employees, total, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/employees/stats', async (_req, res) => {
    try {
        const [total, active, onLeave, byRegion] = await Promise.all([
            Employee.countDocuments({ isDeleted: false }),
            Employee.countDocuments({ isDeleted: false, status: 'active' }),
            Employee.countDocuments({ isDeleted: false, status: 'on-leave' }),
            Employee.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$region', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        return res.status(200).json({ success: true, stats: { total, active, onLeave }, byRegion });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/employees', async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        return res.status(201).json({ success: true, message: 'Employee created successfully', employee });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
        }
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        return res.status(200).json({ success: true, message: 'Employee updated successfully', employee });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

// Campaigns
router.get('/campaigns', async (req, res) => {
    try {
        const { status, channel, search } = req.query;
        const { page, limit, skip } = parsePagination(req.query);
        const query = { isDeleted: false };

        if (status) query.status = status;
        if (channel) query.channel = channel;
        if (search) {
            const regex = { $regex: escapeRegex(search), $options: 'i' };
            query.$or = [{ campaignId: regex }, { name: regex }, { channel: regex }];
        }

        const [total, campaigns] = await Promise.all([
            Campaign.countDocuments(query),
            Campaign.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ]);

        return buildPaginatedResponse(res, 'campaigns', campaigns, total, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/campaigns/stats', async (_req, res) => {
    try {
        const [total, active, completed, aggregate] = await Promise.all([
            Campaign.countDocuments({ isDeleted: false }),
            Campaign.countDocuments({ isDeleted: false, status: 'active' }),
            Campaign.countDocuments({ isDeleted: false, status: 'completed' }),
            Campaign.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: null, totalReach: { $sum: '$reach' }, avgRoi: { $avg: '$roi' } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                total,
                active,
                completed,
                totalReach: aggregate[0]?.totalReach || 0,
                avgRoi: aggregate[0]?.avgRoi || 0,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/campaigns', async (req, res) => {
    try {
        const campaign = await Campaign.create(req.body);
        return res.status(201).json({ success: true, message: 'Campaign created successfully', campaign });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Campaign ID already exists' });
        }
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        return res.status(200).json({ success: true, message: 'Campaign updated successfully', campaign });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        return res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

// Distribution
router.get('/distribution', async (req, res) => {
    try {
        const { status, assignedTo, search } = req.query;
        const { page, limit, skip } = parsePagination(req.query);
        const query = { isDeleted: false };

        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;

        if (search) {
            const searchRegex = new RegExp(escapeRegex(search), 'i');
            const [matchedProspects, matchedEmployees] = await Promise.all([
                Prospect.find({
                    isDeleted: false,
                    $or: [
                        { firstName: { $regex: searchRegex } },
                        { lastName: { $regex: searchRegex } },
                        { email: { $regex: searchRegex } },
                        { phone: { $regex: searchRegex } },
                        { company: { $regex: searchRegex } },
                    ],
                }).select('_id'),
                Employee.find({
                    isDeleted: false,
                    $or: [{ name: { $regex: searchRegex } }, { email: { $regex: searchRegex } }, { role: { $regex: searchRegex } }],
                }).select('_id'),
            ]);

            query.$or = [
                { assignmentId: { $regex: searchRegex } },
                { prospect: { $in: matchedProspects.map((p) => p._id) } },
                { assignedTo: { $in: matchedEmployees.map((e) => e._id) } },
            ];
        }

        const [total, distributions] = await Promise.all([
            Distribution.countDocuments(query),
            Distribution.find(query)
                .populate('prospect', 'firstName lastName email phone company stage')
                .populate('assignedTo', 'name email role department region')
                .populate('assignedBy', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return buildPaginatedResponse(res, 'distributions', distributions, total, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/distribution/stats', async (_req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [total, active, completed, todayAssignments, topAssignees] = await Promise.all([
            Distribution.countDocuments({ isDeleted: false }),
            Distribution.countDocuments({
                isDeleted: false,
                status: { $in: ['assigned', 'in_progress', 'contacted'] },
            }),
            Distribution.countDocuments({
                isDeleted: false,
                status: { $in: ['converted', 'closed'] },
            }),
            Distribution.countDocuments({
                isDeleted: false,
                assignedAt: { $gte: todayStart },
            }),
            Distribution.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'employees',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'employee',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        assignedTo: { $arrayElemAt: ['$employee.name', 0] },
                        count: 1,
                    },
                },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            stats: { total, active, completed, todayAssignments },
            topAssignees,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/distribution', async (req, res) => {
    try {
        const { prospect, assignedTo, status, priority, dueDate, notes } = req.body;
        if (!prospect || !assignedTo) {
            return res.status(400).json({ success: false, message: 'Prospect and employee are required' });
        }

        const [prospectRecord, employeeRecord] = await Promise.all([
            Prospect.findOne({ _id: prospect, isDeleted: false }),
            Employee.findOne({ _id: assignedTo, isDeleted: false }),
        ]);

        if (!prospectRecord) {
            return res.status(404).json({ success: false, message: 'Prospect not found' });
        }
        if (!employeeRecord) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const assignmentId = req.body.assignmentId || (await generateAssignmentId());
        const distribution = await Distribution.create({
            assignmentId,
            prospect,
            assignedTo,
            assignedBy: req.user.id,
            status: status || 'assigned',
            priority: priority || 'medium',
            dueDate: dueDate || undefined,
            notes,
            assignedAt: new Date(),
        });

        const populatedDistribution = await Distribution.findById(distribution._id)
            .populate('prospect', 'firstName lastName email phone company stage')
            .populate('assignedTo', 'name email role department region')
            .populate('assignedBy', 'name email role');

        return res.status(201).json({
            success: true,
            message: 'Prospect assigned successfully',
            distribution: populatedDistribution,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Assignment ID already exists' });
        }
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/distribution/:id', async (req, res) => {
    try {
        const { prospect, assignedTo, status, priority, dueDate, notes } = req.body;
        const updatePayload = {
            status,
            priority,
            dueDate: dueDate || null,
            notes,
        };

        if (prospect) {
            const prospectRecord = await Prospect.findOne({ _id: prospect, isDeleted: false });
            if (!prospectRecord) {
                return res.status(404).json({ success: false, message: 'Prospect not found' });
            }
            updatePayload.prospect = prospect;
        }

        if (assignedTo) {
            const employeeRecord = await Employee.findOne({ _id: assignedTo, isDeleted: false });
            if (!employeeRecord) {
                return res.status(404).json({ success: false, message: 'Employee not found' });
            }
            updatePayload.assignedTo = assignedTo;
        }

        if (status === 'converted' || status === 'closed') {
            updatePayload.completedAt = new Date();
        }

        const distribution = await Distribution.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            updatePayload,
            { new: true, runValidators: true }
        )
            .populate('prospect', 'firstName lastName email phone company stage')
            .populate('assignedTo', 'name email role department region')
            .populate('assignedBy', 'name email role');

        if (!distribution) {
            return res.status(404).json({ success: false, message: 'Distribution item not found' });
        }

        return res.status(200).json({ success: true, message: 'Assignment updated successfully', distribution });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/distribution/:id', async (req, res) => {
    try {
        const distribution = await Distribution.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!distribution) {
            return res.status(404).json({ success: false, message: 'Distribution item not found' });
        }

        return res.status(200).json({ success: true, message: 'Distribution deleted successfully' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

// Quotations
router.post('/quotations', async (req, res) => {
    try {
        const { clientId, quoteNumber } = req.body;
        const client = await User.findById(clientId).select('name email phoneNumber address city state pincode');
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const fallbackQuoteNumber = `Q-${Date.now()}`;
        const quotation = new Quotation({
            ...req.body,
            quoteNumber: quoteNumber || fallbackQuoteNumber,
            clientId,
            clientName: req.body.clientName || client.name || '',
            clientPhone: req.body.clientPhone || client.phoneNumber || '',
            clientAddress:
                req.body.clientAddress ||
                [client.address, client.city, client.state, client.pincode].filter(Boolean).join(', '),
            createdBy: req.user._id || req.user.id,
        });

        await quotation.save();
        return res.status(201).json({ message: 'Quotation saved successfully', quotation });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to save quotation', error: error.message });
    }
});

router.get('/quotations', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, clientId, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = {};
        if (status) filter.status = status;
        if (clientId) filter.clientId = clientId;
        if (search) {
            const regex = { $regex: escapeRegex(search), $options: 'i' };
            filter.$or = [{ quoteNumber: regex }, { clientName: regex }];
        }

        const [total, quotations] = await Promise.all([
            Quotation.countDocuments(filter),
            Quotation.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('createdBy', 'name email'),
        ]);

        return res.status(200).json({
            quotations,
            totalCount: total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch quotations', error: error.message });
    }
});

router.get('/quotations/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate('createdBy', 'name email');
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        return res.status(200).json(quotation);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch quotation', error: error.message });
    }
});

router.patch('/quotations/:id/status', async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        return res.status(200).json({ message: 'Quotation status updated', quotation });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update quotation', error: error.message });
    }
});

router.get('/quotations/:id/download', async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        return res.status(200).json({ message: 'Download data ready', quotationNumber: quotation.quoteNumber, data: quotation });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to download quotation', error: error.message });
    }
});

router.delete('/quotations/:id', async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        return res.status(200).json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete quotation', error: error.message });
    }
});

// Follow-ups
router.get('/followups', async (req, res) => {
    try {
        const { status, label, priority, assignedTo, clientId, page = 1, limit = 10 } = req.query;
        const query = { isDeleted: false };
        if (status) query.status = status;
        if (label) query.label = label;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (clientId) query.client = clientId;

        await FollowUp.updateMany(
            { status: 'scheduled', scheduledDate: { $lt: new Date() }, isDeleted: false },
            { status: 'overdue' }
        );

        const skip = (Number(page) - 1) * Number(limit);
        const [total, followUps] = await Promise.all([
            FollowUp.countDocuments(query),
            FollowUp.find(query).sort({ scheduledDate: 1 }).skip(skip).limit(Number(limit)),
        ]);

        const userIds = [];
        followUps.forEach((f) => {
            userIds.push(f.client, f.scheduledBy, f.assignedTo);
        });
        const userMap = await hydrateUsersById(userIds);

        const mapped = followUps.map((f) => ({
            ...f.toObject(),
            client: mapUserToClient(userMap.get(String(f.client))),
            scheduledBy: mapUserToClient(userMap.get(String(f.scheduledBy))),
            assignedTo: mapUserToClient(userMap.get(String(f.assignedTo))),
        }));

        return res.status(200).json({
            success: true,
            count: mapped.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            followUps: mapped,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/followups/stats', async (_req, res) => {
    try {
        const [scheduled, overdue, completed, pending, paymentDue, byLabel] = await Promise.all([
            FollowUp.countDocuments({ status: 'scheduled', isDeleted: false }),
            FollowUp.countDocuments({ status: 'overdue', isDeleted: false }),
            FollowUp.countDocuments({ status: 'completed', isDeleted: false }),
            FollowUp.countDocuments({
                label: 'Pending Response',
                isDeleted: false,
                status: { $nin: ['completed', 'cancelled'] },
            }),
            FollowUp.countDocuments({
                label: 'Payment Due',
                isDeleted: false,
                status: { $nin: ['completed', 'cancelled'] },
            }),
            FollowUp.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$label', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            stats: { scheduled, overdue, completed, pending, paymentDue },
            byLabel,
            upcomingToday: [],
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/followups/labels', async (_req, res) => {
    return res.status(200).json({ success: true, labels: FollowUp.schema.path('label').enumValues });
});

router.get('/followups/:id', async (req, res) => {
    try {
        const followUp = await FollowUp.findOne({ _id: req.params.id, isDeleted: false });
        if (!followUp) {
            return res.status(404).json({ success: false, message: 'Follow-up not found' });
        }
        const userMap = await hydrateUsersById([followUp.client, followUp.scheduledBy, followUp.assignedTo]);
        return res.status(200).json({
            success: true,
            followUp: {
                ...followUp.toObject(),
                client: mapUserToClient(userMap.get(String(followUp.client))),
                scheduledBy: mapUserToClient(userMap.get(String(followUp.scheduledBy))),
                assignedTo: mapUserToClient(userMap.get(String(followUp.assignedTo))),
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/followups', async (req, res) => {
    try {
        const client = await User.findById(req.body.client);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        const followUp = await FollowUp.create({ ...req.body, scheduledBy: req.user.id });
        return res.status(201).json({ success: true, message: 'Follow-up scheduled successfully', followUp });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/followups/:id', async (req, res) => {
    try {
        if (req.body.status === 'completed') {
            req.body.completedAt = new Date();
        }
        const followUp = await FollowUp.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!followUp) {
            return res.status(404).json({ success: false, message: 'Follow-up not found' });
        }
        return res.status(200).json({ success: true, message: 'Follow-up updated successfully', followUp });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/followups/:id', async (req, res) => {
    try {
        const followUp = await FollowUp.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!followUp) {
            return res.status(404).json({ success: false, message: 'Follow-up not found' });
        }
        return res.status(200).json({ success: true, message: 'Follow-up deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Interactions
router.get('/interactions', async (req, res) => {
    try {
        const { type, status, priority, clientId, page = 1, limit = 10, search } = req.query;
        const query = { isDeleted: false };
        if (type) query.type = type;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (clientId) query.client = clientId;
        if (search) {
            const regex = { $regex: escapeRegex(search), $options: 'i' };
            query.$or = [{ subject: regex }, { description: regex }];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [total, interactions] = await Promise.all([
            Interaction.countDocuments(query),
            Interaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        ]);

        const userIds = [];
        interactions.forEach((i) => userIds.push(i.client, i.loggedBy, i.resolvedBy));
        const userMap = await hydrateUsersById(userIds);

        const mapped = interactions.map((i) => ({
            ...i.toObject(),
            client: mapUserToClient(userMap.get(String(i.client))),
            loggedBy: mapUserToClient(userMap.get(String(i.loggedBy))),
            resolvedBy: mapUserToClient(userMap.get(String(i.resolvedBy))),
        }));

        return res.status(200).json({
            success: true,
            count: mapped.length,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            interactions: mapped,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/interactions/stats', async (_req, res) => {
    try {
        const [total, open, resolved, escalated, byType, bySentiment] = await Promise.all([
            Interaction.countDocuments({ isDeleted: false }),
            Interaction.countDocuments({ status: 'open', isDeleted: false }),
            Interaction.countDocuments({ status: 'resolved', isDeleted: false }),
            Interaction.countDocuments({ status: 'escalated', isDeleted: false }),
            Interaction.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Interaction.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$sentiment', count: { $sum: 1 } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            stats: { total, open, resolved, escalated },
            byType,
            bySentiment,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/interactions/client/:clientId', async (req, res) => {
    try {
        const interactions = await Interaction.find({ client: req.params.clientId, isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: interactions.length, interactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/interactions/:id', async (req, res) => {
    try {
        const interaction = await Interaction.findOne({ _id: req.params.id, isDeleted: false });
        if (!interaction) {
            return res.status(404).json({ success: false, message: 'Interaction not found' });
        }
        return res.status(200).json({ success: true, interaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/interactions', async (req, res) => {
    try {
        const client = await User.findById(req.body.client);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        const interaction = await Interaction.create({ ...req.body, loggedBy: req.user.id });
        return res.status(201).json({ success: true, message: 'Interaction logged successfully', interaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/interactions/:id', async (req, res) => {
    try {
        if (req.body.status === 'resolved' || req.body.status === 'closed') {
            req.body.resolvedAt = new Date();
            req.body.resolvedBy = req.user.id;
        }
        const interaction = await Interaction.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!interaction) {
            return res.status(404).json({ success: false, message: 'Interaction not found' });
        }
        return res.status(200).json({ success: true, message: 'Interaction updated successfully', interaction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/interactions/:id', async (req, res) => {
    try {
        const interaction = await Interaction.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!interaction) {
            return res.status(404).json({ success: false, message: 'Interaction not found' });
        }
        return res.status(200).json({ success: true, message: 'Interaction deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;