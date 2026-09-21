import PDFDocument from 'pdfkit';
import { IOrder } from '../models/Order.model.js';
import { Response } from 'express';

export const generateOrderPackingSlipPDF = (order: IOrder, res: Response): void => {
  const doc = new PDFDocument({ margin: 36, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=PackingSlip_${order.orderNumber}.pdf`);

  doc.pipe(res);

  // Header
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('DAKOTA GAS STATION & CONVENIENCE STORE', { align: 'center' });
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('123 Highway 10, Local Town • Phone: +1 (555) 019-2834', { align: 'center' })
    .moveDown(0.5);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#0284c7')
    .text(`ORDER PACKING SLIP: ${order.orderNumber}`, { align: 'center' })
    .fillColor('#000000')
    .moveDown(1);

  // Divider
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(36, doc.y).lineTo(559, doc.y).stroke().moveDown(1);

  // Order & Customer Details
  const startY = doc.y;
  doc
    .fontSize(10)
    .font('Helvetica-Bold').text('Customer Details:', 36, startY)
    .font('Helvetica')
    .text(`Name: ${order.customer.name}`)
    .text(`Phone: ${order.customer.phone}`)
    .text(`Address: ${order.customer.deliveryAddress}`)
    .text(`Instructions: ${order.customer.deliveryInstructions || 'None'}`);

  doc
    .font('Helvetica-Bold').text('Order Info:', 320, startY)
    .font('Helvetica')
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
    .text(`Fulfillment: ${order.fulfillmentType.toUpperCase()}`)
    .text(`Payment: ${order.paymentMethod.replace(/_/g, ' ').toUpperCase()}`)
    .text(`Status: ${order.status.toUpperCase()}`);

  doc.moveDown(2);

  // Items Table
  const tableTop = doc.y + 10;
  doc.font('Helvetica-Bold').text('Item', 36, tableTop);
  doc.text('Qty', 320, tableTop, { width: 50, align: 'center' });
  doc.text('Price', 400, tableTop, { width: 60, align: 'right' });
  doc.text('Total', 480, tableTop, { width: 70, align: 'right' });

  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(36, tableTop + 15).lineTo(559, tableTop + 15).stroke();

  let itemY = tableTop + 25;
  doc.font('Helvetica');
  order.items.forEach((item) => {
    doc.text(item.name, 36, itemY, { width: 270 });
    doc.text(item.quantity.toString(), 320, itemY, { width: 50, align: 'center' });
    doc.text(`$${item.price.toFixed(2)}`, 400, itemY, { width: 60, align: 'right' });
    doc.text(`$${item.totalPrice.toFixed(2)}`, 480, itemY, { width: 70, align: 'right' });
    itemY += 20;
  });

  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(36, itemY).lineTo(559, itemY).stroke();
  itemY += 15;

  // Financials
  doc.font('Helvetica').text('Subtotal:', 360, itemY, { width: 100, align: 'right' });
  doc.text(`$${order.subtotal.toFixed(2)}`, 480, itemY, { width: 70, align: 'right' });
  itemY += 15;

  doc.text('Taxes:', 360, itemY, { width: 100, align: 'right' });
  doc.text(`$${order.taxes.toFixed(2)}`, 480, itemY, { width: 70, align: 'right' });
  itemY += 15;

  if (order.fulfillmentType === 'delivery') {
    doc.text('Delivery Fee:', 360, itemY, { width: 100, align: 'right' });
    doc.text(`$${order.deliveryFee.toFixed(2)}`, 480, itemY, { width: 70, align: 'right' });
    itemY += 15;
  }

  if (order.tip > 0) {
    doc.text('Driver Tip:', 360, itemY, { width: 100, align: 'right' });
    doc.text(`$${order.tip.toFixed(2)}`, 480, itemY, { width: 70, align: 'right' });
    itemY += 15;
  }

  doc.font('Helvetica-Bold').fontSize(12).text('TOTAL CASH DUE:', 320, itemY + 5, { width: 140, align: 'right' });
  doc.fillColor('#059669').text(`$${order.total.toFixed(2)}`, 480, itemY + 5, { width: 70, align: 'right' });

  // Footer Note
  doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(
    'Please staple this packing slip to the delivery bag and collect exact cash upon arrival. Thank you!',
    36,
    itemY + 45,
    { align: 'center', width: 523 }
  );

  doc.end();
};