const backBtn = document.getElementById('go-back-btn');

const paramsString = window.location.href.split('_')[1];
const paramsArr = paramsString.split('&');
const goingBackTo = paramsArr[1].split('=')[1];
const sessionStartString = paramsArr[2].split('=')[1];
const id = paramsArr[0].split('=')[1];

const goBack = () => {
    let addressMiddle;
    if (goingBackTo === 'user') addressMiddle = '/web/myexpenses_count=';
    if (goingBackTo === 'admin') addressMiddle = '/web/admin-viewexpense_id=' + id + '&prev=admin&count=';
    
    window.location.href = window.location.origin + addressMiddle + sessionStartString;
}

backBtn.addEventListener('click', goBack);