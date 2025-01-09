const modal = document.getElementById('add-expense-number-div-background');
const saveAnotherBtn = document.getElementById('add-expense-number-save-another');
const saveBtn = document.getElementById('add-expense-number-save');
const numberInput = document.getElementById('add-expense-number-number');
const descriptionInput = document.getElementById('add-expense-number-description');
const userSelect = document.getElementById('add-expense-number-user');
const expenseNumberList = document.getElementById('expensenumbers-list');
const deleteBtn = document.getElementById('delete-btn');

const editNewExpenseNumber = (e) => {
    modal.style.display = 'flex';
    let target = e.target;
    while (target.tagName !== 'LI') target = target.parentNode;

    const expenseNumberId = target.getAttribute('id').split('-')[1];
    saveBtn.setAttribute('data-id', expenseNumberId);
    saveAnotherBtn.setAttribute('data-id', expenseNumberId);
    deleteBtn.setAttribute('data-id', expenseNumberId);

    const number = target.children[0].children[0].textContent;
    const description = target.children[1].children[0].textContent;
    const user = target.children[2].children[0].getAttribute('data-id');

    numberInput.value = number;
    descriptionInput.value = description;
    userSelect.value = user;
}

const saveAnother = async (e) => {
    const targetId = e.target.getAttribute('data-id');
    if (targetId !== '-1') { // editing previous expense number
        const data = gatherCheckData();

        const response = (data) ? await editExpenseNumberRoute(data, targetId) : data;

        if (response) {
            numberInput.value = "";
            descriptionInput.value = "";

            showEditedExpenseNumber(data, targetId);
        } else {
            // TODO: "Something went wrong"
        }
    } else { // saving a new expense number
        // Gather/check data
        const data = gatherCheckData();
    
        // Hit the route
        const response = (data) ? await addExpenseNumberRoute(data) : data;
    
        if (response) {
            numberInput.value = "";
            descriptionInput.value = "";
    
            showNewExpenseNumber(data);
        } else {
            // TODO: "Something went wrong, input or server problem"
        }
    }
}

const save = async (e) => {
    const targetId = e.target.getAttribute('data-id');
    if (targetId !== '-1') { // editing previous expense number
        const data = gatherCheckData();

        const response = (data) ? await editExpenseNumberRoute(data, targetId) : data;

        if (response) {
            modal.style.display = "none";
            numberInput.value = "";
            descriptionInput.value = "";

            showEditedExpenseNumber(data, targetId);
        } else {
            // TODO: "Something went wrong"
        }
    } else { // saving a new expense number
        // Gather/check data
        const data = gatherCheckData();
    
        // Hit the route
        const response = (data) ? addExpenseNumberRoute(data) : data;
    
        if (response) {
            modal.style.display = "none";
            numberInput.value = "";
            descriptionInput.value = "";
    
            showNewExpenseNumber(data);
        } else {
            // TODO: "Something went wrong, input or server problem"
        }
    }
    deleteBtn.style.display = 'inline-block';
}

const gatherCheckData = () => {
    const number = numberInput.value;
    const description = descriptionInput.value;
    const userId = userSelect.value;
    const name = userSelect.options[userSelect.selectedIndex].text;    

    if (!number || !description) return false;

    return { number, description, userId, name };
}

const editExpenseNumberRoute = async (data, id) => {
    // TODO: make this editing route in the backend
    const response = await fetch(window.location.origin + '/expensenumbers/id/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: data.number, description: data.description, userId: data.userId }),
    });

    if (!response.ok) return false;
    return data;
}

const addExpenseNumberRoute = async (data) => {
    const response = await fetch(window.location.origin + '/expensenumbers/newexpensenumber', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: data.number, description: data.description, userId: data.userId }),
    });    

    if (!response.ok) return false;
    return data;
}

const showNewExpenseNumber = (data) => {
    const newExpenseNumberLi = document.createElement('li');
    newExpenseNumberLi.setAttribute('class', 'expense-number');
    newExpenseNumberLi.addEventListener('click', editNewExpenseNumber);

    const newNumberDiv = document.createElement('div');
    newNumberDiv.setAttribute('class','expense-number-identifier small-identifier');

    const newNumberText = document.createElement('p');
    newNumberText.setAttribute('class', 'expense-number-identifier-text');
    newNumberText.textContent = data.number;

    newNumberDiv.appendChild(newNumberText);

    const newDescriptionDiv = document.createElement('div');
    newDescriptionDiv.setAttribute('class', 'expense-number-identifier big-identifier');

    const newDescriptionText = document.createElement('p');
    newDescriptionText.setAttribute('class', 'expense-number-identifier-text');
    newDescriptionText.textContent = data.description;

    newDescriptionDiv.appendChild(newDescriptionText);

    const newNameDiv = document.createElement('div');
    newNameDiv.setAttribute('class', 'expense-number-identifier big-identifier');

    const newNameText = document.createElement('p');
    newNameText.setAttribute('class', 'expense-number-identifier-text');
    newNameText.setAttribute('data-id', data.userId);
    newNameText.textContent = data.name;

    newNameDiv.appendChild(newNameText);

    newExpenseNumberLi.appendChild(newNumberDiv);
    newExpenseNumberLi.appendChild(newDescriptionDiv);
    newExpenseNumberLi.appendChild(newNameDiv);

    expenseNumberList.appendChild(newExpenseNumberLi);
}

const showEditedExpenseNumber = (data, id) => {
    const editedLi = document.getElementById('expense-' + id);

    editedLi.children[0].children[0].textContent = data.number;
    editedLi.children[1].children[0].textContent = data.description;
    editedLi.children[2].children[0].textContent = data.name;
    editedLi.children[2].children[0].setAttribute('data-id', data.userId);
}

saveAnotherBtn.addEventListener('click', saveAnother);
saveBtn.addEventListener('click', save);