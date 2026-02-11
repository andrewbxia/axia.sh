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
const distthresh = 5, anglethresh = 15 * deg2rad, nodeconnections = 3;
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
    strokes[pointmode].push([x - center[0], y - center[1], []]);
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
const pointangles = []; // angle, fromidx, toidx

const strmode = () => {
    const checkbox = eid("str-mode");
    const output = checkbox.parentElement.querySelector(".output");
    pointmode = checkbox.checked ? peg : norm;
    output.textContent = pointmode ? "peg" : "norm";
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


function calcangle(type, fromidx, toidx){
    const p = strokes[type][toidx];
    return atan2(p[0] - strokes[type][fromidx][0], (p[1] - strokes[type][fromidx][1]));
}

function dist(p1, p2){
    return sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}

function ptlinedist(point, p1, p2){
    const a = 1;
    const b = -(p2[0] - p1[0]) / (p2[1] - p1[1]);
    const c = -b * p1[1] - p1[0];
    // -b/a*y - x

    const distpts = min(dist(point, p1), dist(point, p2));

    if(distpts < dist(p1, p2)) return abs(
        a * point[0] + b * point[1] + c
    ) / sqrt(a * a + b * b);
    return distpts;


    return max(abs(
        a * point[0] + b * point[1] + c
    ) / sqrt(a * a + b * b), distpts);
}

function resetstrings(){
    pointangles.length = 0; // arr of norm points angles

    
    function addangle(fromidx, toidx){
        const p = strokes[norm][toidx];
        const angle = calcangle(norm, fromidx, toidx);
        pointangles.push([angle, fromidx, toidx]); // angle, fromidx, toidx
    }

    for(let i = 1; i < strokes[norm].length; i++){
        addangle(i - 1, i);
    }

    if(strokes[norm].length > 1) addangle(strokes[norm].length - 1, 0);
    pointangles.sort((a, b) => a[0] - b[0]);

    
    for(let i = 0; i < strokes[peg].length; i++) strokes[peg][i][2] = []; // reset connections

    for(let i = 0; i < strokes[peg].length; i++){
        const pi = strokes[peg][i];
        for(let j = i + 1; j < strokes[peg].length; j++){
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
                    if(pi[2].length < nodeconnections)
                        pi[2].push(j);
                    break;
                    // pj[2] = i;
                }
                la++;
            }
        }
    }


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
        if(type === peg && !pegvis) continue;
        if(type === norm && !normvis) continue;

        for(let i = 0; i < strokes[type].length; i++){
            const p = strokes[type][i];
            if(type === peg) {
                if(p[2].length > 0){
                    ctx.fillStyle = "blue";
                    ctx.strokeStyle = "blue";
                    for(let j = 0; j < p[2].length; j++){

                        ctx.beginPath();
                        let startpos = [p[0] + center[0], p[1] + center[1]];
                        let endpos = [strokes[peg][p[2][j]][0] + center[0], strokes[peg][p[2][j]][1] + center[1]];
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
                        const connectedP = strokes[peg][p[2][j]];
                        ctx.lineTo(endpos[0], endpos[1]);
                        ctx.stroke();
                    }
                }
            
            
                ctx.fillStyle = "red";
            }
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