const keyContainer = document.getElementById("key-container");
const fpsElement = document.getElementById("fps");
const droppedFramesElement = document.getElementById("dropped-frames");
const fpsValue = document.getElementById("fps-adjust");
const kpsValue = document.getElementById("kps-time-adjust");
const volumeValue = document.getElementById("volume");
const keytrailAppearanceValue = document.getElementById("keytrail-appearance");
const keyTrailSpeedElement = document.getElementById("keytrail-speed");
const kpsElement = document.getElementById("kps");
const kpsSElement = document.getElementById("kps-s");
const totalKeysElement = document.getElementById("tot-keys");

let start = performance.now();
const keySet = new Set();
const pressedKeys = new Set();

let droppedFrames = 0.0;
let fpsCount = 0;
let fpsCumulative = 5000;
const fps = new PerSec(fpsCumulative);
let targetfps = 60;
let keyLife = 2000; // 2 seconds default
let keyTrailSpeed = window.innerHeight / keyLife;
let kpsDuration = 1000;
const currKeys = new PerSec(kpsDuration);
let initStart;
let delta;
let appearenceValue = 0.6;
let totalKeys = 0;
let appearenceBoolBefore = false;
const keyWaitingList = new Set();

const specialChars = {
    " ": "[]",
    "Enter": "⏎",
    "Shift": "⇧",
    "Control": "Ctrl",
    "Alt": "Alt",
    "Tab": "⇥",
    "CapsLock": "⇪",
    "ArrowUp": "↑",
    "ArrowDown": "↓",
    "ArrowLeft": "←",
    "ArrowRight": "→",
};

function incrementTotalKeys(increment = true){
    if(increment)
        totalKeys++;
    totalKeysElement.innerText = "total pressed: " + totalKeys;
}

function createKeyElement(key) {
    const keyElement = document.createElement("div");
    keyElement.classList.add("key");
    keyElement.id = key;

    const keyElementText = document.createElement("span");
    keyElementText.classList.add("key-text");
    keyElementText.textContent = key;

    const keyTrailContainer = document.createElement("div");
    keyTrailContainer.classList.add("key-trail-container");
    
    keyElement.appendChild(keyElementText);
    keyElement.appendChild(keyTrailContainer);
    keyContainer.appendChild(keyElement);

    keyElement.dataset.trueKey = key;
    return keyElement;
}

function incrementHeight(k) {
    if (specialChars[k]) {
        k = specialChars[k];
    }
    const key = document.getElementById(k);   
}

function incrementFPSCounter(){
    fps.add();
}

function reset(){
    keySet.clear();
    keyContainer.innerHTML = "";
    pressedKeys.clear();
}

function doWaitingList() {
    // add keys to waiting list to select last keytrail in update function correctly
    
    keyWaitingList.forEach((key) => {
        if (!keySet.has(key)) {
            keySet.add(key);
            createKeyElement(key);
            // playKeysound({element: document.getElementById(key)});
            // console.log("creating key: ", key);
        }
        const keyElement = document.getElementById(key);
        keyElement.classList.add("key-pressed");
        if (!keyElement) {
            console.error("Key not found for in waiting list");
            return;
        }
        const keyTrail = document.createElement("div");
        keyTrail.classList.add("keytrail");
        keyTrail.style.height = "0px";
        keyElement.querySelector(".key-trail-container")
            .appendChild(keyTrail);
        
        pressedKeys.add(key);
    });
    keyWaitingList.clear();
}

function handleKeyDown(e) {
    if (e.key === "Escape") {
        reset();
        return;
    }
    let key = e.key;
    if (specialChars[key]) {
        key = specialChars[key];
    }
    // console.log(key);
    
    if (pressedKeys.has(key)) {
        return;
    }
    
    // init keytrail
    playKeysound({element: document.getElementById(e.key)});
    if(!keyWaitingList.has(key)) 
    keyWaitingList.add(key);
    pressedKeys.add(key);
    
    incrementTotalKeys();
    currKeys.add();

}

function handleKeyUp(e) {
    let key = e.key;
    if (specialChars[key]) {
        key = specialChars[key];
    }
    if (pressedKeys.has(key)) {
        pressedKeys.delete(key);
        if (keyWaitingList.has(key)) {
            keyWaitingList.delete(key);
        }
        else{
            document.getElementById(key).classList.remove("key-pressed");
        }
    }
}

