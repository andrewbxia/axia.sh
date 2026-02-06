const minurl = window.location.host; // give them the port if they wanna!!!!
const baseurl = window.location.origin;
const fullurl = baseurl + window.location.pathname;
const siteurls = ["andrewb.xyz", "axia.sh", "axia.nekoweb.org"];
const debug = !siteurls.includes(minurl);
const helperjs = true;
class ls{
    static set(key, value){
        if(typeof value !== "string"){
            derr("value is not a string");
            return;
        }
        localStorage.setItem(key, value);
    }
    static get(key){
        return localStorage.getItem(key);
    }
    static rm(key){
        localStorage.removeItem(key);
    }
}
class perf{
    static defname = "chich";
    static mark(name = perf.defname){
        performance.mark(name);
    }
    static get now(){
        return performance.now();
    }
    static meas(startmark, endmark, measurename = "poop"){ // measure
        const m = performance.measure(measurename, startmark, endmark);
        attachdebug(`${measurename}: ${m.duration}ms`);
        return m.duration;
    }
    static diff(markname = perf.defname, markidx = -1){
        const mark = performance.getEntriesByName(markname);
        if(markidx < 0) markidx += mark.length; // wrap to last idx
        markidx = max(markidx, mark.length - 1);
        if(mark.length > 0){
            return perf.now - mark[markidx].startTime;
        }
        return 0;
    }
    static bump(markname = perf.defname){
        const diff = perf.diff(markname);
        perf.mark(markname);
        return diff;
    }
}

// some accessibility stuffies

// mutable to allow toggle
let motionsickness = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

const updatems = (action = "none", reload = false) => {
    switch(action){
        case "toggle":
            motionsickness = !motionsickness;
            break;
        case "set":
            motionsickness = true;
            break;
        case "unset":
            motionsickness = false;
            break;
        default:
            break;
    }
    ls.set("ms", motionsickness ? "1" : "0");
    if(reload) window.location.reload();
};

if(ls.get("ms")) motionsickness = ls.get("ms") === "1";
else updatems();



// helper code i wrote to make everything(javascript) either less horrible

const eid = (id) => document.getElementById(id);
const eq = (query) => document.querySelector(query);
const eqa = (query) => document.querySelectorAll(query);
const compst = (el) => window.getComputedStyle(el);
const brect = (el) => el.getBoundingClientRect();
const pint = (el, rad = 10) => parseInt(el, rad);
const poat = (el) => parseFloat(el);
const log = (...message) => console.log(...message);
const dlog = (...message) => {if(debug) console.trace(perf.now, ...message)}; // debug log
const dlert = (...message) => {if(debug) alert(...message)};
const warn = (...message) => console.warn(...message);
const darn = (...message) => {if(debug) warn(...message)}; // lmao im keeping darn no dwarn here
const err = (...message) => console.error(...message);
const derr = (...message) => {if(debug) err(...message)};
const terr = (...message) => {
    attachdebug("error", ...message);
    throw new Error(message.join(" "));
}; // throw error

// math nerd omg haha
const abs = (num) => Math.abs(num);
const pow = (num, exp = 2) => Math.pow(num, exp);
const pi = Math.PI
const deg2rad = pi / 180;
const rad2deg = 180 / pi;
const sin = (rads) => Math.sin(rads);
const cos = (rads) => Math.cos(rads);
const tan = (rads) => Math.tan(rads);
const sqrt = (a) => Math.sqrt(a);
const log2 = (a) => Math.log2(a);
const log10 = (a) => Math.log10(a);
const logn = (a, base) => log2(a) / log2(base);
const atan = (ratio) => {
    return Math.atan(ratio); 

    // below only works for vals btn -1 -> 1
    ratio = clamp(ratio, -1, 1); // graph this and twiddle clamp
    return pi*ratio/4 - ratio * (abs(ratio) - 1) * (.2447 + .0663 * abs(ratio))
};
const atan2 = (x, y) => {
    // return Math.atan2(y, x);
    const approx = atan(y / x);
    if(x < 0){
        if(y < 0) return approx - pi;
        return approx + pi;
    }
    return approx;
}

const round = (a) => floor(a + 0.5);
const snap = (num, to = 2) => round(num / to) * to; // snaps to nearest multiple of 'to'

const isnan = isNaN;
const assert = (condition, msg) => {if(!condition) throw new Error(msg);};
const assertnotreached = (msg = "unreachable thingy reached") => assert(false, msg);

