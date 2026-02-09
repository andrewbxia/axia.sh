const strings = eid("str");
FpsMeter.init();


const bgcolor = "black";
let mode = "none", 
    pointmode = "normal"; // normal, peg
const strokes = [[], []]; // norms, pegs
const peg = 0, norm = 1;
const strokeidxs = [0]; // indices of stroke ENDS
const pointsize = 2;
const pointhalf = pointsize / 2;
const pointcolor = "white";
const distthresh = 20, anglethresh = 15;
const center = [0, 0];

let cutoffidx = 0; // basic undo/redo functionality


const prunestrokes = () => {
    return;
    while(strokeidxs[cutoffidx] < strokes.length){
        strokes.pop();
    }
    strokeidxs.length = cutoffidx + 1;
}
const addpoint = (x, y) => {
    // let found = false;
    // let l = 0, r = strokeidxs[cutoffidx] - 1;
    // while(!found && l < r){
    //     const m = floor(l + (r - l) / 2);
    //     const px = strokes[m][0] + center[0];
    //     const py = strokes[m][1] + center[1];
    //     if(px === x){
    //         if(py === y) found = true;
    //         else if(py < y) l = m + 1;
    //         else r = m - 1;
    //     }
    //     else if(px < x){
    //         l = m + 1;
    //     }
    //     else{
    //         r = m - 1;
    //     }
    // }
    // if(found) {
    //     log("duplicate point ignored:", x, y);
    //     return;
    // }
    // strokeidxs[cutoffidx] = strokes.length;
    const idx = pointmode === "peg" ? peg : norm;
    strokes[idx].push([x - center[0], y - center[1], pointmode === "peg" ? true : false]);
}
const drawpoint = (x, y, ctx, size = pointsize) =>
    ctx.fillRect(x - size/2, y - size/2, size, size);


// drawing handling
const lastclick = {x: 0, y: 0};
let movedsince = true;
/*
input methods: hold + drag to draw -> stop hold
click + move to draw -> click


*/


strings.onmousedown = (e) => {
    lastclick.x = e.clientX;
    lastclick.y = e.clientY;
    if(mode === "draw"){
        document.onmouseup(e);
        return;
    }
    mode = "draw";
    prunestrokes();
    cutoffidx++;
    document.onmousemove(e);
    movedsince = false;
}
strings.onmouseup = (e) => {
   
}


document.onmousemove = (e) => {
    if(mode === "none") return;
    // if(e.target !== fft) return; allow drawing outside
    movedsince = true;


    const rect = brect(strings);
    // const x = snap(e.clientX - rect.left, pointsize);
    // const y = snap(e.clientY - rect.top , pointsize);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addpoint(x, y);
    resetstrings();
    // handlepoints(["add", pointmode, x, y]);
    // resetfft();
}
document.onmouseup = (e) => {
    if(!movedsince){
        movedsince = true;
        return;
    }
    if(mode === "draw"){
        // finish stroke
    }
    mode = "none";
}


// touch handling
strings.addEventListener("touchstart", (e) => {
    // e.preventDefault();
    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
    strings.onmousedown(e);
});

document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
    document.onmousemove(e);
}, {passive: false});

document.addEventListener("touchend", (e) => {
    // e.preventDefault();
    document.onmouseup(e);
}, {passive: false});


const redo = () => {
    cutoffidx = min(strokeidxs.length - 1, cutoffidx + 1);
    resetstrings();
    // resetfft();
}
const clr = () => {
    cutoffidx = 0;
    strokes[peg].length = 0;
    strokes[norm].length = 0;
    // resetstrings();
    // resetfft();
}


const undo = () => {
    cutoffidx = max(0, cutoffidx - 1);
    resetstrings();
    // resetfft();
}
// -----------------
const pointangles = []; // angle, fromidx, toidx

const strmode = () => {
    const checkbox = eid("str-mode");
    const output = checkbox.parentElement.querySelector(".output");
    pointmode = checkbox.checked ? "peg" : "normal";
    output.textContent = pointmode;
}
strmode();

function resetstrings(){
    pointangles.length = 0;
    let prevp = 0;
    const firstp = prevp;

    function addangle(fromidx, toidx){
        const p = strokes[peg][toidx];
        const angle = atan2(p[peg] - strokes[peg][fromidx][0], p[1] - strokes[peg][fromidx][1]);
        pointangles.push([angle, fromidx, toidx]); // angle, fromidx, toidx
    }
    function dist(point, p1, p2){
        const a = -(p2[1] - p1[1]) / (p2[0] - p1[0]);
        const b = 1;
        const c = a * p1[1] - p1[0];
        return abs(
            a * point[0] + b * point[1] + c
        ) / sqrt(a * a + b * b);
    }


    for(let i = prevp + 1; i < strokeidxs[cutoffidx]; i++){
        const p = strokes[norm][i];
        if(!p[2]){
            addangle(prevp, i);
            prevp = i;
        }
    }
    if(prevp !== firstp) addangle(prevp, firstp);
    pointangles.sort((a, b) => a[0] - b[0]);
    // sort points by x coord, y coord
    // for each point, bin search closest point within dist
}


// -----------------

function draw(){
    const ctx = strings.getContext("2d", {willReadFrequently: true});
    const rect = brect(strings);

    ctx.fillStyle = bgcolor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = pointcolor;
    for(let type = 0; type < strokes.length; type++){
        for(let i = 0; i < strokes[type].length; i++){
        const p = strokes[type][i];
        if(p[2]) ctx.fillStyle = "red";
            else ctx.fillStyle = pointcolor;
        drawpoint(p[0] + center[0], p[1] + center[1], ctx);
    }
    }

    requestAnimationFrame(draw);
}



window.addEventListener("resize", () => {
    strings.width = strings.clientWidth;
    strings.height = window.innerHeight - 20;
    center[0] = strings.width / 2;
    center[1] = strings.height / 2;
    // resetfft();
    // resetfitcalc();
    redrawpaths = true;
});
window.dispatchEvent(new Event("resize"));

draw();