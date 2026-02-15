const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');
const playButton = document.getElementById('playButton');
const goBackButton = document.getElementById('goBackButton');

const pressSound = document.getElementById('pressSound');
const pressButton = document.getElementById('pressButton');
const commandText = document.getElementById('commandText');
const progressText = document.getElementById('progressText');
const timerBar = document.getElementById('timerBar');
const originalBg = getComputedStyle(document.body).backgroundColor;
let currentCommand = 0;
let timer;
let timeLeft = 0;
let totalTime = 0;
let waitingForAnswer = false;
let shouldPress = false;
let activeIntervals = [];
let activeTimeouts = [];



const commands = [
    //----- NEW COMMANDS -----
    { text: "Remember this number: \n 4", answer: false, time : 4 },
    { text: "Quick! Don't press!", answer: false, time: 3 },

    { text: "Press if background is your favorite color", colorCheck: true, time: 8, favColor: "purple" },

    { text: "Solve 4 * 3 - 3 presses", presses: (4*3)-3, time: 10 }, // DONE
    { text: "Press!", presses: 4, num: true, time: 7 }, // DONE
    { text: "Press if you love donuts", donut: true, time: 7 }, // DONE

    { text: "Press at least 15 times", minPresses: 15, time: 6 }, // DONE
    { text: "Press if you love me", answer: true, time: 3 },
    { text: "Press if you see a hyrax", hyrax: true, time: 7 },
    { text: "Don't touch the button!", strict: true, time: 5 },
    { text: "Press exactly 3 times", presses: 3 },
    { text: "The month we got together = press", presses: 9, time: 7 },
    { text: "Wait...", answer: false, time : 4 },
    { text: "Press twice!", presses: 2 },
    { text: "Press if I'm cute", answer: true },
    { text: "Press if hearts are even", hearts: true },
    { text: "Press once", presses: 1 },
    { text: "Do nothing", answer: false }, // do zmiany
    { 
    text: "Press if today is Valentine's", 
    answer: (new Date().getMonth() === 1 && new Date().getDate() === 14) ? true : false 
    },
    { text: "Don't press!", answer: false },
    { text: "Press if you want a kiss", answer: true },
    { text: "Last one: PRESS AT LEAST 100 TIMES!", minPresses: 50, time: 10 }, // DONE

];

function buildTimer(seconds) {
    timerBar.innerHTML = "";
    for (let i = 0; i < seconds; i++) {
        const segment = document.createElement("div");
        segment.classList.add("timer-segment");
        timerBar.appendChild(segment);
    }
}

playButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameStart();
});

goBackButton.addEventListener('click', () => {
      // Remove any old cleanup (like intervals, event listeners

    resetGame();

});

pressButton.addEventListener('click', () => {
    if (!waitingForAnswer) return;

    // --- SOUND ---
    pressSound.currentTime = 0;
    pressSound.play();

    // --- VIBRATION (phones) ---
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    const cmd = commands[currentCommand];

    if (cmd.presses || cmd.minPresses) {
        cmd.current = (cmd.current || 0) + 1;
    } else {
        cmd.userPressed = true;
    }
});

function gameStart() {
    currentCommand = 0;
    nextCommand();
}

