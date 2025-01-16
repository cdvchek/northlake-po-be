const backBtn = document.getElementById('go-back-btn');
const backConfirmDiv = document.getElementById('back-confirm-modal-background');
const backConfirmBtn = document.getElementById('back-confirm-confirm');
const backCancelBtn = document.getElementById('back-confirm-cancel');

const paramsString = window.location.href.split('_')[1];
const paramsArr = paramsString.split('&');
const goingBackTo = paramsArr[1].split('=')[1];
const sessionStartString = paramsArr[2].split('=')[1];
const id = paramsArr[0].split('=')[1];

const bb_prevValues = {
    ExpenseDefiners: [],
    RecieptPhotos: [],
    address: '',
    amount: '',
    credit_card_holder: '',
    date_expense: '',
    expense_type: '',
    vendor: '',
};

const bb_fillPrevInputs = (event) => {
    bb_prevValues.ExpenseDefiners = event.detail.ExpenseDefiners;
    bb_prevValues.RecieptPhotos = event.detail.RecieptPhotos;
    bb_prevValues.address = event.detail.address;
    bb_prevValues.amount = event.detail.amount;
    bb_prevValues.credit_card_holder = event.detail.credit_card_holder;
    bb_prevValues.date_expense = event.detail.date_expense;
    bb_prevValues.expense_type = event.detail.expense_type;
    bb_prevValues.vendor = event.detail.vendor;
}

backBtn.addEventListener('inputsloaded', bb_fillPrevInputs);

const bb_checkValues = () => {
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
        creditCardHolderEdit: newValues.creditCardHolder !== prevValues.credit_card_holder,
        vendorEdit: newValues.vendor !== prevValues.vendor,
        addressEdit: newValues.address !== prevValues.address,
        amountEdit: newValues.amount !== prevValues.amount,
        dateEdit: newValues.date !== prevValues.date_expense.substring(0, 10),
        expenseDefiners: {
            edited: [],
            new: [],
            removed: [],
        },
        receiptPhotos: {
            removed: [],
            new: false,
        }
    }

    // Go through each new expense definer
    const expenseDefiners = Array.from(expenseDefinersList.children);
    // Have a list of the old expense definers
    const oldExpenseDefiners = [...prevValues.ExpenseDefiners];
    
    for (let i = 0; i < expenseDefiners.length; i++) {
        const expenseDefiner = expenseDefiners[i];
        
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

    if (imageFiles.length > 0) edits.receiptPhotos.new = true;

    if (edits.expenseTypeEdit) return false;
    if (edits.creditCardHolderEdit) return false;
    if (edits.vendorEdit) return false;
    if (edits.addressEdit) return false;
    if (edits.amountEdit) return false;
    if (edits.dateEdit) return false;
    if (edits.expenseDefiners.edited.length > 0) return false;
    if (edits.expenseDefiners.new.length > 0) return false;
    if (edits.expenseDefiners.removed.length > 0) return false;
    if (edits.receiptPhotos.removed.length > 0) return false;
    if (edits.receiptPhotos.new) return false;
    return true;
}

const goBack = () => {
    if (id === '-1') window.location.href = window.location.origin + '/web/myexpenses_count=' + sessionStartString;
    
    let addressMiddle;
    if (goingBackTo === 'user') addressMiddle = '/web/myexpenses_count=';
    if (goingBackTo === 'admin') addressMiddle = '/web/admin-viewexpense_id=' + id + '&prev=admin&count=';

    if (bb_checkValues()) {
        window.location.href = window.location.origin + addressMiddle + sessionStartString;
    } else {
        // TODO: pull up a confirm to make sure they want to leave with unsaved changes
        backConfirmDiv.style.display = "flex";
    }
}

backBtn.addEventListener('click', goBack);

const confirmGoBack = () => {
    let addressMiddle;
    if (goingBackTo === 'user') addressMiddle = '/web/myexpenses_count=';
    if (goingBackTo === 'admin') addressMiddle = '/web/admin-viewexpense_id=' + id + '&prev=admin&count=';
    
    window.location.href = window.location.origin + addressMiddle + sessionStartString;
}

backConfirmBtn.addEventListener('click', confirmGoBack);

const cancelGoBack = () => {
    backConfirmDiv.style.display = 'none';
}

backCancelBtn.addEventListener('click', cancelGoBack);