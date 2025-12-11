const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function exportToPDF(customers) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../exports', `customers_${Date.now()}.pdf`);
    
    // Ensure exports directory exists
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Customer List', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table setup
    const tableTop = 150;
    const itemHeight = 30;
    let y = tableTop;

    // Table headers
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('ID', 50, y, { width: 30 });
    doc.text('Name', 85, y, { width: 120 });
    doc.text('Email', 210, y, { width: 150 });
    doc.text('Phone', 365, y, { width: 100 });
    
    // Draw header line
    doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
    y += itemHeight;

    // Table content
    doc.font('Helvetica').fontSize(9);
    
    customers.forEach((customer, i) => {
      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const fullName = `${customer.first_name} ${customer.last_name}`;
      
      doc.text(customer.id, 50, y, { width: 30 });
      doc.text(fullName, 85, y, { width: 120 });
      doc.text(customer.email, 210, y, { width: 150 });
      doc.text(customer.phone, 365, y, { width: 100 });
      
      y += itemHeight;
      
      // Draw separator line
      if (i < customers.length - 1) {
        doc.moveTo(50, y - 15).lineTo(550, y - 15).stroke();
      }
    });

    // Footer
    doc.fontSize(8).text(
      `Total Customers: ${customers.length}`,
      50,
      y + 20,
      { align: 'center' }
    );

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { exportToPDF };