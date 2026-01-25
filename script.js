const SCHEDULE_START_HOUR = 19;
const SCHEDULE_START_MINUTE = 5;
const SCHEDULE_END_HOUR = 22;
const SCHEDULE_END_MINUTE = 0;

const WORK_DURATION_MIN = 25;
const BREAK_DURATION_MIN = 5;
const CYCLE_DURATION_MIN = WORK_DURATION_MIN + BREAK_DURATION_MIN; // 30 minutes

const elements = {
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    badge: document.getElementById('statusBadge'),
    bar: document.getElementById('progressBar'),
    body: document.body,
    overlay: document.getElementById('startOverlay'),
    startBtn: document.getElementById('startBtn'),
    nextEventTime: document.getElementById('nextEventTime'),
    currentTime: document.getElementById('currentTime'),
    chime: document.getElementById('chime'),
    muteBtn: document.getElementById('muteBtn'),
    themeBtn: document.getElementById('themeBtn')
};

let isMuted = false;
let userHasInteracted = false;

// Audio context logic could go here but simple HTML5 audio is easier for now
// We trigger play() on user interaction to unlock it
elements.startBtn.addEventListener('click', () => {
    elements.overlay.classList.add('hidden');
    userHasInteracted = true;
    try {
        elements.chime.volume = 0;
        elements.chime.play().then(() => {
            elements.chime.pause();
            elements.chime.currentTime = 0;
            elements.chime.volume = 1;
        });
    } catch(e) { 
        console.log("Audio unlock failed", e);
    }
    updateTimer(); 
});

elements.muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    elements.muteBtn.style.opacity = isMuted ? "0.3" : "1";
    elements.muteBtn.innerHTML = isMuted 
        ? `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>` // strike
        : `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>`; // normal
});

elements.themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
});

function getMinutesFromMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function formatTime(h, m) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function updateTimer() {
    const now = new Date();
    const currentTotalMinutes = getMinutesFromMidnight(now);
    
    // Schedule Bounds
    const startTotalMinutes = SCHEDULE_START_HOUR * 60 + SCHEDULE_START_MINUTE;
    const endTotalMinutes = SCHEDULE_END_HOUR * 60 + SCHEDULE_END_MINUTE;

    elements.currentTime.textContent = formatTime(now.getHours(), now.getMinutes());

    if (currentTotalMinutes < startTotalMinutes) {
        // Before Schedule
        setMode('WAITING', startTotalMinutes - currentTotalMinutes, startTotalMinutes, 'IDLE');
        elements.nextEventTime.textContent = formatTime(SCHEDULE_START_HOUR, SCHEDULE_START_MINUTE);
        return;
    }

    if (currentTotalMinutes >= endTotalMinutes) {
        // After Schedule
        setMode('FINISHED', 0, 0, 'IDLE');
        elements.nextEventTime.textContent = "--:--";
        return;
    }

    // In Schedule
    const minutesSinceStart = currentTotalMinutes - startTotalMinutes;
    // We also need seconds for precise timer
    const secondsSinceStart = minutesSinceStart * 60 + now.getSeconds();
    
    const cycleIndex = Math.floor(minutesSinceStart / CYCLE_DURATION_MIN);
    const minutesInCycle = minutesSinceStart % CYCLE_DURATION_MIN;
    const secondsInCycle = minutesInCycle * 60 + now.getSeconds();
    
    // Determine Work or Break
    // 0-25m: WORK
    // 25-30m: BREAK
    
    let mode = '';
    let timeLeftSeconds = 0;
    
    if (minutesInCycle < WORK_DURATION_MIN) {
        mode = 'WORK';
        const totalWorkSeconds = WORK_DURATION_MIN * 60;
        const currentWorkSeconds = secondsInCycle;
        timeLeftSeconds = totalWorkSeconds - currentWorkSeconds;
        
        // Next event is break
        const nextBreakStartMinOffset = (cycleIndex * CYCLE_DURATION_MIN) + WORK_DURATION_MIN;
        const breakStartTotal = startTotalMinutes + nextBreakStartMinOffset;
        const h = Math.floor(breakStartTotal / 60);
        const m = breakStartTotal % 60;
        elements.nextEventTime.textContent = `${formatTime(h, m)} (休憩)`;
        
    } else {
        mode = 'BREAK';
        const totalBreakSeconds = BREAK_DURATION_MIN * 60;
        const currentBreakSeconds = secondsInCycle - (WORK_DURATION_MIN * 60);
        timeLeftSeconds = totalBreakSeconds - currentBreakSeconds;
        
        // Next event is Work
        const nextWorkStartMinOffset = ((cycleIndex + 1) * CYCLE_DURATION_MIN);
        const workStartTotal = startTotalMinutes + nextWorkStartMinOffset;
        const h = Math.floor(workStartTotal / 60);
        const m = workStartTotal % 60;
        elements.nextEventTime.textContent = `${formatTime(h, m)} (作業)`;
    }
    
    render(mode, timeLeftSeconds);
}

let lastMode = '';

function setMode(modeText, timeLeft, eventTime, cssClass) {
    elements.badge.textContent = modeText;
    // Simple render for idle/waiting states if needed
}

function render(mode, timeLeftSeconds) {
    // Minute/Seconds calc
    let m = Math.floor(timeLeftSeconds / 60);
    let s = timeLeftSeconds % 60;
    
    // Adjust for negative (transition logic usually handles this, but just in case)
    if (timeLeftSeconds < 0) {
       m = 0; s = 0; 
    }

    elements.minutes.textContent = String(m).padStart(2, '0');
    elements.seconds.textContent = String(s).padStart(2, '0');

    // Progress Bar
    const duration = (mode === 'WORK' ? WORK_DURATION_MIN : BREAK_DURATION_MIN) * 60;
    const elapsed = duration - timeLeftSeconds;
    const pct = (elapsed / duration) * 100;
    elements.bar.style.width = `${pct}%`;

    // State Change Detection & Audio
    const cssMode = mode === 'WORK' ? 'mode-work' : 'mode-break';
    
    if (lastMode !== mode) {
        if (lastMode !== '' && userHasInteracted && !isMuted) {
            triggerChime();
        }
        
        elements.body.classList.remove('mode-work', 'mode-break');
        elements.body.classList.add(cssMode);
        elements.badge.textContent = mode === 'WORK' ? 'FOCUS' : 'BREAK';
        lastMode = mode;
    }
}

function triggerChime() {
    elements.chime.currentTime = 0;
    elements.chime.play().catch(e => console.error("Audio play failed", e));
}

// Update every second
setInterval(updateTimer, 1000);
updateTimer();
