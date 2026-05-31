const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Helper to download external product images safely
const downloadImage = async (url, filepath) => {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filepath);
    response.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

const generateBill = async (order) => {
  return new Promise(async (resolve, reject) => {
    // Array to keep track of temp files for cleanup
    const tempImages = [];

    try {
      const invoicesDir = path.resolve(process.cwd(), "invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice_${order._id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // =========================================================================
      // DESIGN BRANDING CONFIGURATION (Modern Tech Theme)
      // =========================================================================
      const colors = {
        primary: "#1e293b",    // Slate/Deep Navy
        secondary: "#0f766e",  // Teal Accent
        textDark: "#334155",   // Charcoal body text
        textMuted: "#64748b",  // Cool grey
        bgLight: "#f8fafc",    // Soft light background
        border: "#e2e8f0",     // Clean border tone
      };

      // =========================================================================
      // HEADER SECTION
      // =========================================================================
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      let headerTextX = 40;

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 65 });
        headerTextX = 120; // Shift company text right if logo exists
      }

      // Company Info (Right-aligned layout balance)
      doc
        .fillColor(colors.primary)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("EIRS TECHNOLOGY", headerTextX, 42);

      doc
        .fillColor(colors.textMuted)
        .fontSize(9)
        .font("Helvetica")
        .text("Website: www.eirstechnology.com", headerTextX, 65, { lineGap: 2 })
        .text("Email: support@eirstechnology.com")
        .text("Phone: +91 XXXXX XXXXX");

      // Right Side Main Header Accent
      doc
        .fillColor(colors.secondary)
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 400, 40, { align: "right" });

      // Clean decorative divider line
      doc
        .moveTo(40, 105)
        .lineTo(555, 105)
        .lineWidth(1)
        .strokeColor(colors.border)
        .stroke();

      // =========================================================================
      // INVOICE METADATA BLOCK
      // =========================================================================
      const invoiceNumber = order.invoice?.invoiceNumber || `INV-${Date.now()}`;
      const invoiceDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Metadata Table Layout
      doc.fontSize(10).fillColor(colors.textDark);
      
      doc.font("Helvetica-Bold").text("Invoice No:", 40, 125);
      doc.font("Helvetica").text(invoiceNumber, 110, 125);

      doc.font("Helvetica-Bold").text("Order ID:", 40, 142);
      doc.font("Helvetica").text(String(order._id), 110, 142);

      doc.font("Helvetica-Bold").text("Date:", 40, 159);
      doc.font("Helvetica").text(invoiceDate, 110, 159);

      // =========================================================================
      // BILLING AND PAYMENT DETAILS CARDS
      // =========================================================================
      const cardY = 190;
      const cardHeight = 105;

      // Card 1: Bill To Client
      doc
        .roundedRect(40, cardY, 250, cardHeight, 6)
        .fillAndStroke(colors.bgLight, colors.border);

      doc
        .fillColor(colors.secondary)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Bill To", 52, cardY + 12);

      doc
        .fillColor(colors.textDark)
        .fontSize(9.5)
        .font("Helvetica")
        .text(order.shippingAddress?.fullName || "N/A", 52, cardY + 32, { lineGap: 3 })
        .text(order.shippingAddress?.phone || "")
        .text(order.shippingAddress?.email || "")
        .text(order.shippingAddress?.address || "", { width: 225 });

      // Card 2: Payment Details
      doc
        .roundedRect(305, cardY, 250, cardHeight, 6)
        .fillAndStroke(colors.bgLight, colors.border);

      doc
        .fillColor(colors.secondary)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Payment Info", 317, cardY + 12);

      doc.fontSize(9.5).fillColor(colors.textDark);
      
      doc.font("Helvetica-Bold").text("Method: ", 317, cardY + 32);
      doc.font("Helvetica").text(order.paymentMethod || "N/A", 370, cardY + 32);

      doc.font("Helvetica-Bold").text("Status: ", 317, cardY + 50);
      doc.font("Helvetica").text(order.paymentStatus || "N/A", 370, cardY + 50);

      doc.font("Helvetica-Bold").text("Txn ID: ", 317, cardY + 68);
      doc.font("Helvetica").text(order.razorpayPaymentId || "-", 370, cardY + 68, { width: 175 });

      // =========================================================================
      // DYNAMIC PRODUCT TABLE
      // =========================================================================
      let tableY = 320;

      // Table Header Row Style
      doc
        .roundedRect(40, tableY, 515, 26, 4)
        .fill(colors.primary);

      doc
        .fillColor("white")
        .fontSize(10)
        .font("Helvetica-Bold");

      doc.text("Product Details", 55, tableY + 8);
      doc.text("Qty", 330, tableY + 8, { width: 30, align: "center" });
      doc.text("Unit Price", 390, tableY + 8, { width: 65, align: "right" });
      doc.text("Total", 480, tableY + 8, { width: 65, align: "right" });

      tableY += 32; // Drop down into the table items space
      doc.fillColor(colors.textDark).font("Helvetica");

      // Draw Items Loops
      for (const item of order.items) {
        let imagePath = null;

        // Visual alternate subtle row lines background
        doc
          .moveTo(40, tableY + 45)
          .lineTo(555, tableY + 45)
          .lineWidth(0.5)
          .strokeColor(colors.border)
          .stroke();

        try {
          if (item.image) {
            imagePath = path.join(invoicesDir, `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`);
            await downloadImage(item.image, imagePath);
            tempImages.push(imagePath); // Track file path to delete later safely

            // Draw crisp modern item thumbnails
            doc.image(imagePath, 45, tableY + 5, {
              fit: [35, 35],
              align: "center",
              valign: "center"
            });
          }
        } catch (imageErr) {
          // If fallback images fail, skip rendering gracefully without crashing
        }

        // Product text columns placements
        const textXPos = item.image ? 95 : 55;
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(item.productName || "Product", textXPos, tableY + 14, { width: 220, ellipsis: true });

        doc
          .font("Helvetica")
          .text(item.quantity.toString(), 330, tableY + 14, { width: 30, align: "center" });

        doc.text(`₹${Number(item.price).toFixed(2)}`, 390, tableY + 14, { width: 65, align: "right" });
        
        const lineTotal = item.price * item.quantity;
        doc.text(`₹${lineTotal.toFixed(2)}`, 480, tableY + 14, { width: 65, align: "right" });

        tableY += 48; // Increment dynamic height per row
      }

      // =========================================================================
      // CALCULATION SUMMARIES BREAKDOWN BLOCK
      // =========================================================================
      const subtotal = Number(order.totalPrice) || 0;
      const gstRate = 0.18; // 18% GST
      const taxable = subtotal / (1 + gstRate);
      const gst = subtotal - taxable;

      tableY += 15;

      // Subtle Background box for calculation totals
      doc
        .roundedRect(305, tableY, 250, 85, 4)
        .fill(colors.bgLight);

      doc.fontSize(9.5).fillColor(colors.textDark);

      // Taxable Amount line
      doc.font("Helvetica").text("Taxable Value:", 320, tableY + 12);
      doc.text(`₹${taxable.toFixed(2)}`, 400, tableY + 12, { width: 140, align: "right" });

      // GST 18% Line
      doc.text("GST (18% Included):", 320, tableY + 30);
      doc.text(`₹${gst.toFixed(2)}`, 400, tableY + 30, { width: 140, align: "right" });

      // Bold Accent Grand total Row
      doc
        .moveTo(315, tableY + 50)
        .lineTo(545, tableY + 50)
        .lineWidth(1)
        .strokeColor(colors.border)
        .stroke();

      doc
        .fontSize(12)
        .fillColor(colors.secondary)
        .font("Helvetica-Bold")
        .text("Grand Total:", 320, tableY + 60);
      doc.text(`₹${subtotal.toFixed(2)}`, 400, tableY + 60, { width: 140, align: "right" });

      // =========================================================================
      // FOOTER SECTION
      // =========================================================================
      // Places footer neatly at the bottom baseline of A4 paper grid layout
      const footerY = 750;

      doc
        .moveTo(40, footerY)
        .lineTo(555, footerY)
        .lineWidth(0.5)
        .strokeColor(colors.border)
        .stroke();

      doc
        .fontSize(9)
        .fillColor(colors.textMuted)
        .font("Helvetica-Bold")
        .text("Thank you for shopping with EIRS Technology!", 40, footerY + 12, { align: "center" });

      doc
        .font("Helvetica-Oblique")
        .fontSize(8)
        .text("This is an electronically generated tax invoice. No signature is required.", 40, footerY + 26, { align: "center" });

      // Close document
      doc.end();

      // Handle stream resolution and wipe temp files securely
      stream.on("finish", () => {
        tempImages.forEach((imgFile) => {
          if (fs.existsSync(imgFile)) {
            fs.unlinkSync(imgFile);
          }
        });
        resolve(`/invoices/${fileName}`);
      });

      stream.on("error", (err) => {
        reject(err);
      });

    } catch (err) {
      // Emergency Cleanup logic to ensure disk remains healthy on runtime exceptions
      tempImages.forEach((imgFile) => {
        if (fs.existsSync(imgFile)) fs.unlinkSync(imgFile);
      });
      reject(err);
    }
  });
};

module.exports = {
  generateBill,
};