function createSquare() {
    const section = document.querySelector('section');
    const square = document.createElement('img');
    square.setAttribute("id", "span"); 
    square.setAttribute("src", ["https://i.imgur.com/OMVCYB2.png", "https://i.imgur.com/1dSv7Te.png", "https://i.imgur.com/LloxpfD.png"][Math.floor(Math.random() * 3)]);
    let size = Math.random() * 50;
    square.style.width = 50 + size +'px';
    square.style.height = 50 + size +'px';
    square.style.top = Math.random() * innerHeight +'px';
    square.style.left = Math.random() * innerWidth +'px';      
    section.appendChild(square);
    setTimeout(() => {
        square.remove();
    }, 5000);
}
setInterval(createSquare, 500);

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
});