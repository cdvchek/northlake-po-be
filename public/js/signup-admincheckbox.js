const adminCheckbox = document.getElementById('admin-checkbox');
const adminPasswordDiv = document.getElementById('admin-password-div');

let isAdminPasswordShowing = false;
const toggleAdminPassword = () => {
    isAdminPasswordShowing = !isAdminPasswordShowing;

    if (isAdminPasswordShowing) adminPasswordDiv.style.display = 'flex'; 
    else adminPasswordDiv.style.display = 'none';
}

adminCheckbox.addEventListener('click', toggleAdminPassword);