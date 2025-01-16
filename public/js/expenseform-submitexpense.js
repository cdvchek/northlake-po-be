// Grab simple inputs
const expenseTypeInput = document.getElementById('payment-select');
const ccNameInput = document.getElementById('credit-card-holder-input');
const vendorInput = document.getElementById('vendor-input');
const addressInput = document.getElementById('address-input');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('expense-date-input');
const notMyCardBox = document.getElementById('not-my-card-checkbox');

// Get the number of expense numbers
const expenseDefinersList = document.getElementById('expense-definers-list');

// "Global" variable for storing photo files
const imageFiles = [];

const checkInputValidity = () => {
    let passing = true;

    switch (expenseTypeInput.value) {
        case 'church-credit-card':
            console.log(notMyCardBox.value);
            
            if (notMyCardBox.checked && ccNameInput.value === '') {
                passing = false;
                // mark ccNameInput as required
            }
            break;
        
        case 'reimbursement':
            if (addressInput.value === '') {
                passing = false;
                // mark addressInput as required
            }
            break;
    }

    if (vendorInput.value === '') {
        passing = false;
        // mark vendorInput as required
    }

    if (amountInput.value === '') {
        passing = false;
        // mark amountInput as required
    }

    if (dateInput.value === '') {
        passing = false;
        // mark dateInput as required
    }

    console.log("Input Check:", passing);
    
    return passing;
}

const paramsStringFillSubmit = window.location.href.split('_')[1];
const paramsArrFillSubmit = paramsStringFillSubmit.split('&');
const expenseIdSubmit = paramsArrFillSubmit[0].split('=')[1];
const submitSaveWrapper = () => {
    if (expenseIdSubmit === '-1') submitExpense();
    else saveExpense();
}

const submitExpense = async () => {
    if (!checkInputValidity()) return;
    const expenseDefiners = Array.from(expenseDefinersList.children);
    const numberExpenseDefiners = expenseDefiners.length;

    // Make new form and start appending
    const formData = new FormData();
    
    const expenseTypeValue = expenseTypeInput.value.split('-').map((word) => `${word[0].toUpperCase()}${word.substring(1, word.length)}`).join(' ');
    formData.append('expenseType', expenseTypeValue);

    const ccNameValue = ccNameInput.value === '' ? 'self' : ccNameInput.value;
    formData.append('credit_card_holder', ccNameValue);

    formData.append('vendor', vendorInput.value);
    formData.append('address', addressInput.value);
    formData.append('amount', amountInput.value);

    const dateValue = new Date(dateInput.value).toISOString();
    formData.append('date_expense', dateValue);
    
    formData.append('number_of_expense_numbers', numberExpenseDefiners);

    for (let i = 0; i < expenseDefiners.length; i++) {
        const expenseDefiner = expenseDefiners[i];
        const expenseNumberValue = expenseDefiner.children[0].children[1].value;
        const businessPurposeValue = expenseDefiner.children[1].children[1].value;
        let subAmountValue = expenseDefiner.children[2].children[1].value;
        if (expenseDefiners.length === 1) subAmountValue = amountInput.value;

        formData.append(`expense_number_${i}`, expenseNumberValue);
        formData.append(`expense_number_amount_${i}`, subAmountValue);
        formData.append(`business_purpose_${i}`, businessPurposeValue);
    }

    // Attach photos to form
    for (let i = 0; i < imageFiles.length; i++) formData.append('image', imageFiles[i]);

    // Send form to server
    try {
        await fetch(window.location.origin + '/expenses/newexpense', {
            method: 'POST',
            body: formData,
        });
        
        const hrefArr = window.location.href.split('count=');
        const sessionStartString = hrefArr[hrefArr.length - 1];
        window.location.href = window.location.origin + '/web/myexpenses_count=' + sessionStartString;
    } catch (error) {
        console.log("POST: expenseform", error);
        alert("An error occurred while submitting your expense your expense. Refresh or try again later.");
    }
}

const prevValues = {
    ExpenseDefiners: [],
    RecieptPhotos: [],
    address: '',
    amount: '',
    credit_card_holder: '',
    date_expense: '',
    expense_type: '',
    vendor: '',
};

