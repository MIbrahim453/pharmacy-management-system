import PDFDocument from "pdfkit";

function formatDate(dateVal) {
  if (!dateVal) return "N/A";
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return "N/A";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}

function formatTime(dateVal) {
  if (!dateVal) return "N/A";
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return "N/A";

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function numberToWords(num) {
  if (num === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const scales = ["", "Hundred", "Thousand", "Million"];

  function convertHelper(n) {
    if (n < 20) return ones[n];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " and " + convertHelper(n % 100) : "")
    );
  }

  const parts = [];
  let scaleIndex = 0;
  let integerPart = Math.floor(num);
  let decimalPart = Math.round((num - integerPart) * 100);

  while (integerPart > 0) {
    let divisor = 1000;
    if (scaleIndex === 0) {
      divisor = 100;
    } else if (scaleIndex === 1) {
      divisor = 10;
    }
    const chunk = integerPart % divisor;
    if (chunk > 0) {
      const chunkStr = convertHelper(chunk);
      parts.unshift(
        chunkStr + (scales[scaleIndex] ? " " + scales[scaleIndex] : ""),
      );
    }
    integerPart = Math.floor(integerPart / divisor);
    scaleIndex++;
  }

  let words = "";
  if (
    parts.length > 1 &&
    !parts[parts.length - 1].includes("Hundred") &&
    !parts[parts.length - 1].includes("Thousand") &&
    !parts[parts.length - 1].includes("Million")
  ) {
    const lastPart = parts.pop();
    words = parts.join(" ") + " and " + lastPart + " Rupees";
  } else {
    words = parts.join(" ") + " Rupees";
  }

  if (decimalPart > 0) {
    words += " and " + convertHelper(decimalPart) + " Paisas";
  }
  words += " Only";
  return words;
}

const drawLocationIcon = (doc, x, y) => {
  doc.save();
  doc.translate(x, y);
  doc.circle(4, 4, 2.5).lineWidth(0.8).stroke("#333333");
  doc.circle(4, 4, 0.8).fill("#333333");
  doc
    .moveTo(1.7, 5.2)
    .lineTo(4, 9.5)
    .lineTo(6.3, 5.2)
    .lineWidth(0.8)
    .stroke("#333333");
  doc.restore();
};

const drawPhoneIcon = (doc, x, y) => {
  doc.save();
  doc.translate(x, y);
  doc.roundedRect(1.5, 0.5, 5, 9, 1.2).lineWidth(0.8).stroke("#333333");
  doc.moveTo(3.2, 1.2).lineTo(4.8, 1.2).lineWidth(0.4).stroke("#333333");
  doc.rect(2.2, 2.2, 3.6, 5.2).lineWidth(0.4).stroke("#333333");
  doc.circle(4, 8.5, 0.4).fill("#333333");
  doc.restore();
};

const drawEmailIcon = (doc, x, y) => {
  doc.save();
  doc.translate(x, y);
  doc.rect(0.5, 1.5, 8, 5.5).lineWidth(0.8).stroke("#333333");
  doc
    .moveTo(0.5, 1.8)
    .lineTo(4.5, 4.5)
    .lineTo(8.5, 1.8)
    .lineWidth(0.8)
    .stroke("#333333");
  doc.restore();
};

const drawCheckbox = (doc, x, y, label, checked = false) => {
  doc.save();
  doc.rect(x, y, 8, 8).lineWidth(0.8).stroke("#333333");
  if (checked) {
    doc
      .moveTo(x + 1.5, y + 4.2)
      .lineTo(x + 3.2, y + 6.2)
      .lineTo(x + 6.8, y + 1.8)
      .lineWidth(1)
      .stroke("#111111");
  }
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#333333")
    .text(label, x + 12, y - 0.5);
  doc.restore();
};

