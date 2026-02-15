const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (order, farmer, buyer, product) => {
    return new Promise((resolve, reject) => {
        try {
            const invoiceDir = path.join(__dirname, '../uploads/invoices');
            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            const fileName = `invoice_${order.order_number}.pdf`;
            const filePath = path.join(invoiceDir, fileName);
            const doc = new PDFDocument({ margin: 50 });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).fillColor('#2E7D32').text('FarmerConnect', { align: 'center' });
            doc.fontSize(10).fillColor('#666').text('Agricultural B2B Trading Platform', { align: 'center' });
            doc.moveDown();
            doc.strokeColor('#2E7D32').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Invoice Details
            doc.fontSize(16).fillColor('#333').text('TAX INVOICE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).fillColor('#666');
            doc.text(`Invoice No: ${order.order_number}`, 50);
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 50);
            doc.text(`Transaction ID: ${order.transaction_id || 'Pending'}`, 50);
            doc.moveDown();

            // Two column layout for seller/buyer
            const startY = doc.y;
            doc.fontSize(11).fillColor('#2E7D32').text('SELLER DETAILS', 50);
            doc.fontSize(10).fillColor('#333');
            doc.text(`Name: ${farmer.name}`, 50);
            doc.text(`Location: ${farmer.city}, ${farmer.state}`, 50);
            doc.text(`Farm Size: ${farmer.farm_size} acres`, 50);

            doc.fontSize(11).fillColor('#2E7D32').text('BUYER DETAILS', 300, startY);
            doc.fontSize(10).fillColor('#333');
            doc.text(`Business: ${buyer.business_name}`, 300);
            doc.text(`Type: ${buyer.business_type}`, 300);
            doc.text(`GST: ${buyer.gst_number || 'N/A'}`, 300);
            doc.moveDown(2);

            // Item table
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            const tableTop = doc.y + 10;
            doc.fontSize(10).fillColor('#2E7D32');
            doc.text('Item', 50, tableTop);
            doc.text('Quality', 200, tableTop);
            doc.text('Qty (kg)', 280, tableTop);
            doc.text('Rate/kg', 360, tableTop);
            doc.text('Amount', 450, tableTop);

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            doc.fillColor('#333');
            const itemY = tableTop + 25;
            doc.text(product.name, 50, itemY);
            doc.text(product.quality_grade, 200, itemY);
            doc.text(parseFloat(order.quantity_kg).toFixed(2), 280, itemY);
            doc.text(`₹${parseFloat(order.price_per_kg).toFixed(2)}`, 360, itemY);
            doc.text(`₹${parseFloat(order.total_amount).toFixed(2)}`, 450, itemY);

            doc.moveTo(50, itemY + 20).lineTo(550, itemY + 20).stroke();

            // Totals
            const totalsY = itemY + 35;
            doc.text('Subtotal:', 360, totalsY);
            doc.text(`₹${parseFloat(order.total_amount).toFixed(2)}`, 450, totalsY);

            doc.text('Platform Commission (5%):', 320, totalsY + 15);
            doc.text(`₹${parseFloat(order.commission_amount).toFixed(2)}`, 450, totalsY + 15);

            doc.fillColor('#2E7D32').fontSize(11);
            const farmerEarnings = parseFloat(order.total_amount) - parseFloat(order.commission_amount);
            doc.text('Farmer Earnings:', 340, totalsY + 35);
            doc.text(`₹${farmerEarnings.toFixed(2)}`, 450, totalsY + 35);

            // Footer
            doc.fontSize(9).fillColor('#666');
            doc.text('Thank you for using FarmerConnect!', 50, 700, { align: 'center' });
            doc.text('Connecting Farmers Directly with Buyers', { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                resolve(`/uploads/invoices/${fileName}`);
            });

            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoice };
