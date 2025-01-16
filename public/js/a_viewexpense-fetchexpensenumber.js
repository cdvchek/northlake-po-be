const fe_paramsString = window.location.href.split('_')[1];
const fe_paramsArr = fe_paramsString.split('&');
const fe_expenseId = fe_paramsArr[0].split('=')[1];
const fe_photoFullscreenDiv = document.getElementById('photo-fullscreen-div');
const fe_photoFullscreen = document.getElementById('photo-fullscreen');

let global_expenseData = {};

const fe_openPhoto = async (e) => {
    fe_photoFullscreenDiv.style.display = 'flex';
    fe_photoFullscreen.src = e.target.src;
}

const fe_fillOutForm = async () => {
    const addressCCHolderDiv = document.getElementById('address-ccholder-div');

    const vendorPayeeTitle = document.getElementById('vendor-payee-title');
    const addressCCHolderTitle = document.getElementById('address-ccholder-title');

    const entryNumberP = document.getElementById('entry-number');
    const submitterP = document.getElementById('submitter');
    const vendorPayeeP = document.getElementById('vendor-payee');
    const dateP = document.getElementById('purchase-date');
    const paymentP = document.getElementById('payment-type');
    const addressCCHolderP = document.getElementById('address-ccholder');

    try {
        const response = await (await fetch(window.location.origin + '/expenses/expense-' + fe_expenseId)).json();
        const imageUrlsResponse = await (await fetch(window.location.origin + '/expenses/images-' + fe_expenseId)).json();
        
        global_expenseData.data = response;
        global_expenseData.imageData = imageUrlsResponse
        // imageUrlsResponse[0].id // imageUrlsResponse[0].url
            
        entryNumberP.textContent = response.id;
        submitterP.textContent = `${response.User.first_name} ${response.User.last_name}`;
        vendorPayeeP.textContent = response.vendor;
        paymentP.textContent = response.expense_type;
    
        const dateUnformatted = response.date_expense.split('T')[0];
        const dateArr = dateUnformatted.split('-');
        dateP.textContent = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
    
        switch (response.expense_type) {
            case "Church Credit Card":
                vendorPayeeTitle.textContent = "Vendor:";
                addressCCHolderTitle.textContent = "Name On Card:"
                addressCCHolderP.textContent = response.credit_card_holder;
                break;
    
            case "Reimbursement":
                vendorPayeeTitle.textContent = "Payee:";
                addressCCHolderTitle.textContent = "Address:"
                addressCCHolderP.textContent = response.address;
                break;
    
            case "Invoice":
                vendorPayeeTitle.textContent = "Vendor:";
                addressCCHolderDiv.style.display = "none";
                break;
        }
    
        const budgetSplitsDetailsDiv = document.getElementById('budget-splits-details');
    
        for (let i = 0; i < response.ExpenseDefiners.length; i++) {
            const expenseDefiner = response.ExpenseDefiners[i];
            
            const outerDiv = document.createElement('div');
            outerDiv.setAttribute('class', 'budget-split-detail');
    
            const numberP = document.createElement('p');
            numberP.setAttribute('class', 'bsd-1');
            numberP.textContent = expenseDefiner.ExpenseNumber.number;
    
            const bpP = document.createElement('p');
            bpP.setAttribute('class', 'bsd-2');
            bpP.textContent = expenseDefiner.business_purpose;
    
            const amountP = document.createElement('p');
            amountP.setAttribute('class', 'bsd-3');
            amountP.textContent = `$${expenseDefiner.amount}`;
    
            outerDiv.appendChild(numberP);
            outerDiv.appendChild(bpP);
            outerDiv.appendChild(amountP);
    
            budgetSplitsDetailsDiv.appendChild(outerDiv);
        }
    
        const totalPriceP = document.getElementById('purchase-total');
        totalPriceP.textContent = `$${response.amount}`;
    
        const photosDiv = document.getElementById('receipt-photos');
        for (let i = 0; i < imageUrlsResponse.length; i++) {
            const imageData = imageUrlsResponse[i];
            
            const photoDiv = document.createElement('div');
            photoDiv.setAttribute('class', 'photo-div');
            photoDiv.addEventListener('click', fe_openPhoto);
    
            const image = document.createElement('img');
            image.setAttribute('class', 'photo');
            image.setAttribute('src', imageData.url);
            image.style.height = '140px';
    
            photoDiv.appendChild(image);
            photosDiv.appendChild(photoDiv);
        }
    } catch (error) {
        console.log("Fetch: a_viewexpense", error);
        alert("An error occurred while loading the expense information.");
    }
}

fe_fillOutForm();