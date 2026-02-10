const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const success = document.getElementById("success");
const questionArea = document.getElementById("questionArea");
let lastMove = 0;
let movePending = false;
let lastCursor = { x: 0, y: 0 };
let idleTimer = null;

let originalPos = { x: 0, y: 0 };

const centerButtons = () => {
  const areaRect = questionArea.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();
  const gap = 18;
  const totalWidth = yesRect.width + noRect.width + gap;
  const startX = (areaRect.width - totalWidth) / 2;
  const topY = 0;

  yesBtn.style.position = "absolute";
  yesBtn.style.left = `${startX}px`;
  yesBtn.style.top = `${topY}px`;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${startX + yesRect.width + gap}px`;
  noBtn.style.top = `${topY}px`;

  originalPos = { x: startX + yesRect.width + gap, y: topY };
};

centerButtons();
window.addEventListener("resize", centerButtons);

const carouselTrack = document.getElementById("carouselTrack");

if (carouselTrack) {
  const cards = Array.from(carouselTrack.children);
  cards.forEach((card) => carouselTrack.appendChild(card.cloneNode(true)));

  let lastTime = 0;
  const speed = 0.25;
  const loop = (time) => {
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;
    carouselTrack.scrollTop += speed * delta;

    if (carouselTrack.scrollTop >= carouselTrack.scrollHeight / 2) {
      carouselTrack.scrollTop = 0;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function moveNoButton(cursorX = null, cursorY = null) {
  const buttonRect = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const padding = 16;
  const boxLeft = window.innerWidth * 0.35;
  const boxTop = window.innerHeight * 0.35;
  const boxWidth = window.innerWidth * 0.3;
  const boxHeight = window.innerHeight * 0.3;
  const maxX = Math.max(padding, boxLeft + boxWidth - buttonRect.width - padding);
  const maxY = Math.max(padding, boxTop + boxHeight - buttonRect.height - padding);

  let nextX = boxLeft + padding + Math.random() * (boxWidth - buttonRect.width - padding);
  let nextY = boxTop + padding + Math.random() * (boxHeight - buttonRect.height - padding);

  // Try a few times to avoid the Yes button and cursor.
  for (let i = 0; i < 12; i += 1) {
    nextX = boxLeft + padding + Math.random() * (boxWidth - buttonRect.width - padding);
    nextY = boxTop + padding + Math.random() * (boxHeight - buttonRect.height - padding);

    const overlapYes =
      nextX + buttonRect.width > yesRect.left - padding &&
      nextX < yesRect.right + padding &&
      nextY + buttonRect.height > yesRect.top - padding &&
      nextY < yesRect.bottom + padding;

    let farFromCursor = true;
    if (cursorX !== null && cursorY !== null) {
      const btnCenterX = nextX + buttonRect.width / 2;
      const btnCenterY = nextY + buttonRect.height / 2;
      const distance = Math.hypot(btnCenterX - cursorX, btnCenterY - cursorY);
      farFromCursor = distance > 160;
    }

    if (!overlapYes && farFromCursor) break;
  }

  noBtn.style.position = "fixed";
  noBtn.style.left = `${Math.min(maxX, Math.max(boxLeft + padding, nextX))}px`;
  noBtn.style.top = `${Math.min(maxY, Math.max(boxTop + padding, nextY))}px`;
  noBtn.style.transition = "left 0.12s ease-out, top 0.12s ease-out";

  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    noBtn.style.position = "absolute";
    noBtn.style.left = `${originalPos.x}px`;
    noBtn.style.top = `${originalPos.y}px`;
    noBtn.style.transition = "left 0.2s ease, top 0.2s ease";
  }, 2000);
}

window.addEventListener("mousemove", (event) => {
  const now = performance.now();
  if (now - lastMove < 80) return;
  const cursorX = event.clientX;
  const cursorY = event.clientY;
  const moved = Math.hypot(cursorX - lastCursor.x, cursorY - lastCursor.y);
  if (moved < 4) return;
  lastCursor = { x: cursorX, y: cursorY };
  const btnRect = noBtn.getBoundingClientRect();
  const distance = Math.hypot(
    cursorX - (btnRect.left + btnRect.width / 2),
    cursorY - (btnRect.top + btnRect.height / 2)
  );
  if (distance > 70) return;

  if (movePending) return;
  movePending = true;
  requestAnimationFrame(() => {
    lastMove = performance.now();
    moveNoButton(cursorX, cursorY);
    movePending = false;
  });
});

window.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesBtn.addEventListener("click", () => {
  success.hidden = false;
  success.style.display = "grid";
  requestAnimationFrame(() => {
    success.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.body.classList.add("party");
});