function nextCommand() {
    if (currentCommand >= commands.length) {
        endGame();
        return;
    }

    const cmd = commands[currentCommand];
    waitingForAnswer = true;
    totalTime = cmd.time || 5;
    timeLeft = totalTime;
    buildTimer(totalTime);
    progressText.textContent = "";

   // HEART COMMAND
    if (cmd.hearts) {
        const count = Math.floor(Math.random() * 6) + 3; // 3–8 hearts
        const hearts = "❤️".repeat(count);
        pressButton.textContent = hearts;

        // Randomly choose whether to ask for even or odd
        const evenOrOdd = Math.random() < 0.5 ? "even" : "odd";
        commandText.textContent = `Press if hearts are ${evenOrOdd}`;

        // Determine if user should press
        if (evenOrOdd === "even") {
            shouldPress = count % 2 === 0;
        } else {
            shouldPress = count % 2 !== 0;
        }

        cmd.userPressed = false; // reset
    }

    // HYRAX COMMAND
    else if (cmd.hyrax) {
        commandText.textContent = "Press if you see a hyrax";
        pressButton.textContent = "WAIT...";
        shouldPress = false;

        setTimeout(() => {
            pressButton.textContent = "HYRAX!";
            shouldPress = true;

            // Create jumpscare image
            const hyraxImg = document.createElement("img");
            hyraxImg.src = "hyrax.webp"; // make sure to have this image in your project
            hyraxImg.style.position = "fixed";
            hyraxImg.style.top = "50%";
            hyraxImg.style.left = "50%";
            hyraxImg.style.transform = "translate(-50%, -50%) scale(0)";
            hyraxImg.style.width = "300px";
            hyraxImg.style.height = "auto";
            hyraxImg.style.zIndex = "9999";
            hyraxImg.style.borderRadius = "10px";
            hyraxImg.style.boxShadow = "0 0 20px red";
            hyraxImg.style.transition = "transform 0.2s ease-out";
            document.body.appendChild(hyraxImg);

             // --- Play jumpscare sound ---
            const hyraxSound = new Audio("https://www.soundjay.com/horror/horror-jump-01.mp3"); // example jump-scare sound
            hyraxSound.currentTime = 0;
            hyraxSound.play();

            // --- Vibrate (mobile) ---
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // short vibration pattern
            }

            // Animate jumpscare (pop-out)
            setTimeout(() => {
                hyraxImg.style.transform = "translate(-50%, -50%) scale(1.2)";
            }, 50);

            // Shrink and remove after 1 second
            setTimeout(() => {
                hyraxImg.style.transform = "translate(-50%, -50%) scale(0)";
            }, 3000);

            setTimeout(() => {
                hyraxImg.remove();
            }, 1300);
        }, 2000); // show jumpscare after 2 second wait
    }

    // PRESS COUNT COMMAND
    else if (cmd.presses) {
        cmd.current = 0;
        commandText.textContent = cmd.text;
        pressButton.textContent = "PRESS";

        function showReminderPopup() {
        const popup = document.createElement('div');
        popup.textContent = "Do you remember how many times?";
        popup.style.position = "fixed";
        popup.style.top = "20%";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = "rgba(255,255,255,0.9)";
        popup.style.border = "2px solid #000";
        popup.style.borderRadius = "10px";
        popup.style.padding = "15px 25px";
        popup.style.fontSize = "18px";
        popup.style.fontWeight = "bold";
        popup.style.zIndex = "10000";
        popup.style.boxShadow = "0 0 15px rgba(0,0,0,0.5)";
        document.body.appendChild(popup);

        // Remove popup after 1.5 seconds
        setTimeout(() => popup.remove(), 2500);
    }

        if (cmd.num) {
        setTimeout(() => showReminderPopup(), 2000);
    }
    }

    // STRICT "Don't touch" COMMAND
    else if (cmd.strict) {
        commandText.textContent = cmd.text;
        pressButton.textContent = "DO NOT TOUCH";

        shouldPress = false;  // player should NOT press
        cmd.userPressed = false;

        // Track if user touches button
        cmd.failed = false;

        function mouseOverHandler() {
            cmd.failed = true;
        }

        pressButton.addEventListener("mouseenter", mouseOverHandler);

        // Store cleanup to remove listener later
        cmd._cleanup = () => {
            pressButton.removeEventListener("mouseenter", mouseOverHandler);
        };
    }



// MAX PRESS COMMAND
else if (cmd.pressesMax) {
    cmd.current = 0;
    commandText.textContent = cmd.text;
    pressButton.textContent = "PRESS";
    shouldPress = true;
}

// MIN PRESS COMMAND
else if (cmd.minPresses) {
    cmd.current = 0;
    commandText.textContent = cmd.text;
    pressButton.textContent = "PRESS";
    shouldPress = true;
}

