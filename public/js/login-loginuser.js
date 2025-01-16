// Input Elements
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');

const checkInputs = () => {
    let errorTally = 0;

    // Email Check
    if (emailInput.value == '') {
        errorTally++;
        emailInput.setAttribute('class', 'credentials-input required-input');
        emailInput.setAttribute('placeholder', 'Email - Required');
    }

    // Password Check
    if (passwordInput.value == '') {
        errorTally++;
        passwordInput.setAttribute('class', 'credentials-input required-input');
        passwordInput.setAttribute('placeholder', 'Password - Required');
    }

    return errorTally;
}

const loginUser = async () => {
    // Inputs must be filled in
    if (checkInputs() !== 0) return;

    // Login User
    try {
        const response = await fetch(window.location.origin + '/tokenAuth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailInput.value,
                password: passwordInput.value,
            }),
        });

        const data = await response.json();
        const sessionStart = data.user.session_start;
        window.location.href = window.location.origin + '/web/myexpenses_count=' + sessionStart;
    } catch (error) {
        console.log("POST: login", error);
        alert("An error occurred while logging in. Refresh or try again later.");
    }
}

// Login Button Element
const loginBtn = document.getElementById('login-btn');

loginBtn.addEventListener('click', loginUser);