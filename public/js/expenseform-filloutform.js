const paramsStringFill = window.location.href.split('_')[1];
const paramsArrFill = paramsStringFill.split('&');
const expenseId = paramsArrFill[0].split('=')[1];

// Form elements to be filled in
const ccHolderCheckBoxFill = document.getElementById('not-my-card-checkbox');
const ccHolderInputFill = document.getElementById('credit-card-holder-input');
const paymentSelectFill = document.getElementById('payment-select');
const addressInputFill = document.getElementById('address-input');
const vendorInputFill = document.getElementById('vendor-input');
const amountInputFill = document.getElementById('amount-input');
const buyDateInputFill = document.getElementById('expense-date-input');
const newExpenseDefinersList = document.getElementById('expense-definers-list');
const expenseNumbersHolderDiv = document.getElementById('expense-numbers-holder');
const photoViewerDiv = document.getElementById('photo-viewer');
const newSubmitExpenseBtn = document.getElementById('submit-expense-btn');
const removedPhotosDiv = document.getElementById('removed-photos');
const removedExpenseDefinersDiv = document.getElementById('removed-expense-definers');
const fullScreenDivFill = document.getElementById('photo-fullscreen-div');
const fullScreenImgFill = document.getElementById('photo-fullscreen');

const openFullscreenFill = (e) => {
    if (e.target.src) {
        fullScreenDivFill.style.display = 'flex';    
        fullScreenImgFill.src = e.target.src;
    }
}

const newCheckListLength = () => {
    // Hide the subamount and delete buttton if its the only expense definer
    if (newExpenseDefinersList.children.length <= 1) {
        newExpenseDefinersList.children[0].children[2].style.display = 'none';
        newExpenseDefinersList.children[0].children[3].style.display = 'none';
    } else {
        newExpenseDefinersList.children[0].children[2].style.display = 'flex';
        newExpenseDefinersList.children[0].children[3].style.display = 'inline-block';
    }
}

