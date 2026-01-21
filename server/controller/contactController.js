const Contact = require('../model/contactSchema');

// Create and save a new contact message
const contactForm = async (req, res) => {
    try {
        const response = req.body;
        await Contact.create(response);
        res.status(201).json({ 
            success: true,
            message: 'Contact message created successfully' 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};
module.exports = {
    contactForm
};