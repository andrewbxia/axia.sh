const strings = eid("str");
FpsMeter.init();


const bgcolor = "black";
let mode = "none", 
    pointmode = 0; // normal, peg
let normvis = 1, pegvis = 1,
    extlines = 0;
const strokes = [[], []]; // norms, pegs
const peg = 0, norm = 1;
const strokeidxs = [0]; // indices of stroke ENDS
const pointsize = 2;
const pointhalf = pointsize / 2;
const pointcolor = "white";
const distthresh = 4 / 2, anglethresh = 10 * deg2rad / 2;
let nodeconnections = 30, currmaxconnect = 0;
const stringalpha = 0.5;
const center = [0, 0];
let autorestring = true;
let pretty = false;
let cutoffidx = 0; // basic undo/redo functionality
const pointangles = []; // angle, fromidx, toidx


const msps = new RollingAvg(15);

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
    strokes[pointmode].push([x - center[0], y - center[1], pointmode === peg ? new Set() : null]);
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

window.addEventListener("resize", () => {
    strings.width = strings.clientWidth;
    strings.height = strings.clientHeight
    center[0] = strings.width / 2;
    center[1] = strings.height / 2;
    attachdebug(strings.height, strings.clientHeight);
    resetstrings();
});


const redo = () => {
    cutoffidx = min(strokeidxs.length - 1, cutoffidx + 1);
    resetstrings();
    // resetfft();
}
const clr = () => {
    cutoffidx = 0;
    strokes[pointmode].length = 0;
    // strokes[peg].length = 0;
    // strokes[norm].length = 0;
    // resetstrings();
    // resetfft();
}


const undo = () => {
    cutoffidx = max(0, cutoffidx - 1);
    resetstrings();
    // resetfft();
}
// -----------------

const strmode = () => {
    const checkbox = eid("str-mode");
    const output = checkbox.parentElement.querySelector(".output");
    pointmode = checkbox.checked ? norm : peg;
    output.textContent = pointmode ? "norm" : "peg";
}

strmode();

const setnormvis = () => {
    const checkbox = eid("norm-vis");
    normvis = checkbox.checked;
}
const setpegvis = () => {
    const checkbox = eid("peg-vis");
    pegvis = checkbox.checked;
}
const extendlines = () => {
    const checkbox = eid("extend-lines");
    extlines = checkbox.checked;
}
const setnodeconnections = () => {
    const input = eid("max-node-connect");
    nodeconnections = clamp(pint(input.value), 1, 100);
    if(nodeconnections == input.max) nodeconnections = Infinity;
    const output = input.parentElement.querySelector(".output");
    output.textContent = nodeconnections;

    currmaxconnect = 0;
    resetstrings();
}
setnodeconnections();
function dispcurrmaxconnect(){
    const output = eid("max-connections").querySelector(".output");
    output.textContent = currmaxconnect;
}

const setautorestring = () => {
    const checkbox = eid("auto-restring");
    autorestring = checkbox.checked;
}
setautorestring();
const setpretty = () => {
    const checkbox = eid("pretty-mode");
    pretty = checkbox.checked;
}
setpretty();




// ===============


function calcangle(type, fromidx, toidx){
    const p = strokes[type][toidx];
    return atan2(p[0] - strokes[type][fromidx][0], (p[1] - strokes[type][fromidx][1]));
}

