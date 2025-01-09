const de_deleteBtn = document.getElementById('delete-btn');
const de_modal = document.getElementById('add-expense-number-div-background');
const de_numberInput = document.getElementById('add-expense-number-number');
const de_descriptionInput = document.getElementById('add-expense-number-description');

const de_deleteExpenseNumber = async (e) => {
    console.log(e.target);
    
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

de_deleteBtn.addEventListener('click', de_deleteExpenseNumber);