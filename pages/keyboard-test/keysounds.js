const keysoundInput = document.getElementById("keysound");
let volumeDisplayAppearance = 0.1;
let volumeDisplayVisibility = true;
const selectKeysoundForm = document.getElementById("select-keysound");
const customKeysoundSelect = document.getElementById("custom-keysound-select");
const volumeDisplay = document.getElementById("vol-display");
const volCtx = volumeDisplay.getContext("2d");
let selectedKeysound = null;
let defaultKeysound = 0;
// let wantCustomKeysound = false;

const audioContext = new AudioContext();
const gain = audioContext.createGain();
const analyser = audioContext.createAnalyser();
analyser.fftSize = Math.pow(2,6);
let dataArray = new Uint8Array(analyser.frequencyBinCount);
const audioBuffers = {};
volCtx.fillStyle = "rgba(255,255,255,0.1)";

const audioFiles = {
    osu: new Audio("sounds/osu.mp3"),
    pop: new Audio("sounds/pop.mp3"),
    laser: new Audio("sounds/laser.mp3"),
    snap: new Audio("sounds/snap.mp3"),
    amogus: new Audio("sounds/amogus.mp3"),
    piano: "elise",
    random: "random"
};
const defaultKeysoundLen = Object.keys(audioFiles).length;



const customFunctions = {
    "elise": {
        noteFrequencies: [{
            // octave 0
            "c": 16.351,
            "c#": 17.324,
            "db": 17.324,
            "d": 18.354,
            "d#": 19.445,
            "eb": 19.445,
            "e": 20.601,
            "f": 21.827,
            "f#": 23.124,
            "gb": 23.124,
            "g": 24.499,
            "g#": 25.956,
            "ab": 25.956,
            "a": 27.5,
            "a#": 29.135,
            "bb": 29.135,
            "b": 30.868
        },
        {
            // octave 1
            "c": 32.703,
            "c#": 34.648,
            "db": 34.648,
            "d": 36.708,
            "d#": 38.891,
            "eb": 38.891,
            "e": 41.203,
            "f": 43.654,
            "f#": 46.249,
            "gb": 46.249,
            "g": 48.999,
            "g#": 51.913,
            "ab": 51.913,
            "a": 55,
            "a#": 58.27,
            "bb": 58.27,
            "b": 61.735
        },
        {                    
            // octave 2
            "c": 65.406,
            "c#": 69.296,
            "db": 69.296,
            "d": 73.416,
            "d#": 77.782,
            "eb": 77.782,
            "e": 82.407,
            "f": 87.307,
            "f#": 92.499,
            "gb": 92.499,
            "g": 97.999,
            "g#": 103.826,
            "ab": 103.826,
            "a": 110,
            "a#": 116.541,
            "bb": 116.541,
            "b": 123.471
        },
        {                    
            // octave 3
            "c": 130.813,
            "c#": 138.591,
            "db": 138.591,
            "d": 146.832,
            "d#": 155.563,
            "eb": 155.563,
            "e": 164.814,
            "f": 174.614,
            "f#": 184.997,
            "gb": 184.997,
            "g": 195.998,
            "g#": 207.652,
            "ab": 207.652,
            "a": 220,
            "a#": 233.082,
            "bb": 233.082,
            "b": 246.942
        },
        {                    
            // octave 4
            "c": 261.626,
            "c#": 277.183,
            "db": 277.183,
            "d": 293.665,
            "d#": 311.127,
            "eb": 311.127,
            "e": 329.628,
            "f": 349.228,
            "f#": 369.994,
            "gb": 369.994,
            "g": 391.995,
            "g#": 415.305,
            "ab": 415.305,
            "a": 440,
            "a#": 466.164,
            "bb": 466.164,
            "b": 493.883
        },
        {                    
            // octave 5
            "c": 523.251,
            "c#": 554.365,
            "db": 554.365,
            "d": 587.33,
            "d#": 622.254,
            "eb": 622.254,
            "e": 659.255,
            "f": 698.456,
            "f#": 739.989,
            "gb": 739.989,
            "g": 783.991,
            "g#": 830.609,
            "ab": 830.609,
            "a": 880,
            "a#": 932.328,
            "bb": 932.328,
            "b": 987.767
        },
        {                    
            // octave 6
            "c": 1046.502,
            "c#": 1108.731,
            "db": 1108.731,
            "d": 1174.659,
            "d#": 1244.508,
            "eb": 1244.508,
            "e": 1318.51,
            "f": 1396.913,
            "f#": 1479.978,
            "gb": 1479.978,
            "g": 1567.982,
            "g#": 1661.219,
            "ab": 1661.219,
            "a": 1760,
            "a#": 1864.655,
            "bb": 1864.655,
            "b": 1975.533
        },
        {                    
            // octave 7
            "c": 2093.005,
            "c#": 2217.461,
            "db": 2217.461,
            "d": 2349.318,
            "d#": 2489.016,
            "eb": 2489.016,
            "e": 2637.021,
            "f": 2793.826,
            "f#": 2959.955,
            "gb": 2959.955,
            "g": 3135.964,
            "g#": 3322.438,
            "ab": 3322.438,
            "a": 3520,
            "a#": 3729.31,
            "bb": 3729.31,
            "b": 3951.066
        },
        {                    
            // octave 8
            "c": 4186.009,
            "c#": 4434.922,
            "db": 4434.922,
            "d": 4698.636,
            "d#": 4978.032,
            "eb": 4978.032,
            "e": 5274.042,
            "f": 5587.652,
            "f#": 5919.91,
            "gb": 5919.91,
            "g": 6271.928,
            "g#": 6644.876,
            "ab": 6644.876,
            "a": 7040,
            "a#": 7458.62,
            "bb": 7458.62,
            "b": 7902.132
        },
        {                    
            // octave 9
            "c": 8372.018,
            "c#": 8869.844,
            "db": 8869.844,
            "d": 9397.272,
            "d#": 9956.064,
            "eb": 9956.064,
            "e": 10548.084,
            "f": 11175.304,
            "f#": 11839.82,
            "gb": 11839.82,
            "g": 12543.856,
            "g#": 13289.752,
            "ab": 13289.752,
            "a": 14080,
            "a#": 14917.24,
            "bb": 14917.24,
            "b": 15804.264
        }],
        eliseNotes: [
            "E", 0,
            "D#", 0,
            "E", 0,
            "D#", 0,
            "E", 0,
            "B", -1,
            "D", 0,
            "C", 0,
            "A", -1,
            "E", -2,
            "C", -1,
            "E", -1,
            "A", -1,
            "B", -1, 
            "E", -1,
            "G#", -1,
            "B", -1,
            "C", 0,
            "E", -1,
            "E", 0,
            "D#", 0,
            "E", 0,
            "D#", 0,
            "E", 0,
            "B", -1,
            "D", 0,
            "C", 0,
            "A", -1,
            "E", -2,
            "C", -1,
            "E", -1,
            "A", -1,
            "B", -1, 
            "E", -1,
            "G#", -1,
            "B", -1,
            "C", 0,
            "E", -1,
            "E", 0,
            "D#", 0,
            "E", 0,
            "D#", 0,
            "E", 0,
            "B", -1,
            "D", 0,
            "C", 0,
            "A", -1,
            "E", -2,
            "C", -1,
            "E", -1,
            "A", -1,
            "B", -1, 
            "E", -1,
            "C", 0,
            "B", -1,
            "A", -1,
            "A", -2,
            "B", -1,
            "C", 0,
            "D", 0,
            "E", 0,
            "A", -2,
            "C", -1,
            "G", -1,
            "F", 0,
            "E", 0,
            "D", 0,
            "G", -2,
            "B", -2,
            "F", -1,
            "E", 0,
            "D", 0,
            "C", 0,
            "E", -2,
            "A", -2,
            "E", -1,
            "D", 0,
            "C", 0,
            "B", -1,
            "E", -1,
            "E", -1,
            "E", 0,
            "E", -1,
            "E", 0,
            "E", 0,
            "E", 1,
            "D#", 0,
            "E", 0,
            "D#", 0,
            "E", 0,
            "D#", 0,
            "E", 0,
            "D#", 0,
        ],

        init: function (){
            this.eliseNotes.forEach((note, i) => {
                if(typeof note === "string"){
                    this.eliseNotes[i] = note.toLowerCase();
                }
            });
            // i could learn to generate all the note frequencies programattically but nah
        },
        eliseOctave: 5,
        progress: 0,
        modProgress: function (){
            return this.progress % (this.eliseNotes.length / 2);
        },
        playNote: function (element) {
            const stop = 0.5;
            const attack = 0.01;
            const decay = 0.9;
            const osc = audioContext.createOscillator();
            
            osc.type = "sine";
            
            const currTime = audioContext.currentTime;
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, currTime);
            gainNode.gain.linearRampToValueAtTime(.5, currTime + attack);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, currTime + decay);
        
            const octave = this.eliseNotes[this.modProgress() * 2 + 1] + this.eliseOctave;
            const note = this.eliseNotes[this.modProgress() * 2];
            osc.frequency.value = this.noteFrequencies[octave][note];
        
            osc.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(audioContext.destination)
            osc.start(0);
            osc.stop(currTime + stop);

            if (element) {
                const elementTextElement = element.querySelector(".key-text");
                elementTextElement.innerText = note + "-" + octave;
            
                setTimeout(() => {
                    elementTextElement.innerText = element.dataset.trueKey;
                }, stop * 1000);
            }
        
            this.progress++;
        }
    },
    "random": {
        wantCustomKeysound: false,
        init: function () {
            customKeysoundSelect.addEventListener("input", (e) => {
                this.wantCustomKeysound = e.currentTarget.checked;
            });
        },
        playNote: function (){
            const keys = Object.keys(audioFiles);
            if(this.wantCustomKeysound && (keys.length - defaultKeysoundLen) === 0){
                return;
            }
            const randInd = this.wantCustomKeysound ? (Math.floor(Math.random() * (keys.length - defaultKeysoundLen)) + defaultKeysoundLen) : Math.floor(Math.random() * keys.length);
            const randomSelect = keys[randInd];
            playKeysound({manualKeysound: randomSelect});
        }
    }
}