const pxlheight = window.innerHeight * window.devicePixelRatio;
const pxlwidth = window.innerWidth * window.devicePixelRatio;
const sp = "&nbsp;";
const nofunc = () => {};
const zerofunc = () => 0;


function max(...args){
    if(args.length === 0) return null;
    let maxn = args[0];
    args[1] = args[1] || 0;
    for(let i = 1; i < args.length; i++){
        if(typeof maxn !== typeof args[i]) console.warn("types not same");
        maxn = maxn > args[i] ? maxn : args[i];
    }
    return maxn;
}
function min(...args){
    if(args.length === 0) return null;
    let minn = args[0];
    args[1] = args[1] || 0;
    for(let i = 1; i < args.length; i++){
        if(typeof minn !== typeof args[i]) console.warn("types not same");
        minn = minn < args[i] ? minn : args[i];
    }
    return minn;
}
const clamp = (val, mini = val, maxi = val) => min(max(val, mini), maxi);
const floor = (a) => Math.floor(a);
const ceil = (a) => Math.ceil(a);
const rand = (mult = 1, add = 0) => Math.random() * mult + add;
const randint = (mult = 1, add = 0) => Math.floor(Math.random() * (mult + 1)) + add;
const randarridx = arr => Math.floor(Math.random() * arr.length);
const randarrchoose = arr => arr[randarridx(arr)];
function extrrand(mult) { // prefer extremes of distribution
    const random = rand();
    const bias = random < 0.5 ? pow(random, 2) : 1 - pow(1 - random, 2);
    return bias * mult;
}
const chance = (onein = 2) => Math.random() < 1 / onein;
const fix2str = (num, places = 2) => num.toFixed(places);
const fix2num = (num, places = 2) => {
    const factor = Math.pow(10, places);
    return round(num * factor) / factor;
}
const frand = (mult = 1, add = 0, places = 2) => fix2num(rand(mult, add), places);
const benchmark = (func = nofunc, paramfunc = zerofunc, ...params) => {
    const iter = 1000000;
    const start = perf.now;
    for(let i = 0; i < iter; i++){
        func(paramfunc(...params));
    }
    const end = perf.now;
    return (end - start) / 1000;
}

const params = new URLSearchParams(window.location.search);

// based off of https://github.com/stephenmathieson/ordinal-number-suffix
function numsuffix(num, onlysuffix = false){
    const prefix = onlysuffix ? "" : num + "";
    num %= 100;
    return prefix + (floor(num / 10) === 1
      ? 'th'
      : (num % 10 === 1
        ? 'st'
        : (num % 10 === 2
          ? 'nd'
          : (num % 10 === 3
            ? 'rd'
            : 'th'))));
}


// dont use except when i go into typescript since event doesnt have code editor striggies
const listen = (event, callback, element = document) => {
    element.addEventListener(event, callback);
    return () => element.removeEventListener(event, callback);
}
function addclicklistener(query, callback){
    document.addEventListener("click", (e) => {
        if(e.target.matches(query)){
            callback(e);
        }
    })
}

class TSFuncs{
    static #funcs = [];
    static add(func){
        if(!(func instanceof Function)){
            derr("arg is not a function");
            return;
        }
        TSFuncs.#funcs.push(func);
    }
    static run(theme){
        TSFuncs.#funcs.forEach(func => {
            func(theme);
        });
    }
}

let thememode = ls.get("theme") || "light";
const toggletheme = () => {
    document.documentElement.classList.toggle("dark"); 
    thememode = document.documentElement.classList.contains("dark") ? "dark" : "light";
    ls.set("theme", thememode);
    document.documentElement.setAttribute("data-theme", thememode);
    
    TSFuncs.run(thememode);
}



// light mode better tho :sunglasses: :sunglasses:
if ((!ls.get("theme") || thememode === "dark") && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
    // toggle to dark
    toggletheme();
}
ls.set("theme", thememode);
document.documentElement.setAttribute("data-theme", thememode);

const elprop = (element, property) => poat(compst(element).getPropertyValue(property));
const elpropstr = (element, property) => compst(element).getPropertyValue(property);
const docprop = (property) => elpropstr(document.documentElement, property);
const setprop = (element = document.documentElement, property, value = null) => element.style.setProperty(property, value);

