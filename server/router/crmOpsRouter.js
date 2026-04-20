const express = require('express');
const Prospect = require('../model/prospectSchema');
const Employee = require('../model/employeeSchema');
const Campaign = require('../model/campaignSchema');
const Distribution = require('../model/distributionSchema');
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

module.exports = router;