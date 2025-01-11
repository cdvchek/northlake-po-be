const eu_fnameInput = document.getElementById('edit-user-fname');
const eu_lnameInput = document.getElementById('edit-user-lname');
const eu_emailInput = document.getElementById('edit-user-email');
const eu_passwordInput = document.getElementById('edit-user-password');
const eu_passConfirmInput = document.getElementById('edit-user-password-confirm');
const eu_saveBtn = document.getElementById('edit-user-save');
const eu_modal = document.getElementById('edit-user-div-background');

const eu_saveUser = async (e) => {
    const idToEdit = e.target.getAttribute('data-id');

    const fname = eu_fnameInput.value;
    const lname = eu_lnameInput.value;
    const email = eu_emailInput.value;
    const password = eu_passwordInput.value;
    const passConfirm = eu_passConfirmInput.value;

    const update = {
        f_name: fname,
        l_name: lname,
        email: email,
    };

    if (password) {
        if (password === passConfirm) {
            update.password = password;
        } else {
            // TODO: show password mismatch
            return;
        }
    }

    const response = await fetch(window.location.origin + '/user/id/' + idToEdit, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ update, }),
    });

    if (response.ok) {
        const editedLi = document.getElementById('user-' + idToEdit);
        editedLi.children[0].children[0].textContent = `${fname} ${lname}`;
        editedLi.children[1].children[0].textContent = email;
        
        eu_modal.style.display = 'none';
        eu_fnameInput.value = "";
        eu_lnameInput.value = "";
        ce_emailInput.value = "";
        eu_passwordInput.value = "";
        eu_passConfirmInput.value = "";
    } else {
        // TODO: show error
    }
}

eu_saveBtn.addEventListener('click', eu_saveUser);