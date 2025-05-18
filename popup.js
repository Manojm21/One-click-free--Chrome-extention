function adjustSize() {
  if (window.innerWidth < 600) {
    document.body.style.width = '100%';
    const container = document.getElementById('app-container');
    if (container) container.style.width = '100%';
  }
}

window.addEventListener('load', adjustSize);
window.addEventListener('resize', adjustSize);
