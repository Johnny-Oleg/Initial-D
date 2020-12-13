'use strict';

const MAX_RIVALS = 8;
const HEIGHT = 100;
const countSection = Math.floor(document.documentElement.clientHeight / HEIGHT); 

const $score = document.querySelector('.score');
const $start = document.querySelector('.start');
const $gameArea = document.querySelector('.game-area');
const $car = document.createElement('div');
const $audio = document.createElement('embed');
const $topScore = document.querySelector('.top-score');

const audio_1 = 'audio/audio_1.mp3';
const audio_2 = 'audio/audio_2.mp3';
const audio_3 = 'audio/audio_3.mp3';
const audio_4 = 'audio/audio_4.mp3';
const audio_5 = 'audio/audio_5.mp3';
const audio_6 = 'audio/audio_6.mp3';

const music = [audio_1, audio_2, audio_3, audio_4, audio_5, audio_6];
const random = arr => arr[Math.floor(Math.random() * arr.length)];
const randomTrack = random(music);

$car.classList.add('car');
$gameArea.style.height = countSection * HEIGHT;
$audio.type = 'audio/mp3';
$audio.style.cssText = `
    width: 200px; height: 80px; position: absolute; top: 50px; left: 0; z-index: 100
`;

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false,
}

const settings = {
    start: false,
    score: 0,
    speed: 0,
    traffic: 0,
    level: 0,
}

let level = settings.level;

const getScore = parseInt(localStorage.getItem('score', settings.score));

$topScore.textContent = getScore ? `Top Score: ${getScore}` : `Top Score: ${0}`;

const addToLocalStorage = () => {
    if (getScore < settings.score) {
        localStorage.setItem('score', settings.score);
        $topScore.textContent = settings.score;
    }
}    

const getQuantityElements = heightElement => $gameArea.offsetHeight / heightElement + 1;

const startGame = ({ target }) => {
    if (target === $start) return;

    switch (target.id) {
        case 'easy':
            settings.speed = 3;
            settings.traffic = 5;
            break;
        case 'normal':
            settings.speed = 4;
            settings.traffic = 4;
            break;
        case 'hard':
            settings.speed = 5;
            settings.traffic = 3;
            break;
    }

    $start.classList.add('hide');
    $gameArea.innerHTML = '';

    for (let i = 0; i < getQuantityElements(HEIGHT); i++) {
        const $line = document.createElement('div');

        $line.classList.add('line');
        $line.style.height = `${HEIGHT / 2}px`;
        $line.style.top = `${(i * HEIGHT)}px`;
        $line.y = i * HEIGHT;

        $gameArea.append($line);
    }

    for (let i = 0; i < getQuantityElements(HEIGHT * settings.traffic); i++) {
        const $rival = document.createElement('div');

        const randomRival = Math.floor(Math.random() * MAX_RIVALS) + 1;
        const rivalSpawn = -HEIGHT * settings.traffic * (i + 1);

        $rival.classList.add('rival');
        $rival.y = rivalSpawn < 100 ? -100 * settings.traffic * (i + 1) : rivalSpawn;
        $rival.style.top = `${$rival.y}px`;
        $rival.style.background = `
            transparent url(./image/enemy${randomRival}.png) center / cover no-repeat
        `;

        $gameArea.append($rival);
        
        $rival.style.left = `
            ${Math.floor(Math.random() * ($gameArea.offsetWidth - $rival.offsetWidth))}px
        `;
    }

    settings.score = 0;
    settings.start = true;
    $audio.src = randomTrack;

    $gameArea.append($car);
    document.body.append($audio);

    $car.style.top = 'auto'; 
    $car.style.bottom = '10px';
    $car.style.left = `${$gameArea.offsetWidth / 2 - $car.offsetWidth / 2}px`;

    settings.x = $car.offsetLeft;
    settings.y = $car.offsetTop;
    $score.style = `top: 0; left: 0`;

    requestAnimationFrame(playGame);
}    

const playGame = () => {
    settings.level = Math.floor(settings.score / 3000);

    if (settings.level !== level) {
        level = settings.level;
        settings.speed += 1;
    }

    if (settings.start) {
        settings.score += settings.speed;
        $score.innerHTML = `SCORE<br>${settings.score}`;

        moveRoad();
        moveRival();

        if (keys.ArrowLeft && settings.x > 0) {
            settings.x -= settings.speed;
        }

        if (keys.ArrowRight && settings.x < ($gameArea.offsetWidth - $car.offsetWidth)) {
            settings.x += settings.speed;
        }    

        if (keys.ArrowUp && settings.y > 0) {
            settings.y -= settings.speed;
        }

        if (keys.ArrowDown && settings.y < ($gameArea.offsetHeight - $car.offsetHeight)) {
            settings.y += settings.speed;
        }

        $car.style.left = `${settings.x}px`;
        $car.style.top = `${settings.y}px`;
        
        requestAnimationFrame(playGame);
    }
}

const startRun = e => {
    if (keys.hasOwnProperty(e.key)) {
        e.preventDefault();

        keys[e.key] = true;
    }
}
 
const stopRun = e => {
    if (keys.hasOwnProperty(e.key)) {
        e.preventDefault();

        keys[e.key] = false;
    }
}

const moveRoad = () => {
    const $lines = document.querySelectorAll('.line');

    $lines.forEach(line => {
        line.y += settings.speed;
        line.style.top = `${line.y}px`;

        line.y >= $gameArea.offsetHeight && (line.y = -HEIGHT);
    });
}

const moveRival = () => {
    const $rivals = document.querySelectorAll('.rival');

    $rivals.forEach(rival => {
        let carRect = $car.getBoundingClientRect();
        let rivalRect = rival.getBoundingClientRect();

        if (carRect.top <= rivalRect.bottom && 
            carRect.right >= rivalRect.left && 
            carRect.left <= rivalRect.right && 
            carRect.bottom >= rivalRect.top
        ) {
            $audio.remove();

            settings.start = false;
            $start.classList.remove('hide');
            $score.style.top = `${$start.offsetHeight}px`;

            addToLocalStorage();
        }

        rival.y += settings.speed / 1;
        rival.style.top = `${rival.y}px`;

        if (rival.y >= $gameArea.offsetHeight) {
            rival.y = -HEIGHT * settings.traffic;
            rival.style.left = `
                ${Math.floor(Math.random() * ($gameArea.offsetWidth - rival.offsetWidth))}px
            `;
        }
    })
}

$start.addEventListener('click', startGame);
document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);