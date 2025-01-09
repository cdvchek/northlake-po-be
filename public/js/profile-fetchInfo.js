const nameText = document.getElementById('name-text');
const emailText = document.getElementById('email-text');

const fetchAndFillInfo = async () => {
    let response = await fetch(window.location.origin + '/user/myinfo');
    console.log(response);
    
    if (response.ok) {
        response = await response.json();
        nameText.textContent = response.name;
        emailText.textContent = response.email;
    } else {
        nameText.textContent = 'error';
        emailText.textContent = 'error';
    }
}

fetchAndFillInfo();