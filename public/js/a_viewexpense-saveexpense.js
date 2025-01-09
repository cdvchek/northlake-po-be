const se_paramsArr = window.location.href.split('_')[1].split('&');
const se_id = se_paramsArr[0].split('=')[1];
const se_saveBtn = document.getElementById('save-btn');
const { jsPDF } = window.jspdf;

const se_loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(new Error(`Failed to load image at ${url}: ${error.message}`));
    });
}

const se_convertImageToJPEG = (image) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', .275);  // Use 1.0 quality for minimal compression
    });
}

const se_addImagesToPDF = async (imageUrls, pdf, pdfWidth, pdfHeight, data) => {
    let loadPromises = imageUrls.map(url => se_loadImage(url).then(image => se_convertImageToJPEG(image)));
    try {
        const imageBlobs = await Promise.all(loadPromises);
        imageBlobs.forEach((blob) => {
            const url = URL.createObjectURL(blob);
            pdf.addPage();
            pdf.addImage(url, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            URL.revokeObjectURL(url);
        });
        const fileNameDate = `${data.date.slice(10, 14)}.${data.date.slice(0, 2)}.${data.date.slice(5, 7)}`;
        pdf.save(`${fileNameDate}-${data.name.split(' ').join('_')}-${data.vendor.split(' ').join('_')}-$${data.amount}.pdf`);
    } catch (error) {
        console.error("Error loading and converting images", error);
    }
}

const se_saveExpense = () => {
    const data = global_expenseData.data;
    console.log(data);

    // Define maximum dimensions for the image on the PDF
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Create PDF and add the image
    const pdf = new jsPDF();

    // Colored bar with employee name
    pdf.setFillColor(0, 155, 219); // setting bar color
    pdf.rect(30,30, pdfWidth - 60, 7,'F'); // drawing the bar

    pdf.setTextColor(255, 255, 255); // setting text color to white
    pdf.setFontSize(12); // smaller text
    data.name = `${data.User.first_name} ${data.User.last_name}`;
    pdf.text(data.name, 32, 35); // write the text in the bar

    // Purchase Order under colored bar
    pdf.setTextColor(130, 130, 130);
    pdf.setFontSize(20);
    pdf.setFont(undefined, "bold");
    pdf.text("Expense Entry", 32, 45);

    // PO# under the colored bar
    pdf.setTextColor(10, 10, 10);
    pdf.setFont(undefined, "normal");
    pdf.setFontSize(13);
    pdf.text("#", 145, 44);
    const poNoSize = pdf.getTextWidth(`${data.id}`);
    pdf.text(`${data.id}`, 178 - poNoSize, 44);

    // Drawing the line under the Purchase Order title
    pdf.setLineWidth(.4);
    pdf.line(30, 48, 180, 48);
    
    // Drawing the purchase date text
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.text("Purchase Date", 122, 55.8);

    // Box around purchase date
    pdf.setFillColor(10, 10, 10);
    pdf.rect(151, 49.8, 180 - 151, 9.2);

    // Draw purchase date
    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    const dateArr = data.date_expense.split('T')[0].split('-');
    data.date = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
    pdf.text(data.date, 153.3, 55.8);

    // Vendor/Payee Name text
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.text("Vendor/Payee Name", 38, 68);

    // Vendor/Payee box
    pdf.rect(77, 61, 180 - 77, 12);

    // Vendor/Payee
    pdf.setFontSize(14);
    pdf.setFont(undefined, "normal");
    const vendorSize = pdf.getTextWidth(data.vendor);
    pdf.text(data.vendor, ((180 - 77) / 2) - (vendorSize / 2) + 77, 68.5);

    // Payment Type text
    pdf.setFontSize(11);
    pdf.setFont(undefined, "bold");
    pdf.text("Payment Type", 43, 93.5);

    // payment type boxes
    pdf.rect(77, 77, 10, 30);
    pdf.line(77, 87, 87, 87);
    pdf.line(77, 97, 87, 97);

    // church credit card
    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    pdf.text("Church Credit Card", 90, 83.5);

    // credit card holder box
    const cccSize = pdf.getTextWidth("Church Credit Card");
    pdf.rect(93 + cccSize, 77, 180 - (93 + cccSize), 10);

    // personal reimbursement and invoice
    pdf.text("Write Check to Payee named above", 90, 93.5);
    pdf.text("Write Check to Vendor named above", 90, 103.5);

    if (data.expense_type === "Church Credit Card") { 
        // credit card holder
        const boxstart = 93 + cccSize;
        const boxend = 180;
        const middle = 180 - ((boxend - boxstart) / 2);
        const nameOffset = pdf.getTextWidth(data.credit_card_holder);
        const namestart = middle - (nameOffset / 2);
        pdf.setFontSize(12);
        pdf.text(data.credit_card_holder, namestart, 83.7);

        // X in church credit card box
        pdf.line(80, 80, 84, 84);
        pdf.line(80, 84, 84, 80);
    } else if (data.expense_type === "Reimbursement") {
        // x in personal reimbursement box
        pdf.line(80, 90, 84, 94);
        pdf.line(80, 94, 84, 90);
    } else {
        // x in invoice box
        pdf.line(80, 100, 84, 104);
        pdf.line(80, 104, 84, 100);
    }

    // Lines for line number table
    pdf.line(30, 110, 180, 110); // top line
    pdf.line(30, 116, 180, 116); // line under description

    // Description, Line #, & Total Price text on table
    pdf.setFontSize(10);
    pdf.text("Total Price", 160, 114);
    pdf.setTextColor(0, 80, 180);
    pdf.text("Line #", 35, 114);
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.text("Description", 52, 114);

    // Reset font
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(0, 0, 0);

    // Keep track of offset
    let totalOffset = 0;

    // Loop through each expense definer
    for (let i = 0; i < data.ExpenseDefiners.length; i++) {
        // Grab business purpose and width and set up array
        const businessPurpose = data.ExpenseDefiners[i].business_purpose;
        const bpWidth = pdf.getTextWidth(businessPurpose);
        const bpArray = [];

        // Figure out the number of lines in the description/business purpose
        const numberOfLines = Math.ceil(bpWidth / 106);
        const cutOffs = [-1];

        // For each line
        for (let j = 1; j <= numberOfLines; j++) {
            // Approximate the cutoff
            let cutOff = Math.floor((106 / bpWidth) * businessPurpose.length) * j;
            let lastRow = false;

            // Figure out if we are the last row or not
            if (cutOff > businessPurpose.length) {
                cutOff = businessPurpose.length;
                lastRow = true;
            }

            // If not the last row, find the most recent space
            while ((businessPurpose[cutOff] !== ' ' || pdf.getTextWidth(businessPurpose.slice(cutOffs[j - 1] + 1, cutOff)) > 106) && !lastRow) {
                cutOff--;
            }

            // Add this line to the array of business purpose lines
            cutOffs[j] = cutOff;
            bpArray[j - 1] = businessPurpose.slice(cutOffs[j - 1] + 1, cutOffs[j]);
        }

        // Every other expense definer should be grey/white
        if (i % 2) {
            pdf.setTextColor(220, 220, 220);
            pdf.setFillColor(220, 220, 220);
            pdf.rect(30, 116 + ((i + totalOffset) * 6), 150, 6 * numberOfLines, 'F');
            pdf.setTextColor(0, 0, 0);
        }
      
        // Expense number display
        pdf.text(data.ExpenseDefiners[i].ExpenseNumber.number, 35, 120 + ((i + totalOffset) * 6)); // Line #

        // Expense business purpose/description display
        for (let j = 0; j < bpArray.length; j++) {
            const row = bpArray[j];
            pdf.text(row, 52, 120 + ((i + totalOffset + j) * 6));
        }

        // Expense definer amount display
        pdf.text(`$${data.ExpenseDefiners[i].amount}`, 160, 120 + ((i + totalOffset) * 6));

        // Add to the total offset
        totalOffset += (numberOfLines - 1);
    }

    // Verticle dashed line
    const bottomY = 116 + (6 * (data.ExpenseDefiners.length + totalOffset));
    pdf.setLineDashPattern([1, 1], 0);
    pdf.line(50, 116, 50, bottomY); // verticle line in the table
    pdf.setLineDashPattern([], 0);
    pdf.line(30, bottomY, 180, bottomY); // bottom line

    // Purchase total Lines and actual dollar amount
    pdf.line(140, bottomY + 10, 180, bottomY + 10);
    pdf.setFontSize(18);
    pdf.text(`$${data.amount}`, 145, bottomY + 8);

    // Purchase total
    pdf.setTextColor(0, 80, 180);
    pdf.text("Purchase Total", 96, bottomY + 8);

    // Add images
    const imageUrls = global_expenseData.imageData.map((imageData) => imageData.url);
    se_addImagesToPDF(imageUrls, pdf, pdfWidth, pdfHeight, data);
}

se_saveBtn.addEventListener('click', se_saveExpense);