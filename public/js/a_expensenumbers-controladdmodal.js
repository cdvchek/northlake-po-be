const openModal = document.getElementById('add-expense-number-btn');
const closeModal = document.getElementById('add-expense-number-cancel');
const addModal = document.getElementById('add-expense-number-div-background');
const cm_numberInput = document.getElementById('add-expense-number-number');
const cm_descriptionInput = document.getElementById('add-expense-number-description');
const cm_saveBtn = document.getElementById('add-expense-number-save');
const cm_saveAnotherBtn = document.getElementById('add-expense-number-save-another');
const cm_deleteBtn = document.getElementById('delete-btn');

const openAddModal = () => {
    addModal.style.display = 'flex';
    cm_saveBtn.setAttribute('data-id', '-1');
    cm_saveAnotherBtn.setAttribute('data-id', '-1');
    cm_deleteBtn.style.display = 'none';
}

const closeAddModal = () => {
    addModal.style.display = 'none';
    cm_numberInput.value = "";
    cm_descriptionInput.value = "";
    cm_deleteBtn.style.display = 'inline-block';
}

closeModal.addEventListener('click', closeAddModal);
openModal.addEventListener('click', openAddModal);