const ae_fetchAllExpenseNumbers = async () => {
    const rawResponse = await fetch(window.location.origin + '/expensenumbers/allexpensenumbers');
    const response = await rawResponse.json();
    
    return response;
}

const ae_expenseNumbersList = document.getElementById('expensenumbers-list');
const ae_editDiv = document.getElementById('add-expense-number-div-background');
const ae_numberInput = document.getElementById('add-expense-number-number');
const ae_descriptionInput = document.getElementById('add-expense-number-description');
const ae_userSelect = document.getElementById('add-expense-number-user');
const ae_saveBtn = document.getElementById('add-expense-number-save');
const ae_saveAnotherBtn = document.getElementById('add-expense-number-save-another');
const ae_deleteBtn = document.getElementById('delete-btn');

const ae_editExpenseNumber = (e) => {
    ae_editDiv.style.display = 'flex';
    let target = e.target;
    while (target.tagName !== 'LI') target = target.parentNode;

    const expenseNumberId = target.getAttribute('id').split('-')[1];
    ae_saveBtn.setAttribute('data-id', expenseNumberId);
    ae_saveAnotherBtn.setAttribute('data-id', expenseNumberId);
    ae_deleteBtn.setAttribute('data-id', expenseNumberId);

    const number = target.children[0].children[0].textContent;
    const description = target.children[1].children[0].textContent;
    const user = target.children[2].children[0].getAttribute('data-id');

    ae_numberInput.value = number;
    ae_descriptionInput.value = description;
    ae_userSelect.value = user;
}

const ae_executeFetchingAndAppend = async () => {
    const expenseNumbers = await ae_fetchAllExpenseNumbers();
    
    expenseNumbers.forEach(expenseNumber => {
        // Create Expense Li
        const expenseNumberLi = document.createElement('li');
        expenseNumberLi.setAttribute('id', `expense-${expenseNumber.id}`);
        expenseNumberLi.setAttribute('class', 'expense-number');
        expenseNumberLi.addEventListener('click', ae_editExpenseNumber);

        // Create Number Div
        const numberDiv = document.createElement('div');
        numberDiv.setAttribute('class', 'expense-number-identifier small-identifier');

        // Create Number Text
        const numberText = document.createElement('p');
        numberText.setAttribute('class', 'expense-number-identifier-text');
        numberText.textContent = expenseNumber.number;

        // Put Number Div Together
        numberDiv.appendChild(numberText);

        // Create Description Div
        const descriptionDiv = document.createElement('div');
        descriptionDiv.setAttribute('class', 'expense-number-identifier big-identifier');

        // Create Description Text
        const descriptionText = document.createElement('p');
        descriptionText.setAttribute('class', 'expense-number-identifier-text');
        const fullDescription = expenseNumber.description;
        let shortDescription = expenseNumber.description.substring(0, 18);
        if (shortDescription[shortDescription.length - 1] === ' ') shortDescription = fullDescription.substring(0, 17);
        descriptionText.textContent = (fullDescription.length !== shortDescription.length) ? shortDescription + "..." : fullDescription;

        // Put Description Div Together
        descriptionDiv.appendChild(descriptionText);

        // Create Name Div
        const nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'expense-number-identifier big-identifier');

        // Create Name Text
        const nameText = document.createElement('p');
        nameText.setAttribute('class', 'expense-number-identifier-text');
        nameText.setAttribute('data-id', expenseNumber.User.id);
        nameText.textContent = expenseNumber.User.first_name + " " + expenseNumber.User.last_name;

        // Put Name Div Together
        nameDiv.appendChild(nameText);

        // Put Li Together
        expenseNumberLi.appendChild(numberDiv);
        expenseNumberLi.appendChild(descriptionDiv);
        expenseNumberLi.appendChild(nameDiv);

        // Append Li to Ul
        ae_expenseNumbersList.appendChild(expenseNumberLi);
    });
}

ae_executeFetchingAndAppend();