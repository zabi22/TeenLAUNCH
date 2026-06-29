import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

export function generateResume(data: any): PassThrough {
  const doc = new PDFDocument({ margin: 50 });
  const stream = new PassThrough();

  doc.pipe(stream);

  doc.fontSize(20).text(data.name, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Email: ${data.email}`);
  doc.moveDown();
  doc.fontSize(14).text('Experience', { underline: true });
  doc.moveDown();
  
  data.items.forEach((item: any) => {
    doc.fontSize(12).text(`${item.title} - ${item.description}`);
    doc.moveDown(0.5);
  });

  doc.end();
  return stream;
}
