const de_deleteBtn = document.getElementById('delete-btn');
const de_modal = document.getElementById('add-expense-number-div-background');
const de_numberInput = document.getElementById('add-expense-number-number');
const de_descriptionInput = document.getElementById('add-expense-number-description');

let de_deletionStarted = false;
let de_deletionTimeout;

const de_resetDeleteBtn = () => {
    de_deletionStarted = false;
    de_deleteBtn.textContent = "Delete";
    clearTimeout(de_deletionTimeout);
}

const de_deleteExpenseNumber = async (e) => {
    if (!de_deletionStarted) {
        de_deletionStarted = true;
        de_deleteBtn.textContent = "Press again to delete";
        de_deletionTimeout = setTimeout(de_resetDeleteBtn, 3000);
    } else {
        const idToDelete = e.target.getAttribute('data-id');
    
        const response = await fetch(window.location.origin + '/expenseNumbers/' + idToDelete, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        if (!response.ok) {}// TODO: show error
        else {
            const elementToRemove = document.getElementById('expense-' + idToDelete);
            elementToRemove.remove();
    
            de_modal.style.display = 'none';
            de_numberInput.value = "";
            de_descriptionInput.value = "";
        }
    }
}

de_deleteBtn.addEventListener('click', de_deleteExpenseNumber);