for(const key in customFunctions){
    customFunctions[key].init();
}
async function loadAudioFile(audioObj, key) {
    if(typeof audioObj === "string"){
        return;
    }

    // attempt at getting this to run locally without http-server
    
    const response = await new Promise((res, rej) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", audioObj.src, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = () => res(xhr.response);
        xhr.onerror = rej;
        xhr.send();
    })
    audioBuffers[key] = await audioContext.decodeAudioData(response);
    
}

for(const key in audioFiles){
    loadAudioFile(audioFiles[key], key);
}

function doKeysoundFuncs(delta){
    analyser.getByteFrequencyData(dataArray);
    const width = volumeDisplay.width * window.devicePixelRatio, height = volumeDisplay.height * window.devicePixelRatio;
    volCtx.clearRect(0, 0, width, height);
    volCtx.fillStyle = `rgba(255,255,255,${volumeDisplayAppearance})`;
    if(volumeDisplayVisibility == false) return;

    const volbarWidth = width * 1.4 / dataArray.length;
    let volbarHeight;
    let x = 0;
    for(let i = 0; i < analyser.frequencyBinCount & x < width; i++){
        // offset check
        // if(i == 0){
        //     volCtx.fillStyle = "rgb(0,0,0)";
        // }
        // else{
        //     volCtx.fillStyle = "rgba(255,255,255,0.1)";
        // }
        volbarHeight = dataArray[i] * (height / 255);

        volCtx.fillRect(x, height - volbarHeight, volbarWidth, volbarHeight);
        x += volbarWidth;
    }
}

