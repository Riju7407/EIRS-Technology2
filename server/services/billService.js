const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateBill = async (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();

            const fileName = `invoice_${order._id}.pdf`;
            const filePath = path.join(__dirname, `../invoices/${fileName}`);

            doc.pipe(fs.createWriteStream(filePath));

            // HEADER
            doc.fontSize(20).text("INVOICE", { align: "center" });
            doc.moveDown();

            // INVOICE INFO
            doc.fontSize(12).text(`Invoice No: ${order.invoice.invoiceNumber}`);
            doc.text(`Date: ${new Date(order.invoice.invoiceDate).toDateString()}`);
            doc.moveDown();

            // CUSTOMER INFO
            doc.text(`Customer: ${order.shippingAddress.fullName}`);
            doc.text(`Phone: ${order.shippingAddress.phone}`);
            doc.text(`Address: ${order.shippingAddress.address}`);
            doc.moveDown();

            // ITEMS
            doc.text("Items:");
            doc.moveDown();

            order.items.forEach((item, index) => {
                doc.text(
                    `${index + 1}. ${item.productName} x ${item.quantity} = ₹${item.price * item.quantity}`
                );
            });

            doc.moveDown();

            // TOTAL
            doc.fontSize(14).text(`Total: ₹${order.totalPrice}`);

            doc.end();

            resolve(`/invoices/${fileName}`);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateBill };