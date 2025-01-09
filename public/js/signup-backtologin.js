const backToLoginBtn = document.getElementById('login-btn');

const goBackToLogin = () => {
    window.location.href = window.location.origin + '/web/login';
}

backToLoginBtn.addEventListener('click', goBackToLogin);