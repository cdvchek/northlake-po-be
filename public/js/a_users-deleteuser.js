const du_deleteBtn = document.getElementById('delete-btn');
const du_modal = document.getElementById('edit-user-div-background');
const du_fnameInput = document.getElementById('edit-user-fname');
const du_lnameInput = document.getElementById('edit-user-lname');
const du_emailInput = document.getElementById('edit-user-email');
const du_passwordInput = document.getElementById('edit-user-password');
const du_passConfirmInput = document.getElementById('edit-user-password-confirm');

let du_deletionStarted = false;
let du_deletionTimeout;

const du_resetDeleteBtn = () => {
    du_deletionStarted = false;
    du_deleteBtn.textContent = "Delete";
    clearTimeout(du_deletionTimeout);
}

const du_deleteUser = async (e) => {
    if (!du_deletionStarted) {
        du_deletionStarted = true;
        du_deleteBtn.textContent = "Press again to delete";

        du_deletionTimeout = setTimeout(du_resetDeleteBtn, 3000);
    } else {
        du_resetDeleteBtn();
        const idToDelete = e.target.getAttribute('data-id');

        try {
            const response = await fetch(window.location.origin + '/user/' + idToDelete, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 409) alert("Employee could not be deleted. Employees with existing expenses cannot be deleted.");
            else if (response.ok) {   
                const deleteLi = document.getElementById('user-' + idToDelete);
                deleteLi.remove();
                
                du_modal.style.display = 'none';
                du_fnameInput.value = "";
                du_lnameInput.value = "";
                du_emailInput.value = "";
                du_passwordInput.value = "";
                du_passConfirmInput.value = "";
            }
        } catch (error) {
            console.log("DELETE: a_users", error);
        }
    }
}

du_deleteBtn.addEventListener('click', du_deleteUser)