// BACKGROUND COLOR COMMAND
else if (cmd.colorCheck) {
    commandText.textContent = cmd.text;
    pressButton.textContent = "WAIT...";
    cmd.userPressed = false; // Did the user press at the right time?
    let elapsed = 0;
    const colors = ["red","yellow","purple","pink","cyan","lime","teal","blue","orange"];

    // Shuffle colors (Fisher–Yates)
    const shuffled = [...colors];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Ensure purple is NOT last
    if (shuffled[shuffled.length - 1] === cmd.favColor) {
        const swapIndex = Math.floor(Math.random() * (shuffled.length - 1));
        [shuffled[shuffled.length - 1], shuffled[swapIndex]] =
            [shuffled[swapIndex], shuffled[shuffled.length - 1]];
    }

    let index = 0;
    cmd.favAppearances = 0;
    cmd.userPresses = 0;
    cmd.wrongPress = false;

    const colorInterval = setInterval(() => {
        const color = shuffled[index];
        document.body.style.backgroundColor = color;

        if (color === cmd.favColor) {
            pressButton.textContent = "PRESS!";
            cmd.favAppearances++;
            cmd.currentColorIsFav = true;
        } else {
            pressButton.textContent = "WAIT...";
            cmd.currentColorIsFav = false;
        }

        index++;

        // Stop when colors end or time runs out
        if (index >= shuffled.length || index >= cmd.time) {
            clearInterval(colorInterval);
        }
    }, 1000);


    // Track presses
    function pressHandler() {
        if (cmd.currentColorIsFav) {
            cmd.userPresses++;
        }
        else {
        cmd.wrongPress = true; // pressed when not favorite color
    }
    }

    pressButton.addEventListener("click", pressHandler);

    // Save cleanup function to stop interval and listener
    cmd._cleanup = () => {
        clearInterval(colorInterval);
        pressButton.removeEventListener("click", pressHandler);
        document.body.style.backgroundColor = originalBg; // reset immediately
        cmd.userPresses = 0;
        cmd.favAppearances = 0;
        cmd.wrongPress = false;
    };
}

// MATH COMMAND
else if (cmd.pressesCalc) {
    cmd.current = 0;
    commandText.textContent = cmd.text;
    pressButton.textContent = "PRESS";
    shouldPress = true;
}

// DONUT COMMAND
else if (cmd.donut) {
    commandText.textContent = cmd.text;
    pressButton.textContent = "PRESS";
    shouldPress = false;

    setTimeout(() => {
        pressButton.textContent = "DONUT!";
        shouldPress = true;

        // Show donut jumpscare
        const donutImg = document.createElement("img");
        donutImg.src = "donuts.jpg";
        donutImg.style.position = "fixed";
        donutImg.style.top = "50%";
        donutImg.style.left = "50%";
        donutImg.style.transform = "translate(-50%, -50%) scale(0)";
        donutImg.style.width = "300px";
        donutImg.style.height = "auto";
        donutImg.style.zIndex = "9999";
        donutImg.style.borderRadius = "10px";
        donutImg.style.boxShadow = "0 0 20px yellow";
        donutImg.style.transition = "transform 0.2s ease-out";
        document.body.appendChild(donutImg);

        const donutSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");
        donutSound.play();

        if (navigator.vibrate) navigator.vibrate([100,50,100]);

        setTimeout(() => donutImg.style.transform = "translate(-50%, -50%) scale(1.2)", 50);
        setTimeout(() => donutImg.style.transform = "translate(-50%, -50%) scale(0)", 3000);
        setTimeout(() => donutImg.remove(), 4300);
    }, 2000);
}

    // SIMPLE YES/NO COMMAND
    else {
        commandText.textContent = cmd.text;
        pressButton.textContent = "PRESS";
        shouldPress = cmd.answer;
        cmd.userPressed = false;
    }

    startTimer();
}

function startTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
        timeLeft--;

        const segments = timerBar.children;
        if (segments[timeLeft]) {
            segments[timeLeft].classList.add("off");
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            checkResult();
        }
    }, 1000);
}

function checkResult() {
    waitingForAnswer = false;
    const cmd = commands[currentCommand];
    let success = true;

    // --- PRESS COUNT COMMANDS ---
    if (cmd.presses) {
        success = cmd.current === cmd.presses;
    } 
    else if (cmd.minPresses) {
    success = cmd.current >= cmd.minPresses;
    cmd.current = 0; // reset for next time if needed
    }
    else if (cmd.pressesMax) {
        success = cmd.current <= cmd.pressesMax;
    } 
    else if (cmd.pressesCalc) {
        success = cmd.current === cmd.pressesCalc;
    } 

    // --- HEARTS & HYRAX & DONUT & COLOR ---
    else if (cmd.hearts || cmd.hyrax || cmd.donut) {
        success = (cmd.userPressed === shouldPress);
    }

else if (cmd.colorCheck) {
    if (cmd.favAppearances === 0) {
        // If favorite color never appeared, user must not press
        success = !cmd.wrongPress && cmd.userPresses === 0;
    } else {
        // Otherwise presses must match appearances
        success = (cmd.userPresses === cmd.favAppearances) && !cmd.wrongPress;
    }

    document.body.style.backgroundColor = originalBg;
}

    // --- HOLD ---
   else if (cmd.hold) {
    success = cmd.userHolding === true; // must still be holding when time ends
    if (cmd._cleanup) cmd._cleanup();
}

    // --- STRICT ---
    else if (cmd.strict) {
        success = !cmd.failed;
        if (cmd._cleanup) cmd._cleanup();
    }

    // --- SIMPLE YES/NO ---
    else {
        success = (cmd.userPressed === shouldPress);
    }

    if (!success) {
        gameOver();
        return;
    }

    currentCommand++;
    setTimeout(nextCommand, 800);
}

