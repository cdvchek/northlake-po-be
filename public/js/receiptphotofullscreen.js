const closeFullscreenBtn = document.getElementById('close-fullscreen');
const fullscreenDiv = document.getElementById('photo-fullscreen-div');

const closeFullscreen = () => {
    fullscreenDiv.style.display = 'none';
}

closeFullscreenBtn.addEventListener('click', closeFullscreen);