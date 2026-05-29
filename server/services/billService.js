const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateBill = async (order) => {

    return new Promise((resolve, reject) => {

        try {

            // Ensure invoices folder exists
            const invoicesDir = path.join(__dirname, '../invoices');

            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            // File details
            const fileName = `invoice_${order._id}.pdf`;

            const filePath = path.join(invoicesDir, fileName);

            // Create PDF document
            const doc = new PDFDocument({
                margin: 40
            });

            // Create write stream
            const stream = fs.createWriteStream(filePath);

            // Pipe PDF into file
            doc.pipe(stream);

            // =====================================
            // COMPANY HEADER
            // =====================================

            doc
                .fontSize(24)
                .text('EIRS TECHNOLOGY', {
                    align: 'center'
                });

            doc
                .fontSize(18)
                .text('INVOICE', {
                    align: 'center'
                });

            doc.moveDown(2);

            // =====================================
            // INVOICE DETAILS
            // =====================================

            doc.fontSize(12);

            doc.text(`Invoice Number: ${order.invoice?.invoiceNumber || 'N/A'}`);

            doc.text(`Order ID: ${order._id}`);

            doc.text(
                `Invoice Date: ${new Date(
                    order.invoice?.invoiceDate || new Date()
                ).toLocaleDateString('en-IN')}`
            );

            doc.moveDown();

            // =====================================
            // CUSTOMER DETAILS
            // =====================================

            doc
                .fontSize(14)
                .text('Customer Details');

            doc.moveDown(0.5);

            doc.fontSize(12);

            doc.text(`Name: ${order.shippingAddress?.fullName || 'N/A'}`);

            doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`);

            doc.text(`Email: ${order.shippingAddress?.email || 'N/A'}`);

            doc.text(`Address: ${order.shippingAddress?.address || 'N/A'}`);

            doc.moveDown(2);

            // =====================================
            // ORDER ITEMS
            // =====================================

            doc
                .fontSize(14)
                .text('Order Items');

            doc.moveDown();

            if (order.items && order.items.length > 0) {

                order.items.forEach((item, index) => {

                    const quantity = item.quantity || 1;

                    const price = item.price || 0;

                    const total = quantity * price;

                    doc
                        .fontSize(12)
                        .text(`${index + 1}. ${item.productName || 'Product'}`);

                    doc.text(
                        `Qty: ${quantity} × ₹${price} = ₹${total}`
                    );

                    doc.moveDown();
                });

            } else {

                doc.text('No items found');

            }

            // =====================================
            // TOTAL AMOUNT
            // =====================================

            doc.moveDown();

            doc
                .fontSize(16)
                .text(
                    `Grand Total: ₹${order.totalPrice || 0}`,
                    {
                        align: 'right'
                    }
                );

            doc.moveDown(2);

            // =====================================
            // FOOTER
            // =====================================

            doc
                .fontSize(10)
                .text(
                    'Thank you for shopping with EIRS Technology',
                    {
                        align: 'center'
                    }
                );

            // Finish PDF
            doc.end();

            // Wait until file fully saved
            stream.on('finish', () => {

                console.log('Invoice generated successfully:', filePath);

                const publicUrl = `/invoices/${fileName}`;

                resolve(publicUrl);
            });

            // Handle stream error
            stream.on('error', (err) => {

                console.error('Invoice stream error:', err);

                reject(err);
            });

        } catch (error) {

            console.error('generateBill error:', error);

            reject(error);
        }
    });
};

module.exports = {
    generateBill
};