const fillPrevInputs = (event) => {
    prevValues.ExpenseDefiners = event.detail.ExpenseDefiners;
    prevValues.RecieptPhotos = event.detail.RecieptPhotos;
    prevValues.address = event.detail.address;
    prevValues.amount = event.detail.amount;
    prevValues.credit_card_holder = event.detail.credit_card_holder;
    prevValues.date_expense = event.detail.date_expense;
    prevValues.expense_type = event.detail.expense_type;
    prevValues.vendor = event.detail.vendor;
}

const submitExpenseBtn = document.getElementById('submit-expense-btn');
submitExpenseBtn.addEventListener('inputsloaded', fillPrevInputs);

const photoViewer = document.getElementById('photo-viewer');
const saveExpense = async () => {
    const newValues = {
        expenseType: expenseTypeInput.value.split('-').map((word) => `${word[0].toUpperCase()}${word.substring(1, word.length)}`).join(' '),
        creditCardHolder: ccNameInput.value.trim() === '' ? 'self' : ccNameInput.value.trim(),
        vendor: vendorInput.value.trim(),
        address: addressInput.value.trim(),
        amount: amountInput.value,
        date: dateInput.value,
    }

    const edits = {
        expenseTypeEdit: newValues.expenseType !== prevValues.expense_type,
        expenseType: newValues.expenseType,
        creditCardHolderEdit: newValues.creditCardHolder !== prevValues.credit_card_holder,
        creditCardHolder: newValues.creditCardHolder,
        vendorEdit: newValues.vendor !== prevValues.vendor,
        vendor: newValues.vendor,
        addressEdit: newValues.address !== prevValues.address,
        address: newValues.address,
        amountEdit: newValues.amount !== prevValues.amount,
        amount: newValues.amount,
        dateEdit: newValues.date !== prevValues.date_expense.substring(0, 10),
        date: newValues.date,
        expenseDefiners: {
            edited: [],
            new: [],
            removed: [],
        },
        receiptPhotos: {
            removed: [],
        }
    }

    // Go through each new expense definer
    const expenseDefiners = Array.from(expenseDefinersList.children);
    // Have a list of the old expense definers
    const oldExpenseDefiners = [...prevValues.ExpenseDefiners];
    console.log("old expense definers:", oldExpenseDefiners);
    
    for (let i = 0; i < expenseDefiners.length; i++) {
        const expenseDefiner = expenseDefiners[i];
        console.log("checking this new expense definer:", expenseDefiner);
        
        const expenseDefinerId = expenseDefiner.getAttribute('data-id');
        const expenseNumber = expenseDefiner.children[0].children[1].value;
        const businessPurpose = expenseDefiner.children[1].children[1].value;
        let subAmountValue = expenseDefiner.children[2].children[1].value;
        if (expenseDefiners.length === 1) subAmountValue = amountInput.value;

        // Previous Expense Definer, check to see if anything has changed
        if (expenseDefinerId) {
            // Find matching oldExpenseDefiner
            let oldExpenseDefiner;
            
            for (let j = 0; j < oldExpenseDefiners.length; j++) {
                oldExpenseDefiner = oldExpenseDefiners[j];
                if (Number(expenseDefinerId) === Number(oldExpenseDefiner.id)) break;
            }

            // Go through expense definer to see if anything has changed, if so mark it as an old expense definer that has been changed      
            const editObj = {
                id: expenseDefinerId,
                numberEdit: false,
                number: '',
                businessPurposeEdit: false,
                businessPurpose: '',
                amountEdit: false,
                amount: '',
            }

            if (Number(expenseNumber) !== Number(oldExpenseDefiner.ExpenseNumberId)) {
                editObj.numberEdit = true;
                editObj.number = expenseNumber;
            }
            if (businessPurpose !== oldExpenseDefiner.business_purpose) {
                editObj.businessPurposeEdit = true;
                editObj.businessPurpose = businessPurpose;
            }
            if (Number(subAmountValue) !== Number(oldExpenseDefiner.amount)) {
                editObj.amountEdit = true;
                editObj.amount = subAmountValue;
            }
            if (editObj.numberEdit || editObj.businessPurposeEdit || editObj.amountEdit) edits.expenseDefiners.edited.push(editObj);
        }

        // New Expense Definer, push to new
        else {
            edits.expenseDefiners.new.push({ number: expenseNumber, businessPurpose: businessPurpose, amount: subAmountValue });
        }
    }

    const removedExpenseDefinersElements = document.getElementById('removed-expense-definers').children;

    for (let i = 0; i < removedExpenseDefinersElements.length; i++) {
        const idToRemove = removedExpenseDefinersElements[i].getAttribute('data-id');
        edits.expenseDefiners.removed.push(Number(idToRemove));
    }

    const removedPhotosElements = document.getElementById('removed-photos').children;

    for (let i = 0; i < removedPhotosElements.length; i++) {
        const idToRemove = removedPhotosElements[i].getAttribute('data-id');
        edits.receiptPhotos.removed.push(Number(idToRemove));
    }

    console.log(edits);

    // TODO: upload this as a file put route
    const formData = new FormData();

    formData.append('address', edits.address);
    formData.append('addressEdit', edits.addressEdit);
    formData.append('amount', edits.amount);
    formData.append('amountEdit', edits.amountEdit);
    formData.append('creditCardHolder', edits.creditCardHolder);
    formData.append('creditCardHolderEdit', edits.creditCardHolderEdit);
    formData.append('date', edits.date);
    formData.append('dateEdit', edits.dateEdit);
    formData.append('expenseType', edits.expenseType);
    formData.append('expenseTypeEdit', edits.expenseTypeEdit);
    formData.append('vendor', edits.vendor);
    formData.append('vendorEdit', edits.vendorEdit);

    formData.append('numberOfNewExpenseDefiners', edits.expenseDefiners.new.length);
    
    for (let i = 0; i < edits.expenseDefiners.new.length; i++) {
        const newExpenseDefiner = edits.expenseDefiners.new[i];
        formData.append(`expenseDefiner_new_${i}_number`, newExpenseDefiner.number);
        formData.append(`expenseDefiner_new_${i}_businessPurpose`, newExpenseDefiner.businessPurpose);
        formData.append(`expenseDefiner_new_${i}_amount`, newExpenseDefiner.amount);
    }

    formData.append('numberOfEditedExpenseDefiners', edits.expenseDefiners.edited.length);

    for (let i = 0; i < edits.expenseDefiners.edited.length; i++) {
        const editedExpenseDefiner = edits.expenseDefiners.edited[i];
        formData.append(`expenseDefiner_edited_${i}_amount`, editedExpenseDefiner.amount);
        formData.append(`expenseDefiner_edited_${i}_amountEdit`, editedExpenseDefiner.amountEdit);
        formData.append(`expenseDefiner_edited_${i}_businessPurpose`, editedExpenseDefiner.businessPurpose);
        formData.append(`expenseDefiner_edited_${i}_businessPurposeEdit`, editedExpenseDefiner.businessPurposeEdit);
        formData.append(`expenseDefiner_edited_${i}_number`, editedExpenseDefiner.number);
        formData.append(`expenseDefiner_edited_${i}_numberEdit`, editedExpenseDefiner.numberEdit);
        formData.append(`expenseDefiner_edited_${i}_id`, editedExpenseDefiner.id);
    }

    formData.append('numberOfRemovedExpenseDefiners', edits.expenseDefiners.removed.length);

    for (let i = 0; i < edits.expenseDefiners.removed.length; i++) {
        const idToRemove = edits.expenseDefiners.removed[i];
        formData.append(`expenseDefiner_remove_${i}`, idToRemove);
    }

    // Attach photos to form
    for (let i = 0; i < imageFiles.length; i++) formData.append('image', imageFiles[i]);

    formData.append('numberOfRemovedReceiptPhotos', edits.receiptPhotos.removed.length);

    // Photos to remove
    for (let i = 0; i < edits.receiptPhotos.removed.length; i++) {
        const idToRemove = edits.receiptPhotos.removed[i];
        formData.append(`receiptPhoto_remove_${i}`, idToRemove);
    }

    try {
        // Send form to server
        await fetch(window.location.origin + '/expenses/image/' + expenseIdSubmit, {
            method: 'PUT',
            body: formData,
        });

        const hrefArr = window.location.href.split('count=');
        const sessionStartString = hrefArr[hrefArr.length - 1];
        window.location.href = window.location.origin + '/web/myexpenses_count=' + sessionStartString;
    } catch (error) {
        console.log("PUT: expenseform", error);
        alert("An error occurred while saving your expense. Refresh or try again later.");
    }    
}

submitExpenseBtn.addEventListener('click', submitSaveWrapper);