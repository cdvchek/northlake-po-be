const fu_fetchUsers = async () => {
    const response = await fetch(window.location.origin + '/user/all-email');

    if (response.ok) {
        const data = await response.json();
        fu_displayUsers(data);
    }
}

fu_fetchUsers();

const fu_displayUsers = (data) => {
    
    const usersList = document.getElementById('users-list');
    for (let i = 0; i < data.length; i++) {
        const user = data[i];
        console.log(user);
        
        // Create User Li
        const userLi = document.createElement('li');
        userLi.setAttribute('id', 'user-' + user.id);
        userLi.setAttribute('class', 'user');
        userLi.addEventListener('click', fu_editUser);

        // Create Name Div
        const nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'user-identifier big-identifier');

        // Create Name Text
        const nameText = document.createElement('p');
        nameText.setAttribute('class', 'user-identifier-text');
        nameText.textContent = user.name;

        nameDiv.appendChild(nameText);
        userLi.appendChild(nameDiv);

        // Create Email Div
        const emailDiv = document.createElement('div');
        emailDiv.setAttribute('class', 'user-identifier big-identifier');

        // Create Email Text
        const emailText = document.createElement('p');
        emailText.setAttribute('class', 'user-identifier-text');
        emailText.textContent = user.email;

        emailDiv.appendChild(emailText);
        userLi.appendChild(emailDiv);

        usersList.appendChild(userLi);
    }
}

const fu_modal = document.getElementById('edit-user-div-background');
const fu_fnameInput = document.getElementById('edit-user-fname');
const fu_lnameInput = document.getElementById('edit-user-lname');
const fu_emailInput = document.getElementById('edit-user-email');
const fu_saveBtn = document.getElementById('edit-user-save');
const fu_deleteBtn = document.getElementById('delete-btn');

const fu_editUser = (e) => {
    fu_modal.style.display = 'flex';
    
    let target = e.target;
    while (target.tagName !== 'LI') target = target.parentNode;

    const userId = target.getAttribute('id').split('-')[1];
    fu_saveBtn.setAttribute('data-id', userId);
    fu_deleteBtn.setAttribute('data-id', userId);

    const fname = target.children[0].children[0].textContent.split(' ')[0];
    const lname = target.children[0].children[0].textContent.split(' ')[1];
    const email = target.children[1].children[0].textContent;

    fu_fnameInput.value = fname;
    fu_lnameInput.value = lname;
    fu_emailInput.value = email;
}