function dist(p1, p2){
    return sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

function ptlinedist(point, p1, p2){
    const a = 1;
    const b = -(p2[0] - p1[0]) / den(p2[1] - p1[1]);
    const c = -b * p1[1] - p1[0];
    // -b/a*y - x
    const d12 = dist(p1, p2);
    const d1 = dist(point, p1), d2 = dist(point, p2);
    const mindistpts = min(d1, d2), maxdistpts = max(d1, d2);
    const abovep1 = (a * point[1] - p1[1]) > b * (point[0] - p1[0]);
    const belowp2 = (a * point[1] - p2[1]) < b * (point[0] - p2[0]);
    const btn = abovep1 === belowp2;

    if(/*maxdistpts < d12 || */btn) return abs(
        a * point[0] + b * point[1] + c
    ) / sqrt(a * a + b * b);
    return mindistpts;

    return max(abs(
        a * point[0] + b * point[1] + c
    ) / sqrt(a * a + b * b), mindistpts);
}

function resetstrings(force = false){
    if(autorestring || force){}
    else return;
    perf.bump();
    pointangles.length = 0; // arr of norm points angles
    // todo future andueetew do for added points only, not whole thingy every time

    
    function addangle(fromidx, toidx){
        const p = strokes[norm][toidx];
        const angle = calcangle(norm, fromidx, toidx);
        pointangles.push([angle, fromidx, toidx]); // angle, fromidx, toidx
    }

    for(let i = 1; i < strokes[norm].length; i++){
        addangle(i - 1, i);
    }

    // if(strokes[norm].length > 1) addangle(strokes[norm].length - 1, 0); // loop back tob egining
    pointangles.sort((a, b) => a[0] - b[0]);

    // const i = strokes[peg].length - 1;
    // if(i < 0) return;

    for(let i = 0; i < strokes[peg].length; i++) 
        strokes[peg][i][2].clear();
    for(let i = 0; i < strokes[peg].length - 1; i++){
        const pi = strokes[peg][i];
        for(let j = 0; j < strokes[peg].length; j++){
            if(i === j) continue;
            const pj = strokes[peg][j];
            const ang = calcangle(peg, i, j);
            // check angle and dist
            let la = 0, ra = pointangles.length;
            while(la < ra){ // get min angle idx
                const ma = floor(la + (ra - la) / 2);
                if(pointangles[ma][0] < ang - anglethresh) la = ma + 1;
                else ra = ma;
            }
            while(la < pointangles.length && pointangles[la][0] < ang + anglethresh){
                const normidx = pointangles[la][2];
                const distance = ptlinedist(strokes[norm][normidx], pi, pj);
                if(distance < distthresh){
                        // connect peg i and j with norm normidx
                    if(pi[2].size < nodeconnections){
                        pi[2].add(j);
                        currmaxconnect = max(currmaxconnect, pi[2].size);
                        // break;
                    }
                    else if(pj[2].size < nodeconnections){
                        pj[2].add(i);
                        currmaxconnect = max(currmaxconnect, pj[2].size);
                        // break;
                    }
                    else{
                        break; // temp thingy
                    }
                    // pj[2] = i;
                }
                la++;
            }
        }
    }
    dispcurrmaxconnect();
    msps.add(perf.bump());
    const ms = msps.avg;
    const output = eid("msps").querySelector(".output");
    output.textContent = fix2num(ms, 2);


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

        // ctx.fillStyle = "red";
        for(let i = 0; i < strokes[type].length; i++){
            const p = strokes[type][i];
            if(type === peg) {
                if(p[2].size > 0){

                    // ctx.strokeStyle = `rgba(0, 0, 255, ${(nodeconnections - p[2].length) / nodeconnections * stringalpha})`;
                    if(nodeconnections === Infinity || pretty) ctx.strokeStyle = `rgba(0, 0, 255, ${1 / p[2].size})`;
                    else ctx.strokeStyle = `rgba(0, 0, 255, ${(1 + nodeconnections - p[2].size) / nodeconnections * stringalpha})`;
                    for(const j of p[2]){
                        ctx.beginPath();
                        let startpos = [p[0] + center[0], p[1] + center[1]];
                        let endpos = [strokes[peg][j][0] + center[0], strokes[peg][j][1] + center[1]];
                        if(extlines){
                            // quick thing by chatgpt im gonna make this my own later since this is end of classperiod
                            const dir = [endpos[0] - startpos[0], endpos[1] - startpos[1]];
                            const len = sqrt(dir[0] ** 2 + dir[1] ** 2);
                            dir[0] /= len;
                            dir[1] /= len;
                            startpos[0] -= dir[0] * 1000;
                            startpos[1] -= dir[1] * 1000;

                            endpos[0] += dir[0] * 1000;
                            endpos[1] += dir[1] * 1000;
                        }


                        ctx.moveTo(startpos[0], startpos[1]);
                        ctx.lineTo(endpos[0], endpos[1]);
                        ctx.stroke();
                    }
                }
            
            
            }

            if(type === peg && !pegvis) continue;
            if(type === norm && !normvis) continue;
            if(type === peg) ctx.fillStyle = "red";
            else ctx.fillStyle = pointcolor;
            drawpoint(p[0] + center[0], p[1] + center[1], ctx);
        }
    }

    requestAnimationFrame(draw);
}
window.dispatchEvent(new Event("resize"));

draw();
