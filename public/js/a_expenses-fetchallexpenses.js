
const fetchAllExpenses = async () => {
    try {
        const response = await fetch(window.location.origin + '/expenses/allexpenses');
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Fetch: a_expenses", error);
        // TODO: display an error occured while fetching expenses
        return [];
    }    
}

const goToViewExpense = (e) => {
    let target = e.target;
    while (target.getAttribute('class') !== 'expense') target = target.parentElement;
    const expenseId = target.id.split('-')[1];
    
    const hrefArr = window.location.href.split('/');
    const sessionStartString = hrefArr[hrefArr.length - 1].split('count=')[1];

    // Go to view expense with expense id
    window.location.href = window.location.origin + '/web/admin-viewexpense_id=' + expenseId + '&prev=admin&count=' + sessionStartString;
}

const expensesList = document.getElementById('expenses-list');

const executeFetchingAndAppend = async () => {
    const expenses = await fetchAllExpenses();    

    expenses.forEach(expense => {
        // Create Expense Li
        const expenseLi = document.createElement('li');
        expenseLi.setAttribute('id', `expense-${expense.expenseId}`);
        expenseLi.setAttribute('class', 'expense');

        // Create Vendor Div
        const vendorDiv = document.createElement('div');
        vendorDiv.setAttribute('class', 'expense-identifier');

        // Create Vendor Text
        const vendorText = document.createElement('p');
        vendorText.setAttribute('class', 'expense-identifier-text');
        vendorText.textContent = expense.vendor;

        // Put Vendor Div Together
        vendorDiv.appendChild(vendorText);

        // Create Amount Div
        const amountDiv = document.createElement('div');
        amountDiv.setAttribute('class', 'expense-identifier');

        // Create Amount Text
        const amountText = document.createElement('p');
        amountText.setAttribute('class', 'expense-identifier-text');
        amountText.textContent = `$${expense.amount}`;

        // Put Amount Div Together
        amountDiv.appendChild(amountText);

        // Create Date Div
        const dateDiv = document.createElement('div');
        dateDiv.setAttribute('class', 'expense-identifier');

        // Create Date Text
        const dateText = document.createElement('p');
        dateText.setAttribute('class', 'expense-identifier-text');
        dateText.textContent = expense.date;

        // Put Date Div Together
        dateDiv.appendChild(dateText);

        // Create Name Div
        const nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'expense-identifier');

        // Create Name Text
        const nameText = document.createElement('p');
        nameText.setAttribute('class', 'expense-identifier-text');
        nameText.textContent = expense.user;;

        // Put Name Div Together
        nameDiv.appendChild(nameText);

        // Create ID Tag Div
        const IDTagDiv = document.createElement('div');
        IDTagDiv.setAttribute('class', 'id-tag-div');

        // Create ID Tag Text
        const IDTagText = document.createElement('p');
        IDTagText.setAttribute('class', 'id-tag-text');
        IDTagText.textContent = expense.expenseId;

        // Shadow ID Tag Div
        const shadowIDTagDiv = document.createElement('div');
        shadowIDTagDiv.setAttribute('class', 'shadow-id-tag');

        // Put ID Tag Together
        IDTagDiv.appendChild(IDTagText);

        // Put Li Together
        expenseLi.appendChild(vendorDiv);
        expenseLi.appendChild(amountDiv);
        expenseLi.appendChild(dateDiv);
        expenseLi.appendChild(nameDiv);
        expenseLi.appendChild(IDTagDiv);
        expenseLi.appendChild(shadowIDTagDiv);

        expenseLi.addEventListener('click', goToViewExpense);

        // Append Li to Ul
        expensesList.appendChild(expenseLi);
    });
}

executeFetchingAndAppend();