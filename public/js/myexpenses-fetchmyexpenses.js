const fetchExpenses = async () => {
    try {
        const response = await fetch(window.location.origin + '/expenses/myexpenses');
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Fetch: myexpenses", error);
        alert("An error occurred while loading your expenses. Refresh or try again later.");
        return [];
    }
}

const goToEditExpense = (e) => {
    let target = e.target;
    while (target.getAttribute('class') !== 'expense') target = target.parentElement;
    const expenseId = target.id.split('-')[1];

    const hrefArr = window.location.href.split('/');
    const sessionStartString = hrefArr[hrefArr.length - 1].split('count=')[1];

    // Go to expense form with expense id
    window.location.href = window.location.origin + '/web/expenseform_id=' + expenseId + '&prev=user&count=' + sessionStartString;
}

const expensesList = document.getElementById('expenses-list');

const executeFetchingAndAppend = async () => {
    const expenses = await fetchExpenses();

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

        // Put Vendor Div Together
        dateDiv.appendChild(dateText);

        // Put Li Together
        expenseLi.appendChild(vendorDiv);
        expenseLi.appendChild(amountDiv);
        expenseLi.appendChild(dateDiv);

        expenseLi.addEventListener('click', goToEditExpense);

        // Append Li to Ul
        expensesList.appendChild(expenseLi);
    });
}

executeFetchingAndAppend();