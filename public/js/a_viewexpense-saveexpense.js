const saveBtn = document.getElementById("save-btn");
const { jsPDF } = window.jspdf;

const PDF_SIZE = {
  width: 210,
  height: 297,
};

const LAYOUT = {
  left: 30,
  right: 180,
  blue: [0, 155, 219],
  darkBlue: [0, 80, 180],
  gray: [130, 130, 130],
  lightGray: [220, 220, 220],
};

const PAYMENT_TYPES = {
  CREDIT_CARD: "Church Credit Card",
  REIMBURSEMENT: "Reimbursement",
  INVOICE: "Invoice",
};

function formatDateForDisplay(dateString) {
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${month}/${day}/${year}`;
}

function formatDateForFileName(displayDate) {
  const [month, day, year] = displayDate.split("/");
  return `${year}.${month}.${day}`;
}

function safeFileText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
}

function centerTextInBox(pdf, text, x, y, width) {
  const textWidth = pdf.getTextWidth(text);
  pdf.text(text, x + width / 2 - textWidth / 2, y);
}

function drawHeader(pdf, data) {
  const employeeName = `${data.User.first_name} ${data.User.last_name}`;

  pdf.setFillColor(...LAYOUT.blue);
  pdf.rect(30, 30, PDF_SIZE.width - 60, 7, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text(employeeName, 32, 35);

  pdf.setTextColor(...LAYOUT.gray);
  pdf.setFontSize(20);
  pdf.setFont(undefined, "bold");
  pdf.text("Expense Entry", 32, 45);

  pdf.setTextColor(10, 10, 10);
  pdf.setFont(undefined, "normal");
  pdf.setFontSize(13);
  pdf.text("#", 145, 44);

  const idText = String(data.id);
  pdf.text(idText, 178 - pdf.getTextWidth(idText), 44);

  pdf.setLineWidth(0.4);
  pdf.line(30, 48, 180, 48);

  return employeeName;
}

function drawPurchaseDate(pdf, data) {
  const displayDate = formatDateForDisplay(data.date_expense);

  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");
  pdf.setTextColor(0, 0, 0);

  pdf.text("Purchase Date", 122, 55.8);

  // white box with black border
  pdf.rect(151, 49.8, 29, 9.2);

  // black text
  pdf.setFontSize(12);
  pdf.setFont(undefined, "normal");
  pdf.text(String(displayDate), 153.3, 56.2);

  return displayDate;
}

function drawVendor(pdf, data) {
  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");
  pdf.text("Vendor/Payee Name", 38, 68);

  pdf.rect(77, 61, 103, 12);

  pdf.setFontSize(14);
  pdf.setFont(undefined, "normal");
  centerTextInBox(pdf, data.vendor, 77, 68.5, 103);
}

function shouldShowAddress(data) {
  return data.expense_type === PAYMENT_TYPES.REIMBURSEMENT;
}

function drawAddress(pdf, data) {
  if (!shouldShowAddress(data)) return 0;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");
  pdf.text("Address", 38, 83);

  pdf.rect(77, 76, 103, 12);

  pdf.setFontSize(12);
  pdf.setFont(undefined, "normal");
  centerTextInBox(pdf, data.address ?? "", 77, 83.5, 103);

  return 15; // amount to push everything below down
}

function drawX(pdf, x, y) {
  pdf.line(x, y, x + 4, y + 4);
  pdf.line(x, y + 4, x + 4, y);
}

function drawPaymentType(pdf, data, yOffset = 0) {
  pdf.setFontSize(11);
  pdf.setFont(undefined, "bold");
  pdf.text("Payment Type", 43, 93.5 + yOffset);

  pdf.rect(77, 77 + yOffset, 10, 30);
  pdf.line(77, 87 + yOffset, 87, 87 + yOffset);
  pdf.line(77, 97 + yOffset, 87, 97 + yOffset);

  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");

  pdf.text("Church Credit Card", 90, 83.5 + yOffset);
  pdf.text("Write Check to Payee named above", 90, 93.5 + yOffset);
  pdf.text("Write Check to Vendor named above", 90, 103.5 + yOffset);

  const cardLabelWidth = pdf.getTextWidth("Church Credit Card");
  const holderBoxX = 93 + cardLabelWidth;
  const holderBoxWidth = 180 - holderBoxX;

  pdf.rect(holderBoxX, 77 + yOffset, holderBoxWidth, 10);

  if (data.expense_type === PAYMENT_TYPES.CREDIT_CARD) {
    drawX(pdf, 80, 80 + yOffset);

    pdf.setFontSize(12);
    centerTextInBox(
      pdf,
      data.credit_card_holder ?? "",
      holderBoxX,
      83.7 + yOffset,
      holderBoxWidth
    );
  } else if (data.expense_type === PAYMENT_TYPES.REIMBURSEMENT) {
    drawX(pdf, 80, 90 + yOffset);
  } else {
    drawX(pdf, 80, 100 + yOffset);
  }
}

function splitTextToWidth(pdf, text, width) {
  return pdf.splitTextToSize(String(text ?? ""), width);
}

function drawExpenseTable(pdf, expenseDefiners, yOffset = 0) {
  const startY = 110 + yOffset;
  const rowHeight = 6;
  const descWidth = 106;

  pdf.line(30, startY, 180, startY);
  pdf.line(30, startY + 6, 180, startY + 6);

  pdf.setFontSize(10);
  pdf.text("Total Price", 160, 114 + yOffset);

  pdf.setTextColor(...LAYOUT.darkBlue);
  pdf.text("Line #", 35, 114 + yOffset);

  pdf.setFont(undefined, "bold");
  pdf.text("Description", 52, 114 + yOffset);

  pdf.setFont(undefined, "normal");
  pdf.setTextColor(0, 0, 0);

  let currentY = 120 + yOffset;

  expenseDefiners.forEach((definer, index) => {
    const descriptionLines = splitTextToWidth(
      pdf,
      definer.business_purpose,
      descWidth
    );

    const rowBlockHeight = descriptionLines.length * rowHeight;

    if (index % 2 === 1) {
      pdf.setFillColor(...LAYOUT.lightGray);
      pdf.rect(30, currentY - 4, 150, rowBlockHeight, "F");
    }

    pdf.text(String(definer.ExpenseNumber.number), 35, currentY);

    descriptionLines.forEach((line, lineIndex) => {
      pdf.text(line, 52, currentY + lineIndex * rowHeight);
    });

    pdf.text(`$${definer.amount}`, 160, currentY);

    currentY += rowBlockHeight;
  });

  const bottomY = currentY - 4;

  pdf.setLineDashPattern([1, 1], 0);
  pdf.line(50, 116 + yOffset, 50, bottomY);
  pdf.setLineDashPattern([], 0);

  pdf.line(30, bottomY, 180, bottomY);

  return bottomY;
}

function drawTotal(pdf, data, bottomY) {
  pdf.line(140, bottomY + 10, 180, bottomY + 10);

  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`$${data.amount}`, 145, bottomY + 8);

  pdf.setTextColor(...LAYOUT.darkBlue);
  pdf.text("Purchase Total", 96, bottomY + 8);

  pdf.setTextColor(0, 0, 0);
}

async function imageElementToJpegBlob(imgElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;

  ctx.drawImage(imgElement, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.275);
  });
}

async function addImagesToPdf(pdf, imgElements) {
  for (const imgElement of imgElements) {
    const blob = await imageElementToJpegBlob(imgElement);
    const blobUrl = URL.createObjectURL(blob);

    pdf.addPage();
    pdf.addImage(blobUrl, "JPEG", 0, 0, PDF_SIZE.width, PDF_SIZE.height);

    URL.revokeObjectURL(blobUrl);
  }
}

async function mergeAttachedPdfs(basePdfBytes, pdfButtons) {
  const mergedPdf = await PDFLib.PDFDocument.load(basePdfBytes);

  for (const pdfButton of pdfButtons) {
    const pdfUrl = pdfButton.getAttribute("data-url");
    if (!pdfUrl) continue;

    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );

    const existingPdf = await PDFLib.PDFDocument.load(existingPdfBytes);
    const copiedPages = await mergedPdf.copyPages(
      existingPdf,
      existingPdf.getPageIndices()
    );

    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

function downloadPdf(pdfBytes, fileName) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

function buildFileName(data, employeeName, displayDate) {
  const formattedDate = formatDateForFileName(displayDate);

  return `${formattedDate}-${safeFileText(employeeName)}-${safeFileText(
    data.vendor
  )}-$${data.amount}.pdf`;
}

async function saveExpensePdf() {
  try {
    const data = global_expenseData.data;

    const pdf = new jsPDF();

    const employeeName = drawHeader(pdf, data);
    const displayDate = drawPurchaseDate(pdf, data);

    drawVendor(pdf, data);

    const addressOffset = drawAddress(pdf, data);

    drawPaymentType(pdf, data, addressOffset);

    const bottomY = drawExpenseTable(
        pdf,
        data.ExpenseDefiners,
        addressOffset
    );

    drawTotal(pdf, data, bottomY);

    const imgElements = document.getElementsByClassName("photo");
    await addImagesToPdf(pdf, imgElements);

    const summaryPdfBytes = pdf.output("arraybuffer");

    const pdfElements = document.getElementsByClassName("pdf");
    const finalPdfBytes = await mergeAttachedPdfs(summaryPdfBytes, pdfElements);

    const fileName = buildFileName(data, employeeName, displayDate);
    downloadPdf(finalPdfBytes, fileName);

    console.log("PDF successfully generated and saved!");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

saveBtn.addEventListener("click", saveExpensePdf);