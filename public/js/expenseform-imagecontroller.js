const imageRemoveBtns = document.getElementsByClassName('image-remove');

const removeImage = (e) => {
    e.target.parentNode.remove();
}

for (let i = 0; i < imageRemoveBtns.length; i++) imageRemoveBtns[i].addEventListener('click', removeImage);