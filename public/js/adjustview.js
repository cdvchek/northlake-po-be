function adjustViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

adjustViewportHeight();
window.addEventListener('resize', adjustViewportHeight);