function isnum(num){
    if(typeof num === 'number') {
        return num - num === 0;
    }
    if(typeof num === 'string' && num.trim() !== '') {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    }
    return false;
}
const nullnum = (num) => isnum(num) ? num : null;
// html elements funcs to make everything terse and unreadable
function mk(type, attr = {}){
    const el = document.createElement(type);
    for(const [key, value] of Object.entries(attr)){
        el.setAttribute(key, value);
    }
    return el;
}
function mktxt(type = "p", txt = "", attr = {}, explicit = false){ /* explicitly set as inner text */
    if(typeof attr === "boolean"){
        explicit = attr;
        attr = {};
    }
    const el = mk(type, attr);
    if(explicit)
        el.innerText = txt;
    else
        el.innerHTML = txt; // hopefully no one abooses this :(((((
    return el;
}
function mkhtml(type, txt = "", attr = {}) {
    if (typeof txt === "object") {
        return mktxt(type, "", txt).outerHTML;
    }
    return mktxt(type, txt, attr).outerHTML;
}
function checknodes(func, ...nodes){
    let ok = true;
    nodes.forEach((node, idx) => {
        if(!(node instanceof Node)){
            err(`arg ${idx + 1} is not a node`);
            attachdebug(`arg ${idx + 1} is not a node`);
            ok = false;
        }
    });
    if(ok) func(...nodes);
    return ok;
}

function app(parent, child){
    checknodes((p, c) => p.appendChild(c), parent, child);
    return parent;
}
function appmany(parent, children){
    children.forEach(child => app(parent, child));
    return parent;
}

function appnest(...nodes){
    if(!checknodes(nofunc, ...nodes))return null;
    for(let i = nodes.length - 1; i > 0; i--){
        app(nodes[i - 1], nodes[i]);
    }
    return nodes[0];
}

function appdoc(child){
    return app(document.body, child);
}
function prep(parent, child){
    checknodes((p, c) => p.prepend(c), parent, child);
    return parent;
}
function prepmany(parent, children){
    children.forEach(child => prep(parent, child));
    return parent;
}
// no prepnest, does same as appnest functionally
function prepdoc(child){
    return prep(document.body, child);
}


const fromhtml = (txt) => mktxt("template", txt).content.firstChild;
const tohtml = (el) => el.outerHTML;


function link(url, txt = "", target = "_blank", attr = {}){
    if(typeof target === "object"){
        attr = target;
        target = "_blank";
    }
    return mktxt("a", txt, {href: url, target: target, ...attr});
};
function linkhtml(url, txt = "", target = "_blank", attr = {}){
    if(typeof target === "object"){
        attr = target;
        target = "_blank";
    }
    return mkhtml("a", txt, {href: url, target: target, ...attr});;
}
function nodelist(arr){
    const list = document.createDocumentFragment();
    appmany(list, arr);
    return list;
}
const script = (src, defer = true, async = true) => {
    const sc = mk("script", {src, defer, async});
    app(document.head, sc);
    return sc;
}
const scripting = (src) => {
    const sc = mktxt("script", src);
    app(document.head, sc);
    return sc;
}
const style = (src) => {
    const sty = mk("link", {rel: "stylesheet", href: src});
    app(document.head, sty);
    return sty;
}

const styling = (sty) => {
    const st = mktxt("style", sty);
    app(document.head, st);
    return st;
}

// elements 
const img = (src, attr = {}) => mk("img", {src, ...attr});
const imghtml = (src) => `<img src="${src}" />`;
// text & header elements
const h_n = (n = 1, txt, attr = {}) => mktxt(`h${n}`, txt, attr); //, true);
// i could do h1=(...args)=>h_n(1,...args) but i dont get parameter hints thta way
const h1 = (txt, attr = {}) => h_n(1, txt, attr);
const h2 = (txt, attr = {}) => h_n(2, txt, attr);
const h3 = (txt, attr = {}) => h_n(3, txt, attr);
const h4 = (txt, attr = {}) => h_n(4, txt, attr);
const h5 = (txt, attr = {}) => h_n(5, txt, attr);
const h6 = (txt, attr = {}) => h_n(6, txt, attr);

const p = (txt, attr = {}, explicit) => mktxt("p", txt, attr, explicit);
const li = (txt, attr = {}) => mktxt("li", txt, attr);
const span = (txt, attr = {style: "display: inline"}) => mktxt("span", txt, attr);

const fieldset = (txt, legend, attr = {}) => appmany(mk("fieldset", attr), [
    mktxt("legend", legend, 
        {style: "text-decoration:underline; font-variation-settings: 'wght' 700;"}),
    mktxt("p", txt)
]);

// organize elemnets
const div = (attr = {}) => mk("div", attr);

//input elements
const button = (txt, onclick = nofunc, attr = {}) => mktxt("button", txt, {onclick, ...attr}, true);


