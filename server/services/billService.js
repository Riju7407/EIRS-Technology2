const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const downloadImage = async (url, filepath) => {
  const response = await axios({ url, method: "GET", responseType: "stream" });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filepath);
    response.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const generateBill = async (order) => {
  return new Promise(async (resolve, reject) => {
    const tempImages = [];

    try {
      const invoicesDir = path.resolve(process.cwd(), "invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice_${order._id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const colors = {
        primary: "#0f172a",
        secondary: "#0f766e",
        border: "#e2e8f0",
        text: "#334155",
        muted: "#64748b",
        light: "#f8fafc",
      };

      // ================= HEADER =================

      const logoPath = path.join(process.cwd(), "public", "EIRSLogo.png");

      // LOGO
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, {
          width: 55,
          height: 55,
        });
      }

      // COMPANY NAME
      doc
        .fillColor(colors.primary)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("EIRS TECHNOLOGY", 110, 40);

      // EMAIL
      doc
        .fontSize(9)
        .fillColor(colors.muted)
        .text("info@eirstechnology.com", 110, 65);

      // TITLE
      doc
        .fontSize(18)
        .fillColor(colors.secondary)
        .text("TAX INVOICE", 400, 40, { align: "right" });

      // LINE
      doc
        .moveTo(40, 100)
        .lineTo(555, 100)
        .strokeColor(colors.border)
        .stroke();

      // ================= INVOICE INFO =================

      const invoiceNumber =
        order.invoice?.invoiceNumber || `INV-${Date.now()}`;
      const date = new Date().toLocaleDateString("en-IN");

      doc
        .fontSize(10)
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .text("Invoice No:", 40, 120)
        .font("Helvetica")
        .text(invoiceNumber, 120, 120);

      doc
        .font("Helvetica-Bold")
        .text("Order ID:", 40, 140)
        .font("Helvetica")
        .text(String(order._id), 120, 140);

      doc
        .font("Helvetica-Bold")
        .text("Date:", 40, 160)
        .font("Helvetica")
        .text(date, 120, 160);

      // ================= CUSTOMER DETAILS =================

      const customer = order.shippingAddress || {};

      doc
        .roundedRect(40, 185, 515, 90, 5)
        .fillAndStroke("#f8fafc", colors.border);

      doc
        .fillColor(colors.primary)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("CUSTOMER DETAILS", 50, 195);

      doc.fillColor(colors.text).fontSize(9).font("Helvetica");

      doc.text(`Name: ${customer.fullName || "-"}`, 50, 215);
      doc.text(`Phone: ${customer.phone || "-"}`, 50, 230);
      doc.text(`Email: ${customer.email || "-"}`, 50, 245);

      doc.text(`Address: ${customer.address || "-"}`, 300, 215, {
        width: 240,
      });

      doc.text(
        `${customer.city || ""}, ${customer.state || ""} - ${
          customer.zipCode || ""
        }`,
        300,
        240,
        { width: 240 }
      );

      // ================= TABLE HEADER =================

      let y = 290;

      doc
        .rect(40, y, 515, 25)
        .fill(colors.primary)
        .fillColor("white")
        .fontSize(9)
        .font("Helvetica-Bold");

      doc.text("Product", 50, y + 8);
      doc.text("HSN", 220, y + 8);
      doc.text("Qty", 290, y + 8);
      doc.text("Rate", 350, y + 8);
      doc.text("Discount", 410, y + 8);
      doc.text("Total", 480, y + 8);

      y += 35;

      // ================= PRODUCTS =================

      for (const item of order.items) {
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const discount = Number(item.discount || 0);

        const discountedPrice = price - (price * discount) / 100;
        const total = discountedPrice * qty;

        doc.fillColor(colors.text).font("Helvetica").fontSize(9);

        doc.text(item.productName || "-", 50, y, { width: 160 });
        doc.text(item.hsn || "N/A", 220, y);
        doc.text(String(qty), 290, y);
        doc.text(price.toFixed(2), 350, y);
        doc.text(`${discount}%`, 410, y);
        doc.text(total.toFixed(2), 480, y);

        doc
          .moveTo(40, y + 18)
          .lineTo(555, y + 18)
          .strokeColor(colors.border)
          .stroke();

        y += 28;
      }

      // ================= TOTAL =================

      const subtotal = Number(order.totalPrice || 0);
      const gst = subtotal - subtotal / 1.18;

      y += 20;

      doc.rect(300, y, 255, 90).fill(colors.light);

      doc.fillColor(colors.text).fontSize(10);

      doc.text("Taxable Value:", 320, y + 15);
      doc.text(money(subtotal - gst), 470, y + 15);

      doc.text("GST (18%):", 320, y + 35);
      doc.text(money(gst), 470, y + 35);

      doc
        .moveTo(310, y + 55)
        .lineTo(540, y + 55)
        .stroke();

      doc
        .fontSize(12)
        .fillColor(colors.secondary)
        .font("Helvetica-Bold")
        .text("Grand Total:", 320, y + 65);

      doc.text(money(subtotal), 470, y + 65);

      doc.end();

      stream.on("finish", () => {
        tempImages.forEach((img) => {
          if (fs.existsSync(img)) fs.unlinkSync(img);
        });

        resolve(`/invoices/${fileName}`);
      });

      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateBill };