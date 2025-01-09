const hrefArr = window.location.href.split('/');
const sessionStartString = hrefArr[hrefArr.length - 1].split('count=')[1];

const myExpensesBtn = document.getElementById('myexpenses-btn');
const profileBtn = document.getElementById('profile-btn');

const goToMyExpenses = () => {
    // Check if we are at the profile page
    if (hrefArr[hrefArr.length - 1].charAt(0) !== 'm') {   
        window.location.href = window.location.origin + '/web/myexpenses_count=' + sessionStartString;
    }
}

const goToProfile = () => {
    // Check if we are at the myexpenses page
    if (hrefArr[hrefArr.length - 1].charAt(0) !== 'p') {
        window.location.href = window.location.origin + '/web/profile_count=' + sessionStartString;
    }
}

if (myExpensesBtn) {
    myExpensesBtn.addEventListener('click', goToMyExpenses);
    profileBtn.addEventListener('click', goToProfile);
}

// ADMIN SECTION

const expensesBtn = document.getElementById('expenses-btn');
const expenseNumbersBtn = document.getElementById('expensenumbers-btn');
const usersBtn = document.getElementById('users-btn');
const backToUser = document.getElementById('backtouser-btn');

const goToExpenses = () => {
    if (hrefArr[hrefArr.length - 1].substring(0,14) !== 'admin-expenses') {
        window.location.href = window.location.origin + '/web/admin-expenses_count=' + sessionStartString;
    }
}

console.log(backToUser);


const goToExpenseNumbers = () => {
    const checker = hrefArr[hrefArr.length - 1].substring(0, 20);
    console.log("CHECKER:", checker);
    
    if (hrefArr[hrefArr.length - 1].substring(0,20) !== 'admin-expensenumbers') {
        window.location.href = window.location.origin + '/web/admin-expensenumbers_count=' + sessionStartString;
    }
}

const goToUsers = () => {
    const checker = hrefArr[hrefArr.length - 1].substring(0, 11);
    console.log("CHECKER:", checker);
    
    if (hrefArr[hrefArr.length - 1].substring(0,11) !== 'admin-users') {
        window.location.href = window.location.origin + '/web/admin-users_count=' + sessionStartString;
    }
}

if (expensesBtn) {
    expensesBtn.addEventListener('click', goToExpenses);
    expenseNumbersBtn.addEventListener('click', goToExpenseNumbers);
    usersBtn.addEventListener('click', goToUsers);
    backToUser.addEventListener('click', goToMyExpenses);
}