function playKeysound({element = null, manualKeysound = null}) {
    // console.log(selectedKeysound)
    // console.warn(performance.now());
    let keysound = manualKeysound || selectedKeysound;
    if(typeof audioFiles[keysound] === "string"){
        keysound = audioFiles[keysound];
    }
    if(customFunctions[keysound]){
        customFunctions[keysound].playNote(element);
        return;
    }
    // console.log(audioBuffers[keysound]);
    
    // console.log("playing keysound " + keysound);
    if (keysound === "none" || !audioBuffers[keysound]) return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[keysound];
    source.connect(gain);
    gain.connect(analyser);
    gain.connect(audioContext.destination);

    source.start();
}

function addAudioOption(name) {
    // if(customFunctions[name]){
    //     return;
    // }
    console.log("adding " + name);
    const label = document.createElement("label");
    label.innerText = name;
    const input = document.createElement("input");
    input.type = "radio";
    input.value = name;
    input.name = "keysound";
    input.checked = true;
    selectedKeysound = name;
    playKeysound({});
    label.appendChild(input);
    selectKeysoundForm.appendChild(label);
    
}

keysoundInput.addEventListener("input", (e) => {
    const audioFile = e.currentTarget.files[0];
    if(audioFile){
        const audioObj = new Audio(URL.createObjectURL(audioFile));
        const audioName = audioFile.name.split(".")[0];
        let add = "";
        if(audioFiles[audioName + add]){
            while(audioFiles[audioName + add]){
                const num = parseInt(add.substring(1)) || 0;
                // console.log(parseInt(add))
                add = `(${num + 1})`;
            }
        }
        audioFiles[audioName + add] = audioObj;
        addAudioOption(audioName + add);
        loadAudioFile(audioObj, audioName + add);
        // playKeysound(audioName + add);
    }
});



// selectKeysoundForm.addEventListener("change", (e) => {
//     selectedKeysound = e.target.value;
//     // playKeysound({});
// });

window.addEventListener("click", (e) => {
    if(selectKeysoundForm.contains(e.target) && e.target.nodeName === "INPUT"){
        selectedKeysound = e.target.value;
        if(typeof audioFiles[selectedKeysound] === "string"){
            selectedKeysound = audioFiles[selectedKeysound];
        }
        playKeysound({});
        // playKeysound(true);
    }
    // console.log(e.target.nodeName)
});
window.onresize = function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    volumeDisplay.width = width;
    volumeDisplay.height = height;
    // Update other code related to volume display if needed
};
window.onresize();
for(const keysoundname in audioFiles){
    addAudioOption(keysoundname);
}
selectKeysoundForm.querySelectorAll("input")[defaultKeysound].checked = true;
selectedKeysound = selectKeysoundForm.querySelectorAll("input")[defaultKeysound].value;

console.log(analyser.fftSize, volumeDisplayVisibility, volumeDisplayAppearance)