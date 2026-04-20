const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema(
    {
        assignmentId: { type: String, required: [true, 'Assignment ID is required'], unique: true, trim: true },
        prospect: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Prospect',
            required: [true, 'Prospect is required'],
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Assigned employee is required'],
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigned by is required'],
        },
        status: {
            type: String,
            enum: ['assigned', 'in_progress', 'contacted', 'converted', 'closed'],
            default: 'assigned',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        assignedAt: { type: Date, default: Date.now },
        dueDate: { type: Date },
        completedAt: { type: Date },
        notes: { type: String, default: '' },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

distributionSchema.index({ assignmentId: 'text' });
distributionSchema.index({ prospect: 1, assignedTo: 1, assignedAt: -1 });

module.exports = mongoose.model('Distribution', distributionSchema);