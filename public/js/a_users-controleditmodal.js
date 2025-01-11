const ce_cancelBtn = document.getElementById('edit-user-cancel');
const ce_modal = document.getElementById('edit-user-div-background');
const ce_fnameInput = document.getElementById('edit-user-fname');
const ce_lnameInput = document.getElementById('edit-user-lname');
const ce_emailInput = document.getElementById('edit-user-email');
const ce_passwordInput = document.getElementById('edit-user-password');
const ce_passConfirmInput = document.getElementById('edit-user-password-confirm');

const ce_closeModal = () => {
    ce_modal.style.display = 'none';
    ce_fnameInput.value = "";
    ce_lnameInput.value = "";
    ce_emailInput.value = "";
    ce_passwordInput.value = "";
    ce_passConfirmInput.value = "";
}

ce_cancelBtn.addEventListener('click', ce_closeModal);