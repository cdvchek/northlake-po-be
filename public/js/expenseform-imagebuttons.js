const newPhotoBtn = document.getElementById('new-photo-btn');
const cameraInput = document.getElementById('camera-input');
const choosePhotoBtn = document.getElementById('choose-photo-btn');
const photoInput = document.getElementById('photo-input');
const photoContainer = document.getElementById('photo-viewer');
const fullScreenDiv = document.getElementById('photo-fullscreen-div');
const fullScreenImg = document.getElementById('photo-fullscreen');
let ib_imageCounter = 0;

newPhotoBtn.addEventListener('click', () => cameraInput.click());
choosePhotoBtn.addEventListener('click', () => photoInput.click());

const openFullscreen = (e) => {
    if (e.target.src) {   
        fullScreenDiv.style.display = 'flex';
        fullScreenImg.src = e.target.src;
    }
}

const pictureTaken = (e) => {
    // create new image
    const newImageDiv = document.createElement('div');
    newImageDiv.setAttribute('class', 'receipt-image-wrapper');
    newImageDiv.addEventListener('click', openFullscreen);
    newImageDiv.setAttribute('data-counter', ib_imageCounter);

    const newImage = document.createElement('img');
    newImage.setAttribute('class', 'receipt-image');
    newImage.setAttribute('alt', 'picture of receipt being submitted');

    const removeNewImageBtn = document.createElement('button');
    removeNewImageBtn.setAttribute('class', 'image-remove');
    removeNewImageBtn.textContent = 'X';
    removeNewImageBtn.addEventListener('click', (e) => {
        const removeCounter = e.target.parentNode.getAttribute('data-counter');
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (Number(removeCounter) === Number(file.counter)) {
                imageFiles.splice(i, 1);
                break;
            }
        }
        e.target.parentNode.remove();
        console.log(imageFiles);
    });

    newImageDiv.appendChild(newImage);
    newImageDiv.appendChild(removeNewImageBtn);

    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    file.counter = ib_imageCounter;

    ib_imageCounter++;
    
    imageFiles.push(file);
    
    photoContainer.appendChild(newImageDiv);
}

cameraInput.addEventListener('change', pictureTaken);
photoInput.addEventListener('change', pictureTaken);