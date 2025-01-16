const holderDiv = document.getElementById('expense-numbers-holder');
const initialExpenseNumberSelect = document.getElementById("expense-definers-list").children[0].children[0].children[1];

const fetchAndAppendExpenseNumbers = async () => {
    try {
        const response = await (await fetch(window.location.origin + '/expensenumbers/myexpensenumbers')).json();
        for (let i = 0; i < response.length; i++) {
            const expenseNumber = response[i];
            
            const expenseNumberDiv = document.createElement('div');
            expenseNumberDiv.setAttribute('data-id', expenseNumber.id);
            expenseNumberDiv.setAttribute('data-number', expenseNumber.number);
            expenseNumberDiv.setAttribute('data-description', expenseNumber.description);
    
            holderDiv.appendChild(expenseNumberDiv);
    
            const expenseNumberOption = document.createElement('option');
            expenseNumberOption.setAttribute('value', expenseNumber.id);
            expenseNumberOption.textContent = `${expenseNumber.number} - ${expenseNumber.description}`;
    
            initialExpenseNumberSelect.appendChild(expenseNumberOption);
        }
        const event = new Event('childrenloaded');
        holderDiv.dispatchEvent(event);
    } catch (error) {
        console.log("Fetch: expenseform", error);
        alert("An error occurred while loading the expense numbers. Refresh or try again later.");
    }
}

fetchAndAppendExpenseNumbers();