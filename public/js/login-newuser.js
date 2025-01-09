const newUserBtn = document.getElementById('signup-btn');

const goToSignup = () => {
    window.location.href = window.location.origin + '/web/signup';
}

newUserBtn.addEventListener('click', goToSignup);