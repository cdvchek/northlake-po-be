const eb_paramsString = window.location.href.split('_')[1];
const eb_paramsArr = eb_paramsString.split('&');
const eb_expenseId = eb_paramsArr[0].split('=')[1];
const eb_sessionStart = eb_paramsArr[2].split('=')[1];

const eb_goToEditExpense = () => {
    window.location.href = window.location.origin + '/web/expenseform_id=' + eb_expenseId + '&prev=admin&count=' + eb_sessionStart;
}

const editBtn = document.getElementById('edit-btn');
editBtn.addEventListener('click', eb_goToEditExpense);