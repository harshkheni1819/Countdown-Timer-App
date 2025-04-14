const addTimerBtn = document.getElementById("addTimerBtn");
const datetimeInput = document.getElementById("datetime");
const timerLabelInput = document.getElementById("timerLabel");
const alertSound = document.getElementById("alertSound");
const timersContainer = document.getElementById("timers");

let timerCount = 0;

//Request Notification Permission
document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }
});

function createTimerElement(id, label) {
  const timerCard = document.createElement("div");
  timerCard.classList.add("timer-card");
  timerCard.setAttribute("id", `timer-${id}`);

  const labelElement = document.createElement("div");
  labelElement.classList.add("timer-label");
  labelElement.textContent = label;
  timerCard.appendChild(labelElement);

  timerCard.innerHTML += `
    <div class="timer-values">
      <div><span id="days-${id}">0</span><span>Days</span></div>
      <div><span id="hours-${id}">0</span><span>Hours</span></div>
      <div><span id="minutes-${id}">0</span><span>Minutes</span></div>
      <div><span id="seconds-${id}">0</span><span>Seconds</span></div>
    </div>
    <div id="message-${id}"></div>
    <div id="timerControls-${id}">
      <button class="pause-btn" id="pause-${id}">Pause</button>
      <button class="resume-btn" id="resume-${id}" style="display:none;">Resume</button>
      <button class="stop-btn" id="stop-${id}" style="display:none;">Stop Alarm</button>
      <button class="clear-btn" id="clear-${id}" style="display:none;">Clear Timer</button>
    </div>
  `;

  return timerCard;
}

function startCountdown(id, targetTime, label) {
  const daysEl = document.getElementById(`days-${id}`);
  const hoursEl = document.getElementById(`hours-${id}`);
  const minutesEl = document.getElementById(`minutes-${id}`);
  const secondsEl = document.getElementById(`seconds-${id}`);
  const messageEl = document.getElementById(`message-${id}`);
  const timerCard = document.getElementById(`timer-${id}`);

  let remainingTime = targetTime - new Date().getTime();
  let interval;

  const updateTimerDisplay = () => {
    const diff = remainingTime;

    if (diff <= 0) {
      clearInterval(interval);
      daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = 0;
      messageEl.innerHTML = `<strong>🚨 Time's up for <em>${label}</em>!</strong>`;
      timerCard.classList.add("finished");

      // Play sound
      alertSound.play();

      // Show Stop & Clear buttons
      const stopBtn = document.getElementById(`stop-${id}`);
      const clearBtn = document.getElementById(`clear-${id}`);
      stopBtn.style.display = "inline";
      clearBtn.style.display = "inline";

      //  Notification
      setTimeout(() => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("⏰ Countdown Complete!", {
            body: `Timer "${label}" has ended.`,
            icon: "https://cdn-icons-png.flaticon.com/512/159/159469.png"
          });
        }
      }, 100);

      // Stop Alarm
      stopBtn.addEventListener("click", () => {
        alertSound.pause();
        alertSound.currentTime = 0;
        timerCard.classList.remove("finished");
        stopBtn.style.display = "none";
        messageEl.textContent = "⏹ Alarm Stopped";
      });

      // Clear Timer
      clearBtn.addEventListener("click", () => {
        timerCard.remove();
      });

      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;
  };

  updateTimerDisplay();

  interval = setInterval(() => {
    remainingTime -= 1000;
    updateTimerDisplay();
  }, 1000);

  // Pause
  const pauseBtn = document.getElementById(`pause-${id}`);
  pauseBtn.addEventListener("click", () => {
    clearInterval(interval);
    document.getElementById(`resume-${id}`).style.display = "inline";
    pauseBtn.style.display = "none";
  });

  // Resume
  const resumeBtn = document.getElementById(`resume-${id}`);
  resumeBtn.addEventListener("click", () => {
    interval = setInterval(() => {
      remainingTime -= 1000;
      updateTimerDisplay();
    }, 1000);
    pauseBtn.style.display = "inline";
    resumeBtn.style.display = "none";
  });
}

// Add Timer Button Click
addTimerBtn.addEventListener("click", () => {
  const targetDate = new Date(datetimeInput.value).getTime();
  const label = timerLabelInput.value.trim();

  if (isNaN(targetDate)) {
    alert("Please select a valid date and time!");
    return;
  }
  if (!label) {
    alert("Please enter a label for the timer!");
    return;
  }

  const timerId = ++timerCount;
  const timerElement = createTimerElement(timerId, label);
  timersContainer.appendChild(timerElement);
  startCountdown(timerId, targetDate, label);

  // Clear input fields
  timerLabelInput.value = '';
  datetimeInput.value = '';
});
