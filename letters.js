document.addEventListener('DOMContentLoaded', (event) => {
    const element = document.getElementById('typewriter');
    const words = ['Founders.', 'Hustlers.', 'Dreamers.', 'Hackers.'];
    let currentWord = 0;
    let currentLetter = 0;
    let isDeleting = false;
    let typingSpeed = 150;

    function typeWriter() {
        if (currentWord === words.length) {
            currentWord = 0;
        }

        const fullWord = words[currentWord];
        let displayedText = isDeleting ? fullWord.substring(0, currentLetter - 1) : fullWord.substring(0, currentLetter + 1);
        element.textContent = displayedText;

        if (isDeleting) {
            currentLetter -= 1;
            typingSpeed = 100;
        } else {
            currentLetter += 1;
            typingSpeed = 150;
        }

        if (currentLetter === fullWord.length) {
            isDeleting = true;
            typingSpeed = 1000;
        } else if (currentLetter === 0) {
            isDeleting = false;
            currentWord += 1;
        }

        setTimeout(typeWriter, typingSpeed);
    }

    typeWriter();
});
