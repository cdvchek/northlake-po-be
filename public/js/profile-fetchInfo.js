const nameText = document.getElementById('name-text');
const emailText = document.getElementById('email-text');

const fetchAndFillInfo = async () => {
    let nameValue;
    let emailValue;
    try {
        const response = await fetch(window.location.origin + '/user/myinfo');
        const data = await response.json();
        nameValue = data.name;
        emailValue = data.email;
    } catch (error) {
        console.log("Fetch: profile", error);
        nameValue = 'error';
        emailValue = 'error';
    }

    nameText.textContent = nameValue;
    emailText.textContent = emailValue;
}

fetchAndFillInfo();