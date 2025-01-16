const timerDisplay = document.getElementById('countdown-text');

const logout = () => {
    window.location.href = window.location.origin + '/web/login';
}

const startTimer = () => {

    const hrefArr = window.location.href.split('/');
    const sessionStartString = hrefArr[hrefArr.length - 1].split('count=')[1];
    const sessionStart = Number(sessionStartString);

    const now = Date.now();
    // Sessions are 20 mins, get the time from the start of the session and subtract that from 15 mins
    const secondsLeftInSession = Math.floor(((20 * 60 * 1000) - (now - sessionStart)) / 1000);
    const minutesLeftInSession = Math.floor(secondsLeftInSession / 60);

    let currentTime = secondsLeftInSession;
    let mins = minutesLeftInSession;
    let seconds = secondsLeftInSession % 60;
    
    const interval = setInterval(() => {
        mins = parseInt(currentTime / 60, 10);
        seconds = parseInt(currentTime % 60, 10);

        mins = mins < 10 ? '0' + mins : mins;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = mins + ':' + seconds;

        if (--currentTime < 0) {
            clearInterval(interval);
            logout();
        }
    }, 1000);
}

startTimer();