// things to do when thing loads or some thing
function imglazy(img){
    if(!img.hasAttribute("loading")){
        img.setAttribute("loading", "lazy");
    }
    return img;
}
document.addEventListener("DOMContentLoaded", () =>{
    eqa("img").forEach(img => {
        if(!img.classList.contains("nl"))
            imglazy(img);
    })
});
    

function attachdebug(...messages){
    if(!debug) return;
    const debugmessage = `debug mode enabled, if you're not me 
        and you see this you can blame my bad coding`;
    
    if(!eid("debug")) {
        if(Debug){
            Debug.init();
            log("ok")
        }
        else{
            return;
        }
    }
    const el = eid("debug");
    el.innerHTML = "";

    app(el, mktxt("h4", debugmessage));
    const list = mk("ul");
    messages.forEach(m => {
        app(list, mktxt("li", m, true));
    });
    app(el, list);
}


// color/extra style funcs

{
    // make 0.07s in css
    // time from dimden.dev
    let flickering = "@keyframes flickering{";
    const minopacity = 0.25;
    const limit = 75;
    let flickeringo = "@keyframes flickering-o{";
    let val = true;


    for(let i = 0; i <= limit; i+=randint(3, 1)){
        const valo = i > (limit - 5) ? 1 : min(1, .01 * round(100 * rand(1.25, .25)));
        flickeringo += `${i}%{opacity: ${valo.toFixed(2)};}`;
        flickering += `${i}%{opacity: ${(val || i > 45) ? 1 : minopacity};}`;
        val = !val;
    }

    flickeringo += "}";
    flickering += "}";
    styling(flickering);
    styling(flickeringo);
}


//bg bars && theme transition
function tohsl(cssColor, components = false){
    let r, g, b, a = 1;
  
    // rgb
    if (cssColor.startsWith('rgb')){
        const vals = cssColor.substring(cssColor.indexOf('(') + 1, cssColor.lastIndexOf(')')).split(',').map(Number);
        r = vals[0] / 255;
        g = vals[1] / 255;
        b = vals[2] / 255;
        if (vals.length === 4){
            a = vals[3];
        }
    } 
    // rgba
    else if (cssColor.startsWith('#')){
        const hex = cssColor.slice(1);
        if (hex.length === 3){
            r = pint(hex[0]+hex[0], 16) / 15;
            g = pint(hex[1]+hex[1], 16) / 15;
            b = pint(hex[2]+hex[2], 16) / 15;
        }
        else if (hex.length === 6 || hex.length === 8){
            const values = hex.match(/.{2}/g).map(v => pint(v, 16) / 255);
            [r, g, b] = values;
            if (hex.length === 8){
                a = values[3];
            }
        }
        else{
            return null;
        }
    }
    else{
      return null;
    }
  
    const maxc = max(r, g, b);
    const minc = min(r, g, b);
    let h, s, l = (maxc + minc) / 2;
  
    if (maxc === minc){
      h = s = 0; // achromatic
    } else{
      const d = maxc - minc;
      s = l > 0.5 ? d / (2 - maxc - minc) : d / (maxc + minc);
      switch (maxc){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = round(h * 360); s = round(s * 100); l = round(l * 100);
    if(components){
        return{h: h, s: s, l: l, a: a};
    }
    return `hsl(${h}, ${s}%, ${l}%${a === 1 ? '' : `, ${a}`})`;
}


/*
// returns minimum unit that is at least 1, or the unit passed for minlimit
dateago("week")
EX: 
3 months ago -> [12, "week"]
3 days ago -> [3, "day"]

dateago("day")
EX:
3 months ago -> [90, "day"]
3 days ago -> [3, "day"]
3 hours ago -> [3, "hour"]
*/

function dateago(date, minlimit = "year", multlimit = 1, comp = new Date()){
    if(!(date instanceof Date)){
        err("arg 1 is not a date");
        return [-1, "year"];
    }
    if(!(comp instanceof Date)) comp = new Date();
    if(date > comp){
        darn("dates in the future, swapping");
        [date, comp] = [comp, date];
    }
    const units = {
        year: 365 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000
    };
    const unitidxs = Object.keys(units);
    if(!units[minlimit]){
        minlimit = "year";
    }
    const diff = comp - date;
    let idx = 0, passedlimit = unitidxs[0] === minlimit;
    while(idx < unitidxs.length - 1 && (!passedlimit || diff < multlimit * units[unitidxs[idx]])){
        idx++;
        if(unitidxs[idx] === minlimit) passedlimit = true;
        // i swear someones gonna counsel me on binary search
    }
    return [diff / units[unitidxs[idx]], unitidxs[idx]];
}