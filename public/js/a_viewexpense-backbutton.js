const bb_paramsString = window.location.href.split('_')[1];
const bb_paramsArr = bb_paramsString.split('&');
const bb_sessionStart = bb_paramsArr[2].split('=')[1];

const bb_goBack = () => {
    window.location.href = window.location.origin + '/web/admin-expenses_count=' + bb_sessionStart;
}

const backBtn = document.getElementById('back-btn');
backBtn.addEventListener('click', bb_goBack);