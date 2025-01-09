// Input Elements
const fNameInput = document.getElementById('fname-input');
const lNameInput = document.getElementById('lname-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const isAdminCheckbox = document.getElementById('admin-checkbox');
const dbPasswordInput = document.getElementById('admin-password-input');
let adminIsChecked = false;

isAdminCheckbox.addEventListener('change', (e) => adminIsChecked = e.target.checked);

const checkInputs = () => {
    let errorTally = 0;

    // First Name Check
    if (fNameInput.value == '') {
        errorTally++;
        fNameInput.setAttribute('class', 'credentials-input required-input');
        fNameInput.setAttribute('placeholder', 'First Name - Required');
    }

    // Last Name Check
    if (lNameInput.value == '') {
        errorTally++;
        lNameInput.setAttribute('class', 'credentials-input required-input');
        lNameInput.setAttribute('placeholder', 'Last Name - Required');
    }

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

    // Check db password if admin is checked
    if (adminIsChecked && dbPasswordInput.value == '') {
        errorTally++;
        dbPasswordInput.setAttribute('class', 'credentials-input required-input');
        passwordInput.setAttribute('placeholder', 'Admin Password - Required');
    }

    return errorTally;
}

const registerUser = async () => {
    // Inputs must be filled in
    if (checkInputs() !== 0) return;

    // Register User
    const registerObj = {
        isAdmin: adminIsChecked,
        db_access_key: dbPasswordInput.value,
        email: emailInput.value,
        first_name: fNameInput.value,
        last_name: lNameInput.value,
        password: passwordInput.value,
    }

    // Register User
    const responseSignup = await fetch(window.location.origin + '/user/signup', {
        method: 'POST', // Specify the HTTP method
        headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(registerObj), // Convert the data to a JSON string
    });

    if (!responseSignup.ok) return;

    // Login User
    const response = await fetch(window.location.origin + '/tokenAuth/login', {
        method: 'POST', // Specify the HTTP method
        headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
            // Add other headers here if necessary, like Authorization
        },
        body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value,
        }), // Convert the data to a JSON string
    });

    if (response.ok) {
        const responseObj = await response.json();
        const sessionStart = responseObj.user.session_start;
        window.location.href = window.location.origin + '/web/myexpenses_count=' + sessionStart;
    }
}

// Register Button Element
const registerBtn = document.getElementById('signup-btn');

registerBtn.addEventListener('click', registerUser);