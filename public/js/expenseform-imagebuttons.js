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
    const file = e.target.files[0]
    if (!file) return;

    const newFileDiv = document.createElement('div');
    newFileDiv.setAttribute('class', 'receipt-image-wrapper');
    newFileDiv.setAttribute('data-counter', ib_imageCounter);

    const removeFileBtn = document.createElement('button');
    removeFileBtn.setAttribute('class', 'image-remove');
    removeFileBtn.textContent = 'X';
    removeFileBtn.addEventListener('click', (e) => {
        const removeCounter = e.target.parentNode.getAttribute('data-counter');
        for (let i = 0; i < imageFiles.length; i++) {
            if (Number(removeCounter) === Number(imageFiles[i].counter)) {
                imageFiles.splice(i, 1);
                break;
            }
        }
        e.target.parentNode.remove();
    });

    let fileDisplayElement;

    if (file.type.startsWith('image/')) {
        // Display image
        fileDisplayElement = document.createElement('img');
        fileDisplayElement.setAttribute('class', 'receipt-image');
        fileDisplayElement.setAttribute('alt', 'picture of receipt being submitted');

        const reader = new FileReader();
        reader.onload = function(e) {
            fileDisplayElement.src = e.target.result;
        };
        reader.readAsDataURL(file);

        newFileDiv.addEventListener('click', openFullscreen); // keep for image preview
    } else if (file.type === 'application/pdf') {
        // Display PDF icon and allow fullscreen view
        fileDisplayElement = document.createElement('div');
        fileDisplayElement.setAttribute('class', 'pdf-preview');
        fileDisplayElement.textContent = `View "${file.name}"`;
        fileDisplayElement.style.cursor = 'pointer';
        fileDisplayElement.style.textAlign = 'center';
        fileDisplayElement.style.padding = '1em';
        fileDisplayElement.style.border = '1px solid #ccc';

        const reader = new FileReader();
        reader.onload = function(e) {
            fileDisplayElement.addEventListener('click', () => {
                // Open PDF in a new tab or fullscreen
                const pdfWindow = window.open();
                pdfWindow.document.write(
                    `<iframe src="${e.target.result}" width="100%" height="100%" style="border:none;"></iframe>`
                );
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert('Unsupported file type: ' + file.type);
        return;
    }

    file.counter = ib_imageCounter;
    ib_imageCounter++;
    imageFiles.push(file);

    newFileDiv.appendChild(fileDisplayElement);
    newFileDiv.appendChild(removeFileBtn);
    photoContainer.appendChild(newFileDiv);

    // OLD
    // create new image
    // const newImageDiv = document.createElement('div');
    // newImageDiv.setAttribute('class', 'receipt-image-wrapper');
    // newImageDiv.addEventListener('click', openFullscreen);
    // newImageDiv.setAttribute('data-counter', ib_imageCounter);

    // const newImage = document.createElement('img');
    // newImage.setAttribute('class', 'receipt-image');
    // newImage.setAttribute('alt', 'picture of receipt being submitted');

    // const removeNewImageBtn = document.createElement('button');
    // removeNewImageBtn.setAttribute('class', 'image-remove');
    // removeNewImageBtn.textContent = 'X';
    // removeNewImageBtn.addEventListener('click', (e) => {
    //     const removeCounter = e.target.parentNode.getAttribute('data-counter');
    //     for (let i = 0; i < imageFiles.length; i++) {
    //         const file = imageFiles[i];
    //         if (Number(removeCounter) === Number(file.counter)) {
    //             imageFiles.splice(i, 1);
    //             break;
    //         }
    //     }
    //     e.target.parentNode.remove();
    //     console.log(imageFiles);
    // });

    // newImageDiv.appendChild(newImage);
    // newImageDiv.appendChild(removeNewImageBtn);

    // const file = e.target.files[0];
    // if (file) {
    //     const reader = new FileReader();
    //     reader.onload = function(e) {
    //         newImage.src = e.target.result;
    //     };
    //     reader.readAsDataURL(file);
    // }

    // file.counter = ib_imageCounter;

    // ib_imageCounter++;
    
    // imageFiles.push(file);
    
    // photoContainer.appendChild(newImageDiv);
}

cameraInput.addEventListener('change', pictureTaken);
photoInput.addEventListener('change', pictureTaken);