const fillOutForm = async () => {
    if (expenseId === '-1') return;

    const response = await (await fetch(window.location.origin + '/expenses/expense-' + expenseId)).json();
    const imageUrlsResponse = await (await fetch(window.location.origin + '/expenses/images-' + expenseId)).json();

    console.log(response);

    if (response.expense_type === "Church Credit Card") {
        console.log("running credit card");
        
        if (response.credit_card_holder !== 'self') {
            console.log(ccHolderCheckBoxFill);
            
            ccHolderCheckBoxFill.checked = true;
            ccHolderInputFill.parentNode.parentNode.style.display = 'flex';
            ccHolderInputFill.value = response.credit_card_holder;
        }
    } else if (response.expense_type === "Reimbursement") {
        console.log("running reimbursement");
        ccHolderInputFill.parentNode.parentNode.style.display = 'none';
        ccHolderCheckBoxFill.parentNode.style.display = 'none';
        vendorInputFill.parentNode.children[0].children[0].textContent = "Payee";
        addressInputFill.parentNode.parentNode.style.display = 'flex';
        paymentSelectFill.value = "reimbursement";
        addressInputFill.value = response.address;
    } else {
        console.log("running invoice");
        ccHolderCheckBoxFill.parentNode.style.display = 'none';
        ccHolderInputFill.parentNode.parentNode.style.display = 'none';
        vendorInputFill.parentNode.parentNode.style.display = 'flex';
        addressInputFill.parentNode.parentNode.style.display = 'none';
        paymentSelectFill.value = "invoice";
    }

    vendorInputFill.value = response.vendor;
    amountInputFill.value = response.amount;
    buyDateInputFill.value = response.date_expense.substring(0,10);

    // Clear the default expense definer form
    while (newExpenseDefinersList.children.length > 0) {
        newExpenseDefinersList.children[0].remove();
    }

    // Put the existing expense definers in the form
    for (let i = 0; i < response.ExpenseDefiners.length; i++) {
        const ExpenseDefiner = response.ExpenseDefiners[i];
        
        const newExpenseDefiner = document.createElement('li');
        newExpenseDefiner.setAttribute('class', 'expense-definer');
        newExpenseDefiner.setAttribute('data-id', ExpenseDefiner.id);

        const expenseNumberSubWrapper = document.createElement('div');
        expenseNumberSubWrapper.setAttribute('class', 'expense-definer-subwrapper');

        const expenseNumberSpan = document.createElement('span');
        expenseNumberSpan.setAttribute('class', 'expense-definer-text');
        expenseNumberSpan.textContent = "Expense Number";

        const expenseNumberSelect = document.createElement('select');
        expenseNumberSelect.setAttribute('class', 'expense-definer-select');

        const expenseNumbers = Array.from(expenseNumbersHolderDiv.children);
        for (let i = 0; i < expenseNumbers.length; i++) {
            const newExpenseNumber = document.createElement('option');
            newExpenseNumber.setAttribute('value', expenseNumbers[i].getAttribute('data-id'));
            newExpenseNumber.textContent = `${expenseNumbers[i].getAttribute('data-number')} - ${expenseNumbers[i].getAttribute('data-description')}`;

            expenseNumberSelect.appendChild(newExpenseNumber);
        }

        expenseNumberSelect.value = ExpenseDefiner.ExpenseNumberId;

        expenseNumberSubWrapper.appendChild(expenseNumberSpan);
        expenseNumberSubWrapper.appendChild(expenseNumberSelect);

        const expenseDescriptionSubWrapper = document.createElement('div');
        expenseDescriptionSubWrapper.setAttribute('class', 'expense-definer-subwrapper');

        const expenseDescriptionSpan = document.createElement('span');
        expenseDescriptionSpan.setAttribute('class', 'expense-definer-text');
        expenseDescriptionSpan.textContent = "Business Purpose";

        const expenseTextArea = document.createElement('textarea');
        expenseTextArea.setAttribute('class', 'expense-definer-textarea');
        expenseTextArea.textContent = ExpenseDefiner.business_purpose;

        expenseDescriptionSubWrapper.appendChild(expenseDescriptionSpan);
        expenseDescriptionSubWrapper.appendChild(expenseTextArea);

        const expenseSubamountSubWrapper = document.createElement('div');
        expenseSubamountSubWrapper.setAttribute('class', 'expense-definer-subwrapper expense-definer-subamount');
        if (response.ExpenseDefiners.length === 1) expenseSubamountSubWrapper.style.display = 'none';

        const expenseSubamountSpan = document.createElement('span');
        expenseSubamountSpan.setAttribute('class', 'expense-definer-text');
        expenseSubamountSpan.textContent = 'Sub Amount';

        const expenseSubamountInput = document.createElement('input');
        expenseSubamountInput.setAttribute('class', 'expense-definer-input');
        expenseSubamountInput.setAttribute('type', 'number');
        expenseSubamountInput.setAttribute('step', '.01');
        expenseSubamountInput.value = ExpenseDefiner.amount;

        expenseSubamountSubWrapper.appendChild(expenseSubamountSpan);
        expenseSubamountSubWrapper.appendChild(expenseSubamountInput);

        const expenseDefinerDeleteBtn = document.createElement('button');
        expenseDefinerDeleteBtn.setAttribute('class', 'expense-definer-remove-btn');
        expenseDefinerDeleteBtn.textContent = 'X';
        if (response.ExpenseDefiners.length === 1) expenseDefinerDeleteBtn.style.display = 'none';
        expenseDefinerDeleteBtn.addEventListener('click', (e) => {
            const newRemovedExpenseDefiner = document.createElement('div');
            newRemovedExpenseDefiner.setAttribute('data-id', ExpenseDefiner.id);
            removedExpenseDefinersDiv.appendChild(newRemovedExpenseDefiner);
            e.target.parentNode.remove();
            newCheckListLength();
        });

        newExpenseDefiner.appendChild(expenseNumberSubWrapper);
        newExpenseDefiner.appendChild(expenseDescriptionSubWrapper);
        newExpenseDefiner.appendChild(expenseSubamountSubWrapper);
        newExpenseDefiner.appendChild(expenseDefinerDeleteBtn);

        newExpenseDefinersList.appendChild(newExpenseDefiner);
    }

    // Put the image in the form
    for (let i = 0; i < imageUrlsResponse.length; i++) {
        const imageData = imageUrlsResponse[i];
        const imageUrl = imageData.url;
        const imageId = imageData.id;
        
        // Wrapper div
        const wrapperDiv = document.createElement('div');
        wrapperDiv.setAttribute('class', 'receipt-image-wrapper');
        wrapperDiv.setAttribute('data-id', imageId);
        wrapperDiv.addEventListener('click', openFullscreenFill);

        // Image
        const image = document.createElement('img');
        image.setAttribute('class', 'receipt-image');
        image.setAttribute('alt', 'picture of receipt being submitted');
        image.setAttribute('src', imageUrl);

        // Remove Btn
        const removeBtn = document.createElement('button');
        removeBtn.setAttribute('class', 'image-remove');
        removeBtn.textContent = 'X';
        removeBtn.addEventListener('click', (e) => {
            const newRemovedPhoto = document.createElement('div');
            newRemovedPhoto.setAttribute('data-id', imageId);
            removedPhotosDiv.appendChild(newRemovedPhoto);
            e.target.parentNode.remove();
        });

        wrapperDiv.appendChild(image);
        wrapperDiv.appendChild(removeBtn);
        photoViewerDiv.appendChild(wrapperDiv);

        // Submit Expense Btn to Save Expense Btn
        newSubmitExpenseBtn.textContent = 'Save Expense';
    }

    const event = new CustomEvent('inputsloaded', { detail: { 
        ExpenseDefiners: response.ExpenseDefiners,
        RecieptPhotos: response.RecieptPhotos,
        address: response.address,
        amount: response.amount,
        credit_card_holder: response.credit_card_holder,
        date_expense: response.date_expense,
        expense_type: response.expense_type,
        vendor: response.vendor,
    }});
    newSubmitExpenseBtn.dispatchEvent(event);
}

expenseNumbersHolderDiv.addEventListener('childrenloaded', fillOutForm);