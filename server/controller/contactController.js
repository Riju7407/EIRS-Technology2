const Contact = require('../model/contactSchema');
const { syncContactToCrm, fireAndForget } = require('../services/crmSyncService');

// Create and save a new contact message
const contactForm = async (req, res) => {
    try {
        const body = req.body || {};

        // Backward-compatible mapping for older contact form payload shape.
        const normalizedPhone = String(body.phoneNumber || '')
            .replace(/\D/g, '')
            .slice(-15);

        const mappedPayload = {
            name: body.name,
            email: body.email || req.user?.email || '',
            phoneNumber: normalizedPhone,
            subject: body.subject || (body.location ? `Enquiry from ${body.location}` : 'Website Enquiry'),
            message: body.message || body.description || ''
        };

        const contact = await Contact.create(mappedPayload);

        fireAndForget(
            () => syncContactToCrm({
                ...mappedPayload,
                _id: contact._id,
                createdAt: contact.createdAt
            }),
            `contact:${contact._id}`
        );

        res.status(201).json({ 
            success: true,
            message: 'Contact message created successfully' 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Delete a contact message by ID
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Attempting to delete contact with ID:', id);
        
        const result = await Contact.findByIdAndDelete(id);
        console.log('Delete result:', result);
        
        if (!result) {
            console.log('Contact not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        console.log('Contact deleted successfully');
        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    contactForm,
    deleteContact
};