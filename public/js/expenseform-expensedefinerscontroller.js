// expenseDefinersList is already defined in a previous script
//const expenseDefinersList = document.getElementById('expense-definers-list');

const checkListLength = () => {
    // Hide the subamount and delete buttton if its the only expense definer
    if (expenseDefinersList.children.length <= 1) {
        expenseDefinersList.children[0].children[2].style.display = 'none';
        expenseDefinersList.children[0].children[3].style.display = 'none';
    } else {
        expenseDefinersList.children[0].children[2].style.display = 'flex';
        expenseDefinersList.children[0].children[3].style.display = 'inline-block';
    }
}

// By default hide sub amount
checkListLength();

const addExpenseDefinerBtn = document.getElementById('expense-definers-add-btn');
const expenseNumbersHolder = document.getElementById('expense-numbers-holder');

const addExpenseDefiner = () => {
    const addedLi = document.createElement('li');
    addedLi.setAttribute('class', 'expense-definer');
    addedLi.setAttribute('id', `expense-definers-${expenseDefinersList.children.length}`);

    const expenseNumberDiv = document.createElement('div');
    expenseNumberDiv.setAttribute('class', 'expense-definer-subwrapper');

    const expenseNumberText = document.createElement('span');
    expenseNumberText.setAttribute('class', 'expense-definer-text');
    expenseNumberText.textContent = 'Expense Number';

    const expenseNumberSelect = document.createElement('select');
    expenseNumberSelect.setAttribute('class', 'expense-definer-select');
    const expenseNumberSelectID = `expense-number-${expenseDefinersList.children.length}`
    expenseNumberSelect.setAttribute('name', expenseNumberSelectID);
    expenseNumberSelect.setAttribute('id', expenseNumberSelectID);

    for (let i = 0; i < expenseNumbersHolder.children.length; i++) {
        const expenseNumberDiv = expenseNumbersHolder.children[i];
        const expenseNumberId = expenseNumberDiv.getAttribute('data-id');
        const expenseNumber = expenseNumberDiv.getAttribute('data-number');
        const expenseNumberDescription = expenseNumberDiv.getAttribute('data-description');

        const expenseNumberOption = document.createElement('option');
        expenseNumberOption.setAttribute('value', expenseNumberId);
        expenseNumberOption.textContent = `${expenseNumber} - ${expenseNumberDescription}`;
        expenseNumberSelect.appendChild(expenseNumberOption);
    }

    expenseNumberDiv.appendChild(expenseNumberText);
    expenseNumberDiv.appendChild(expenseNumberSelect);

    const businessPurposeDiv = document.createElement('div');
    businessPurposeDiv.setAttribute('class', 'expense-definer-subwrapper');

    const businessPurposeText = document.createElement('span');
    businessPurposeText.setAttribute('class', 'expense-definer-text');
    businessPurposeText.textContent = 'Business Purpose';

    const businessPurposeTextarea = document.createElement('textarea');
    businessPurposeTextarea.setAttribute('class', 'expense-definer-textarea');
    businessPurposeTextarea.setAttribute('id', `business-purpose-${expenseDefinersList.children.length}`);

    businessPurposeDiv.appendChild(businessPurposeText);
    businessPurposeDiv.appendChild(businessPurposeTextarea);

    const subAmountDiv = document.createElement('div');
    subAmountDiv.setAttribute('class', 'expense-definer-subwrapper expense-definer-subamount');

    const subAmountText = document.createElement('span');
    subAmountText.setAttribute('class', 'expense-definer-text');
    subAmountText.textContent = 'Sub Amount';

    const subAmountInput = document.createElement('input');
    subAmountInput.setAttribute('class', 'expense-definer-input');
    subAmountInput.setAttribute('type', 'number');
    subAmountInput.setAttribute('step', '.01');

    subAmountDiv.appendChild(subAmountText);
    subAmountDiv.appendChild(subAmountInput);

    const removeBtn = document.createElement('button');
    removeBtn.setAttribute('class', 'expense-definer-remove-btn');
    removeBtn.textContent = 'X';
    removeBtn.addEventListener('click', removeExpenseDefiner);

    addedLi.appendChild(expenseNumberDiv);
    addedLi.appendChild(businessPurposeDiv);
    addedLi.appendChild(subAmountDiv);
    addedLi.appendChild(removeBtn);

    expenseDefinersList.appendChild(addedLi);

    checkListLength();
}

addExpenseDefinerBtn.addEventListener('click', addExpenseDefiner);

const removeBtns = document.getElementsByClassName('expense-definer-remove-btn');

const removeExpenseDefiner = (e) => {
    e.target.parentNode.remove();
    checkListLength();
}

for (let i = 0; i < removeBtns.length; i++) removeBtns[i].addEventListener('click', removeExpenseDefiner);