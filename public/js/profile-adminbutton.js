const adminDiv = document.getElementById('admin-btn-space');

const goToAdmin = () => {
    const sessionStartString = hrefArr[hrefArr.length - 1].split('count=')[1];
    window.location.href = window.location.origin + '/web/admin-expenses_count=' + sessionStartString;
}

const adminCheck = async () => {
    try {
        const response = await fetch(window.location.origin + '/user/admincheck');
        const data = await response.json();
        return data.isAdmin;    
    } catch (error) {
        console.log("Fetch: profile", error);
        alert("An error occurred while loading your profile information. Refresh or try again later.");
        return false;
    }
}

const adminCheckWrapper = async () => {
    if (await adminCheck()) {
        // Correct css spacing
        const infoSpace = document.getElementById('info-space');
        infoSpace.style.height = '42%';
        infoSpace.style.alignItems = 'flex-end';
        adminDiv.style.height = '40%';
        adminDiv.style.display = 'flex';

        const adminBtnWrapper = document.createElement('div');
        adminBtnWrapper.setAttribute('id', 'admin-btn-wrapper');

        const toAdminBtn = document.createElement('button');
        toAdminBtn.setAttribute('id', 'admin-btn');
        toAdminBtn.addEventListener('click', goToAdmin);
        toAdminBtn.textContent = "Admin";
        
        adminBtnWrapper.append(toAdminBtn);
        adminDiv.append(adminBtnWrapper);
    }
}

adminCheckWrapper();