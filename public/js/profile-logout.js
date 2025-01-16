const logoutBtn = document.getElementById('logout-btn');

const logoutFunction = async () => {
    window.location.href = window.location.origin + '/web/login';
}

logoutBtn.addEventListener('click', logoutFunction);