function drawTable(doc, items, startX, startY, pageNum, itemsPerPage) {
  const headerHeight = 25;
  const rowHeight = 22;
  const rowCount = pageNum === 1 ? Math.max(items.length, 5) : items.length;
  const tableHeight = headerHeight + rowCount * rowHeight;

  doc.rect(startX, startY, 525, headerHeight).lineWidth(0.8).stroke("#000000");

  const cols = [
    { name: "S. NO.", x: startX, width: 35, align: "center" },
    { name: "MEDICINE NAME", x: startX + 35, width: 320, align: "left" },
    { name: "QTY.", x: startX + 355, width: 40, align: "center" },
    { name: "UNIT PRICE", x: startX + 395, width: 65, align: "right" },
    { name: "TOTAL PRICE", x: startX + 460, width: 65, align: "right" },
  ];

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#000000");

  cols.forEach((col) => {
    doc.text(col.name, col.x, startY + 8.5, {
      width: col.width,
      align: col.align,
    });
  });

  doc.font("Helvetica").fontSize(8).fillColor("#333333");

  for (let i = 0; i < rowCount; i++) {
    const itemY = startY + headerHeight + i * rowHeight;
    const item = items[i];

    doc
      .moveTo(startX, itemY + rowHeight)
      .lineTo(startX + 525, itemY + rowHeight)
      .lineWidth(0.5)
      .stroke("#cccccc");

    if (item) {
      const sNo = (pageNum - 1) * itemsPerPage + i + 1;
      const name = item.name || "N/A";
      const qty = item.qty || 0;
      const price = Number(item.price || 0);
      const total = Number(item.total || qty * price);

      doc.text(String(sNo), cols[0].x, itemY + 7, {
        width: cols[0].width,
        align: cols[0].align,
      });

      doc.font("Helvetica-Bold").fillColor("#000000");
      doc.text(name, cols[1].x + 4, itemY + 7, {
        width: cols[1].width - 8,
        height: 14,
        ellipsis: true,
      });
      doc.font("Helvetica").fillColor("#333333");

      doc.text(String(qty), cols[2].x, itemY + 7, {
        width: cols[2].width,
        align: cols[2].align,
      });
      doc.text(price.toFixed(2), cols[3].x - 4, itemY + 7, {
        width: cols[3].width,
        align: cols[3].align,
      });
      doc.text(total.toFixed(2), cols[4].x - 4, itemY + 7, {
        width: cols[4].width,
        align: cols[4].align,
      });
    }
  }

  doc
    .rect(startX, startY + headerHeight, 525, rowCount * rowHeight)
    .lineWidth(0.8)
    .stroke("#000000");

  cols.slice(1).forEach((col) => {
    doc
      .moveTo(col.x, startY)
      .lineTo(col.x, startY + tableHeight)
      .lineWidth(0.5)
      .stroke("#000000");
  });
}

function drawBottomSection(doc, invoice, startY) {
  const totalBoxY = startY + 10;
  const totalBoxWidth = 220;
  const totalBoxHeight = 70;
  const totalBoxX = 340;

  doc
    .rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight)
    .lineWidth(0.8)
    .stroke("#000000");

  const subY = totalBoxY + 8;
  const discY = totalBoxY + 21;
  const grandY = totalBoxY + 34;
  const payY = totalBoxY + 47;

  doc
    .moveTo(totalBoxX, discY - 3)
    .lineTo(totalBoxX + totalBoxWidth, discY - 3)
    .lineWidth(0.5)
    .stroke("#cccccc");
  doc
    .moveTo(totalBoxX, grandY - 3)
    .lineTo(totalBoxX + totalBoxWidth, grandY - 3)
    .lineWidth(0.8)
    .stroke("#000000");
  doc
    .moveTo(totalBoxX, payY - 3)
    .lineTo(totalBoxX + totalBoxWidth, payY - 3)
    .lineWidth(0.5)
    .stroke("#000000");

  doc.font("Helvetica").fontSize(8.5).fillColor("#333333");

  doc.text("SUBTOTAL", totalBoxX + 10, subY);
  doc.text("DISCOUNT", totalBoxX + 10, discY);

  doc.font("Helvetica-Bold").fillColor("#000000");
  doc.text("GRAND TOTAL", totalBoxX + 10, grandY);
  doc.text("AMOUNT PAYABLE", totalBoxX + 10, payY);

  doc
    .font("Helvetica")
    .text(invoice.subtotal.toFixed(2), totalBoxX + 10, subY, {
      width: totalBoxWidth - 20,
      align: "right",
    });
  doc.text(invoice.discount.toFixed(2), totalBoxX + 10, discY, {
    width: totalBoxWidth - 20,
    align: "right",
  });

  doc
    .font("Helvetica-Bold")
    .text(invoice.totalAmount.toFixed(2), totalBoxX + 10, grandY, {
      width: totalBoxWidth - 20,
      align: "right",
    });

  const formattedAmount = "Rs. " + invoice.totalAmount.toFixed(2);
  doc.text(formattedAmount, totalBoxX + 10, payY, {
    width: totalBoxWidth - 20,
    align: "right",
  });

  const leftX = 35;
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor("#000000")
    .text("PAYMENT METHOD:", leftX, totalBoxY);

  const method = invoice.paymentMethod.toLowerCase();
  drawCheckbox(doc, leftX, totalBoxY + 12, "Cash", method === "cash");
  drawCheckbox(doc, leftX + 55, totalBoxY + 12, "Card", method === "card");
  drawCheckbox(
    doc,
    leftX + 110,
    totalBoxY + 12,
    "Other",
    method !== "cash" && method !== "card",
  );

  doc.font("Helvetica-Bold").text("AMOUNT IN WORDS:", leftX, totalBoxY + 32);

  const amountWords = numberToWords(invoice.totalAmount);
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor("#555555")
    .text(amountWords, leftX, totalBoxY + 44, {
      width: 290,
      height: 24,
      ellipsis: true,
    });

  const lowerY = totalBoxY + totalBoxHeight + 10;
  const boxHeight = 65;

  const notesWidth = 525;
  doc
    .rect(leftX, lowerY, notesWidth, boxHeight)
    .lineWidth(0.8)
    .stroke("#000000");
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor("#000000")
    .text("IMPORTANT NOTES:", leftX + 10, lowerY + 8);

  doc.font("Helvetica").fontSize(8).fillColor("#333333");

  const customerNotes = [
    "• Please check your medicines before leaving.",
    "• No return/exchange on opened medicines.",
    "• Keep medicines out of reach of children.",
    "• This is a computer generated invoice.",
  ];

  customerNotes.forEach((note, idx) => {
    const colWidth = 240;
    const isCol2 = idx >= 2;
    const colX = isCol2 ? leftX + 270 : leftX + 10;
    const noteY = lowerY + 24 + (idx % 2) * 16;
    doc.text(note, colX, noteY, { width: colWidth });
  });
}