function gameOver() {
    commandText.textContent = "Mission failed 💔";
    pressButton.textContent = "Try again";

    // Remove any old cleanup (like intervals, event listeners)
    const cmd = commands[currentCommand];
    if (cmd && cmd._cleanup) cmd._cleanup();

    // Enable button to restart the game
    pressButton.onclick = () => {
        resetGame();
    };
}

function resetGame() {
    activeIntervals.forEach(id => clearInterval(id));
    activeIntervals = [];
    // Reset game state
    currentCommand = 0;
    waitingForAnswer = false;
    shouldPress = false;
    timeLeft = 0;
    totalTime = 0;

    // Reset commands (press counts, userPressed, etc.)
    commands.forEach(cmd => {
        cmd.current = 0;
        cmd.userPressed = false;
        cmd.userHolding = false;
        cmd.failed = false;
        cmd.userPresses = 0;
        cmd.requiredPresses = 0;
    });

    // Reset UI
    document.body.style.backgroundColor = originalBg; // default
    timerBar.innerHTML = "";
    progressText.textContent = "";
    pressButton.textContent = "PRESS";
    pressButton.style.display = "inline-block";

    // Go back to start screen
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');

    // Restore original play button behavior
    pressButton.onclick = null;
}

function createConfetti() {
    const colors = ['#ff4d88', '#ffb3d1', '#ff69b4', '#ff1493'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '9999';
            confetti.style.transition = `top ${Math.random() * 3 + 2}s linear`;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.style.top = '110%';
            }, 10);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 50);
    }
}

// Call in endGame():
function endGame() {
    // ... your existing code ...
    createConfetti();
}

function endGame() {
    // Hide game screen
    gameScreen.classList.add('hidden');
    
    // Show end screen
    const endScreen = document.getElementById('endScreen');
    endScreen.classList.remove('hidden');
    
    // Show slideshow
    const slideshow = document.getElementById('heartSlideshow');
    slideshow.classList.remove('hidden');

    const slides = slideshow.querySelectorAll('.slide');
    let currentIndex = 0;

    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === 0) slide.classList.add('active');
    });

    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 3000);

    // Add dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'slideshow-dots';
    slideshow.appendChild(dotsContainer);
    
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => {
            slides[currentIndex].classList.remove('active');
            slides[i].classList.add('active');
            currentIndex = i;
            updateDots();
        };
        dotsContainer.appendChild(dot);
    });
    
    function updateDots() {
        document.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentIndex);
        });
    }
    
    // Update dots in your interval
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
        updateDots();
    }, 3000);


    createConfetti();
}

/* ---------------------------
   Falling hearts animation
---------------------------- */

function createFallingItem() {
    const items = ['❤️', '🍩'];

    const item = document.createElement('div');
    item.innerHTML = items[Math.floor(Math.random() * items.length)];
    item.style.position = 'fixed';
    item.style.left = Math.random() * 100 + '%';
    item.style.top = '-50px';
    item.style.fontSize = (Math.random() * 30 + 30) + 'px';
    item.style.opacity = Math.random() * 0.5 + 0.3;
    item.style.zIndex = '-1';
    item.style.pointerEvents = 'none';

    document.body.appendChild(item);

    const duration = Math.random() * 3 + 5;
    item.style.transition = `top ${duration}s linear`;

    setTimeout(() => {
        item.style.top = '110%';
    }, 10);

    setTimeout(() => {
        item.remove();
    }, duration * 1000);
}

// create falling items continuously
setInterval(createFallingItem, 200);