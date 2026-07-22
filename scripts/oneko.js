

function oneko(speed = 10, color = false, pointerevents = false) {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  // if (isReducedMotion) return; temporary disalbe

  const nekoEl = document.createElement("div");

  let nekoPosX = 32 + Math.random() * window.innerWidth;
  let nekoPosY = 32 + Math.random() * window.innerHeight;
  setTimeout(() => {
    nekoPosY += window.scrollY;
  }, 0);

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  const clock = 70;

  const nekoSpeed = speed || 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function init() {
    nekoEl.className = "oneko";
    nekoEl.ariaHidden = true;
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "absolute";
    nekoEl.style.pointerEvents = pointerevents ? "auto" : "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = Number.MAX_VALUE;

    let nekoFile = "/assets/imgs/oneko.png";
    // const curScript = document.currentScript;
    // if (curScript && curScript.dataset.cat) {
    //   nekoFile = curScript.dataset.cat
    // }
    nekoEl.style.backgroundImage = `url(${nekoFile})`;
    if(color){
      const nekoId = document.createElement("p");
      nekoId.innerText = speed;
      const speedPercentage = Math.min(Math.max((speed - 5) / (55 - 5), 0), 1);
      const red = Math.round(255 * (1 - speedPercentage));
      const green = Math.round(255 * speedPercentage);
      nekoId.style.color = `rgb(${red}, ${green}, 0)`;
      nekoId.style.userSelect = "none";
      nekoEl.appendChild(nekoId);
    }
    // if(curScript.parentElement !== document.head){

    //   curScript.parentElement.appendChild(nekoEl);
    // }
    // else{

    document.body.appendChild(nekoEl);
    // }

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;
  let onekodelay = 0;

  function onAnimationFrame(timestamp) {
    // Stops execution if the neko element is removed from DOM
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > clock + onekodelay) {
      lastFrameTimestamp = timestamp
      onekodelay = Math.floor(Math.random() * -25);
      frame()
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;
    const thresh = 48;//32
    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < window.scrollX + thresh) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < window.scrollY + thresh) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth + window.scrollX - thresh) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight + window.scrollY - thresh) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
        Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function explodeHearts() {
    if (idleAnimation == "sleeping") {
      resetIdleAnimation();
    } // WAKE UP KITTY CAT
    const parent = nekoEl;
    for (let i = 0; i < 10; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.textContent = '❤';
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;
      heart.style.left = `${offsetX-16}px`;
      heart.style.top = `${offsetY}px`;
      heart.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      heart.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
      parent.appendChild(heart);

      setTimeout(() => {
        parent.removeChild(heart);
      }, 1000);
    }
  }

  nekoEl.addEventListener('click', explodeHearts);

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX - window.scrollX;
    const diffY = nekoPosY - mousePosY - window.scrollY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 120) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    // keep catz on screen
    nekoPosX = Math.min(Math.max(16+window.scrollX, nekoPosX), window.innerWidth + window.scrollX - 16);
    nekoPosY = Math.min(Math.max(16+window.scrollY, nekoPosY), window.innerHeight + window.scrollY - 16);


    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  init();
  const mouseMoveEvent = new MouseEvent("mousemove", {
    clientX: Math.random() * window.innerWidth,
    clientY: Math.random() * window.innerHeight,
  });
  document.dispatchEvent(mouseMoveEvent);
}



const nekoStyle = document.createElement('style');
nekoStyle.innerHTML = `
    @keyframes heartBurst {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }
    .heart {
      position: absolute;
      font-size: 2em;
      animation: heartBurst 1s ease-out;
      animation-fill-mode: forwards;
      user-select: none;
      pointer-events: none;
      /*color: #ab9df2;*/
    }
  `;

document.head.appendChild(nekoStyle);
function onekopopulate(){
oneko(7);
oneko(12);
  let wowow = 1;
  while(Math.random() < 0.5){
    wowow += wowow;
    oneko(Math.floor(Math.random() * 10) + 5);
  }
  console.log(`1 in ${wowow}!`);

}
onekopopulate();