const generateInvoicePdf = async (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 30,
        autoFirstPage: false,
      });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", (err) => reject(err));

      // Extract data from invoice object
      const pharmacy = {
        name: invoiceData?.pharmacyId?.pharmacyName || "N/A",
        address: invoiceData?.pharmacyId?.address || "N/A",
        phone: invoiceData?.pharmacyId?.phone || "N/A",
        email: invoiceData?.pharmacyId?.email || "N/A",
      };

      const customer = {
        name: invoiceData?.customerName || "N/A",
        phone: invoiceData?.customerPhone || "N/A",
        address: invoiceData?.customerAddress || "N/A",
      };

      const staff = {
        name: invoiceData?.createdBy?.name || "N/A",
        counter: invoiceData?.createdBy?.staffCounter || "N/A",
      };

      const invoice = {
        number: invoiceData?.invoiceNumber || "N/A",
        date: invoiceData?.createdAt || new Date(),
        paymentMethod: invoiceData?.paymentMethod || "Cash",
        subtotal: Number(invoiceData?.subTotal || invoiceData?.subtotal || 0),
        discount: Number(invoiceData?.discount || 0),
        totalAmount: Number(invoiceData?.grandTotal || invoiceData?.amount || 0),
        status: invoiceData?.paymentStatus || "Unpaid",
      };

      const dateStr = formatDate(invoice.date);
      const timeStr = formatTime(invoice.date);

      const itemsList = (invoiceData?.items || []).map((item) => ({
        name: item?.medicineName || "N/A",
        batchNo: item?.batchNumber || "—",
        expiryDate: item?.expiryDate || "—",
        qty: item?.quantity || 0,
        price: Number(item?.unitPrice || 0),
        total: Number(item?.total || 0),
      }));

      const itemsPerPage = 12;
      const totalPages = Math.ceil(itemsList.length / itemsPerPage) || 1;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        doc.addPage();

        // Page border
        doc.rect(25, 25, 545.28, 791.89).lineWidth(1.2).stroke("#000000");

        // Footer area
        doc.moveTo(35, 785).lineTo(560, 785).lineWidth(0.8).stroke("#cccccc");
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#555555")
          .text("Stay Healthy, Stay Happy", 35, 792, {
            align: "center",
            width: 525,
          });
        doc.moveTo(35, 804).lineTo(560, 804).lineWidth(0.8).stroke("#cccccc");

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#555555")
          .text(`Page ${pageNum} of ${totalPages}`, 500, 792, {
            align: "right",
          });

        // Continued pages header
        if (pageNum > 1) {
          doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .fillColor("#000000")
            .text("INVOICE (Continued)", 35, 40);

          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#333333")
            .text(`Invoice No: ${invoice.number}`, 35, 58)
            .text(`Date: ${dateStr}`, 35, 70);

          doc.moveTo(35, 82).lineTo(560, 82).lineWidth(1).stroke("#cccccc");

          const pageItems = itemsList.slice(
            (pageNum - 1) * itemsPerPage,
            pageNum * itemsPerPage,
          );
          drawTable(doc, pageItems, 35, 95, pageNum, itemsPerPage);

          if (pageNum === totalPages) {
            const tableEndY = 95 + 25 + pageItems.length * 22;
            drawBottomSection(doc, invoice, tableEndY);
          }
          continue;
        }

        // First page header with logo
        doc.circle(70, 70, 28).fill("#111111");
        doc.rect(66, 52, 8, 36).fill("#ffffff");
        doc.rect(52, 66, 36, 8).fill("#ffffff");
        doc.circle(70, 70, 7).fill("#111111");

        // Pharmacy name and details
        doc
          .font("Helvetica-Bold")
          .fontSize(17)
          .fillColor("#000000")
          .text(pharmacy.name, 115, 38);

        drawLocationIcon(doc, 115, 74);
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor("#333333")
          .text(pharmacy.address, 128, 74);

        drawPhoneIcon(doc, 115, 88);
        doc.font("Helvetica").fontSize(8.5).text(pharmacy.phone, 128, 88);

        drawEmailIcon(doc, 115, 102);
        doc.font("Helvetica").fontSize(8.5).text(pharmacy.email, 128, 102);

        // Invoice title section
        doc.moveTo(395, 32).lineTo(395, 122).lineWidth(0.8).stroke("#cccccc");

        doc
          .font("Helvetica-Bold")
          .fontSize(22)
          .fillColor("#000000")
          .text("INVOICE", 410, 36);

        doc.font("Helvetica").fontSize(9).fillColor("#333333");

        doc.text("Invoice No  :", 410, 68);
        doc.text("Invoice Date:", 410, 83);
        doc.text("Time        :", 410, 98);

        doc
          .font("Helvetica-Bold")
          .text(invoice.number, 475, 68)
          .text(dateStr, 475, 83)
          .text(timeStr, 475, 98);

        // Bill To section
        const boxY = 135;
        const boxHeight = 85;

        doc.rect(35, boxY, 255, boxHeight).lineWidth(0.8).stroke("#000000");
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor("#000000")
          .text("BILL TO:", 43, boxY + 8);

        doc.font("Helvetica").fontSize(8.5).fillColor("#333333");

        doc.text("Customer Name :", 43, boxY + 25);
        doc.text("Phone         :", 43, boxY + 41);
        doc.text("Address       :", 43, boxY + 57);

        doc
          .font("Helvetica-Bold")
          .text(customer.name, 120, boxY + 25)
          .text(customer.phone, 120, boxY + 41);

        doc
          .font("Helvetica")
          .text(customer.address, 120, boxY + 57, {
            width: 160,
            height: 24,
            ellipsis: true,
          });

        // Dispensed By section
        doc.rect(305, boxY, 255, boxHeight).lineWidth(0.8).stroke("#000000");
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor("#000000")
          .text("DISPENSED BY:", 313, boxY + 8);

        doc.font("Helvetica").fontSize(8.5).fillColor("#333333");

        doc.text("Staff Name :", 313, boxY + 25);
        doc.text("Counter    :", 313, boxY + 41);

        doc
          .font("Helvetica-Bold")
          .text(staff.name, 385, boxY + 25)
          .text(staff.counter, 385, boxY + 41);

        // Items table
        const tableY = boxY + boxHeight + 15;
        const firstPageItems = itemsList.slice(0, itemsPerPage);

        drawTable(doc, firstPageItems, 35, tableY, pageNum, itemsPerPage);

        // Bottom section with totals
        if (pageNum === totalPages) {
          const tableEndY =
            tableY + 25 + Math.max(firstPageItems.length, 5) * 22;
          drawBottomSection(doc, invoice, tableEndY);
        }
      }

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

export { generateInvoicePdf, generateInvoicePdf as generateInvoice };