function incrementHeight(keyId){
    const key = document.getElementById(keyId);
    if(!key){
        console.error("Key not found for inc. height");
        return;
    }
    const keyTrailContainer = key.querySelector(".key-trail-container");
    
    
    const pixelsIncrement = delta * 1000 / keyLife;

    // console.log(pressedKeys.has(keyId));
    if (pressedKeys.has(keyId)) {
        //affect the last keytrail since key is held
        const lastKeyTrail = keyTrailContainer.lastElementChild;

        // TODO: fix this minor performance issue bug 
        // if(lastKeyTrail.clientHeight * 10 >= window.innerHeight){
        //     appearenceBoolBefore = true;
        //     console.log(lastKeyTrail.clientHeight, window.innerHeight);
        //     console.log("keytrail is full");
        //     return;
        // }
        let keyPadding = parseFloat(keyTrailContainer.style.paddingBottom) || 0;
        // console.log(keyPadding+ "px");

        keyTrailContainer.style.paddingBottom = "0px";
        
        // for some reasing using clientHeight gives some unknown randomness
        const trailHeight = parseFloat(lastKeyTrail.style.height) || 0;
        lastKeyTrail.style.height = Math.floor(trailHeight + pixelsIncrement) + "px";
        
        const lastMarginBottom = parseFloat(lastKeyTrail.style.marginBottom) || 0;
        
        if (lastMarginBottom < keyPadding) {
            lastKeyTrail.style.marginBottom = (lastMarginBottom + keyPadding) + "px";
        }
        return;
    } 
        //not being held
        const keyPadding = parseFloat(keyTrailContainer.style.paddingBottom);
        keyTrailContainer.style.paddingBottom = Math.floor((keyPadding || 0) + pixelsIncrement) + "px";
        
    
    
}

function update(timestamp) {
    delta = timestamp - start;
    // if (delta < 1000 / targetfps - 0.1) {
    //     window.requestAnimationFrame(update);
    //     return;
    // }
    fpsElement.textContent = fps.cntn().toFixed(2) + "fps";
    kpsElement.textContent = `${(currKeys.cntn()).toFixed(2)} kps [${currKeys.cnt()} || ${kpsDuration}ms]`;
    kpsSElement.textContent = `${(currKeys.cntn() / Math.max(1, keySet.size)).toFixed(2)} kps [${(currKeys.cnt())}/${keySet.size}key || ${kpsDuration}ms]`;
    keyTrailSpeed = window.innerHeight / keyLife;
    keyContainer.style.fontSize = `${Math.min(Math.max(window.innerWidth / keySet.size, 0), window.innerWidth * 0.25)}px`;
    
    keyContainer.childNodes.forEach((key) => {
        const keyTrailContainer = key.querySelector(".key-trail-container");
        
        for (let i = 0; i < keyTrailContainer.childNodes.length; i++) {
            const keytrail = keyTrailContainer.childNodes[i];
            const keytrailRect = keytrail.getBoundingClientRect();
            if (keytrailRect.bottom < -window.scrollY) {
                if (!pressedKeys.has(key.id)) {
                    // console.log("removing keytrail");
                    keyTrailContainer.removeChild(keytrail);
                    i--;
                }
            } else {
                break;
            }
        }
        if (key.querySelector(".key-trail-container")
            .childNodes.length === 0) {
            keySet.delete(key.id);
            // console.log("removing key " + key.id);
            keyContainer.removeChild(key);
        }
        else{
            incrementHeight(key.id);
        }
    });
    
    doWaitingList();
    doKeysoundFuncs(delta);
    const perf = performance.now();
    const targetms = 1000 / targetfps;

    const next = Math.max(perf, timestamp + targetms);
    if(perf > timestamp + targetms && document.hasFocus()){
        droppedFrames += (perf - (timestamp + targetms)) / targetms;
        droppedFramesElement.innerText = "dropped frames: " + Math.ceil(droppedFrames);
        // console.warn("frame took " + (perf -  (timestamp + 1000 / fps)).toFixed(3) + "ms longer to process than expected");
    }
        
    start = timestamp;
    
    incrementFPSCounter();
    setTimeout(() => {
        update(next);
    }, next - perf);
}

function init(){
    reset();
    start = performance.now();
    initStart = start;
    update(start);
}
init();

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

keyTrailSpeedElement.addEventListener("input", (e) => {
    keyLife = parseInt(e.target.value);
    keyTrailSpeed = window.innerHeight / keyLife;
    keyTrailSpeedElement.nextElementSibling.textContent = keyLife + "ms";
});

fpsValue.addEventListener("input", (e) => {
    targetfps = parseInt(e.target.value);
    fps.setwindow(1000 * targetfps / 60);
    fpsValue.nextElementSibling.textContent = targetfps + "fps";
});

kpsValue.addEventListener("input", (e) => {
    kpsDuration = parseInt(e.target.value);
    kpsValue.nextElementSibling.textContent = kpsDuration + "ms";
    currKeys.setwindow(kpsDuration);
});

let keytrailStyleInd;
keytrailAppearanceValue.addEventListener("focusin", (e) => {
    const stylesheet = document.styleSheets[0];
    for(let i = 0; i < stylesheet.cssRules.length; i++){
        if(stylesheet.cssRules[i].selectorText === ".keytrail"){
            keytrailStyleInd = i;
            // console.log("keytrail style found", i);
            return;
        }
    }
    // console.error("keytrail style not found");
})
keytrailAppearanceValue.addEventListener("input", (e) => {
    appearenceValue = parseFloat(e.target.value);
    keytrailAppearanceValue.nextElementSibling.textContent = Math.floor(appearenceValue * 100) + "%";
    if(keytrailStyleInd)
        document.styleSheets[0].cssRules[keytrailStyleInd].style.background = `linear-gradient(to top, white 0%, white ${appearenceValue * 100}%, transparent 100%)`
});
volumeValue.addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value);
    volumeValue.nextElementSibling.textContent = Math.floor(volume * 100) + "%";
    gain.gain.value = volume;
});
incrementTotalKeys(false);