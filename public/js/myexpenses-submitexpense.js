const goToSubmitExpenseBtn = document.getElementById('submit-expense-btn');

const goToSubmitExpense = () => {
    const hrefArr = window.location.href.split('/');
    const sessionStartString = hrefArr[hrefArr.length - 1].split('count=')[1];

    window.location.href = window.location.origin + '/web/expenseform_id=-1&prev=user&count=' + sessionStartString;
}

goToSubmitExpenseBtn.addEventListener('click', goToSubmitExpense);