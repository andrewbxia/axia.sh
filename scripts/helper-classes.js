// set of classes i made to help me not go crazy with tihs coding
const helperclassesjs = true;
class MeteredTrigger{
    #curr = 0;
    #limit = 100;
    #callback = () => {};
    #log = false;

    constructor(limit, callback = () => {throw new Error("not set yet noobb")}, log = false){
        this.#limit = limit;
        this.#callback = callback;
        this.#curr = performance.now() - this.#limit;
        this.#log = log;
    }

    fire(...args){
        const now = performance.now();
        if(now - this.#curr >= this.#limit){ // >= to let firing immediately after creation
            if(this.#log) console.log("fired");
            this.#callback(...args);
            this.#curr = now;
        }
    }

    setlimit(limit){
        this.#limit = limit;
    }
}

class PerSec{
    #q = [];
    #windowdefualt = 1000;
    #window = this.#windowdefualt;

    constructor(window = 1000){
        this.#q = [];
        this.#window = window;
    }

    shift(){
        while(this.#q.length > 0 && performance.now() - this.#q.at(0) > this.#window){
            this.#q.shift();
        }
    }

    setwindow(window){
        this.#window = window;
    }

    cnt(){
        this.shift();
        return this.#q.length;
    }

    add(countbefore = false){
        this.#q.push(performance.now());
        return this.cnt() - countbefore;
    }

    cntn(){ // count normalized
        return this.cnt() * this.#windowdefualt / this.#window;
    }
}


class MeteredPatientTrigger{
    #lastfire = -1;
    #lastattempt = -1;
    #limit = 100;
    #callback = () => new Error("not set yet noobb");
    #trigger = setTimeout(() => {}, 0);
    #log = false;

    constructor(limit, callback, log = false){
        this.#limit = limit;
        this.#callback = callback;
        this.#lastfire = 0;
        this.#log = log;
    }

    fire(...args){
        this.#exec(...args);
        this.#lastattempt = performance.now();
    }
    #exec(...args){
        const now = performance.now();
        const diff = now - this.#lastattempt;
        if(diff <= this.#limit){
            if(this.#log) console.log("fired");
            this.#callback(...args);
            this.#lastfire = this.#lastattempt;
        }
        else{
            if(this.#trigger) clearTimeout(this.#trigger);
            this.#trigger = setTimeout(() => {
                this.#exec(...args);
            }, this.#limit - diff + 1);

        }
    }

    getrecent(){
        return this.#lastattempt;
    }

    getrecentfire(){
        return this.#lastfire;
    }
}

class MeteredQueueTrigger{
    #lastfire = 0;
    #limit = 100;
    #callback = () => new Error("not set yet noobb");
    #trigger = setTimeout(() => {}, 0);
    #log = false;
    #queued = false;

    constructor(limit, callback, log = false){
        this.#limit = limit;
        this.#callback = callback;
        this.#log = log;
    }

    fire(...args){
        const diff = performance.now() - this.#lastfire;
        if(diff >= this.#limit){
            if(this.#log) console.warn("fired");
            this.#callback(...args);
            this.#lastfire = performance.now();
            this.#queued = false;
        }
        else{
            if(!this.#queued){
                this.#trigger = setTimeout(() => {
                    this.fire(...args);
                }, this.#limit - diff);
            }
            this.#queued = true;
        }
    }

    getrecent(){
        return this.#lastfire;
    }

}


class RollingAvg{
    #q = [];
    #sum = 0;
    #defaultcnt = 3;
    #cnt = this.#defaultcnt;

    get(){
        return this.#sum / Math.max(1, this.#q.length);
    }

    get avg(){
        return this.get();
    }

    #shift(){
        while(this.#q.length > this.#cnt){
            this.#sum -= this.#q.shift();
        }
    }

    add(val){
        this.#q.push(val);
        this.#sum += val;
        this.#shift();
        return this.get();
    }

    setcnt(ncnt = this.#defaultcnt){
        if(ncnt < 1) console.warn("cnt should be like 1 or something");
        this.#cnt = ncnt;
        this.#shift();
    }

    constructor(cnt = this.#defaultcnt, preset = []){
        this.setcnt(cnt);
        for(let i = Math.max(0, preset.length - this.#cnt); i < preset.length; i++){
            this.add(preset[i]);
        }
    }
}

// requires some methods from helper.js
class RollingActives{
    len = axiatxt.length;
    #classpre = "";
    #active = "";
    axia = axia;
    axiac = axia.childNodes;
    #activeq = Array(this.len).fill(0); /* keep track of cells currently active */
    #cnt = 0;
    #forcedreset = false;
    #decay = 100;
    #initialized = false;

    constructor(el, activeclass = "active", classprefix = "*"){ // maybe do class prefix later im lazy
        if(!helperjs) throw new Error("helper.js not loaded yet");
        this.#init();
        assert(el instanceof HTMLElement, "el is not a html element");
        this.axiac = el.childNodes;
        this.len = el.childNodes.length;
        // issues where helper.js is not loaded yet
        if(this.len === 0) warn("el gott like no children bruh");
        assert(typeof classprefix === "string" && classprefix.length > 0, "classprefix must be a nonempty string");
        assert(typeof activeclass === "string" && activeclass.length > 0, "activeclass must be a nonempty string");
        this.#classpre = classprefix;
        this.#active = activeclass;
    }

    #genid(){
        return ++this.#cnt;
    }

    #schedulereset(totaldelay = 0, idcheck = Infinity){
        setTimeout(() => {
            if(idcheck < this.#cnt)return;
            this.reset(true);
        }, totaldelay);
    }

    reset(indices = [], force = false){
        if(typeof indices === "boolean"){
            force = indices;
            indices = [];
        }
        if(force){
            this.#forcedreset = true; // activeq can possible go into the negatives
            this.axiac.forEach(e => {
                e.classList.remove(this.#active);
            });
            this.#activeq.forEach(q => q = 0);
        }
        else{
            indices.forEach(idx => {
                this.#activeq[idx]--;
                assert(this.#activeq[idx] >= 0 || this.#forcedreset, "activeq negative?");
                if(this.#activeq[idx] == 0){
                    this.axiac[idx].classList.remove(this.#active);
                    this.#activeq[idx] = 0;
                }
            });            
        }
    }

    set(arr = [], delay = 0, duration = 0, decay = this.#decay){
        if(arr.length === 0) return;
        setTimeout(() => {
            this.reset();
            arr.forEach(idx => {
                this.axiac[idx].classList.add(this.#active);
                this.#activeq[idx]++;
                // log(this.#activeq);
            });
        }, delay);
        setTimeout(() => {
            this.reset(arr);
        }, delay + duration + decay);
    }

    #init(){}


    pass({reverse = randint(1), nucleationsites = randint(floor(this.len / 2) - 1, 1), 
        step = randint(floor(this.len / max(1, nucleationsites - 1)) - 1, 1), delay = randint(150, 350) / 2, 
        start = -1, end = this.len, decay = this.#decay} = {}) {
        const id = this.#genid();
        let totaldelay = 0;
        end = min(end, this.len);
        const maxstart = end - (nucleationsites - 1) * step;
        const rev = reverse ? -1 : 1;
        if(start === -1)
            start = randint(maxstart);
        else{
            start = clamp(start, 0, maxstart);
            if(reverse) start = end - start - 1;
        }

        for (let i = reverse ? end - start - 1 : start; 
            reverse ? i >= 0 : i < end; i += rev) {

            let idx = i;
            const indices = [];
            while (idx >= 0 && idx < this.len && indices.length < nucleationsites) {
                indices.push(idx);
                idx += step * rev;
            }

            this.set(indices, totaldelay, delay, decay);
            totaldelay += delay;
        }

        return totaldelay;
    }
}

class WeightedChoices{
    #weights = [];
    #choices = [];

    add(choice, weight = 1){
        if(weight < 0) throw new Error("weight(s) cannot be negative");
        this.#choices.push(choice);
        this.#weights.push(weight + (this.#weights.at(-1) || 0));
    }
    remove(choice){
        let idx = 0;
        while(idx < this.#choices.length && this.#choices[idx] !== choice){
            idx++;
        }
        if(idx === this.#choices.length) return false;
        const weight = this.#weights[idx] - (this.#weights[idx - 1] || 0);
        this.#choices.splice(idx, 1);
        this.#weights.splice(idx, 1);
        while(idx < this.#choices.length){
            this.#weights[idx] -= weight;
            idx++;
        }
        return true;
    }

    constructor(choices, weights){
        if(weights === undefined){
            if(choices[0] instanceof Array && choices[0].length === 2){
                weights = choices.map(c => c[1]);
                choices = choices.map(c => c[0]);
            }
            else{
                weights = Array(choices.length).fill(1);
                choices = choices;
            }
        }
        for(let i = 0; i < choices.length; i++){
            this.add(choices[i], weights[i]);
        }
    }

    choose(){
        if(this.#weights.length === 0) return null;
        const rand = Math.random() * this.#weights.at(-1);
        let l = 0, r = this.#weights.length - 1, m = 0;
        while(l < r){
            m = l + Math.floor((r - l) / 2);
            if(this.#weights[m] < rand) l = m + 1;
            else r = m;
        }
        return this.#choices[l];
    }
    spinthelottery(){
        return this.choose();
    }


}

class KeySet{

    static #keys = new Set();
    static #initialized = false;
    static #specialchars = new Map([
        [" ", "\"\""],
        ["Enter", "⏎"],
        ["Shift", "⇧"],
        ["Control", "Ctrl"],
        ["Alt", "Alt"],
        ["Tab", "⇥"],
        ["CapsLock", "⇪"],
        ["ArrowUp", "↑"],
        ["ArrowDown", "↓"],
        ["ArrowLeft", "←"],
        ["ArrowRight", "→"],
        ["Backspace", "⌫"],
        ["Delete", "⌦"],
        ["Escape", "⎋"],
        ["Insert", "⎀"],
        ["Home", "⇱"],
        ["End", "⇲"],
        ["PageUp", "⇞"],
        ["PageDown", "⇟"],
        ["PrintScreen", "⎙"],
        ["Pause", "⏸"],
        ["NumLock", "⇭"],
        ["ScrollLock", "⇳"],
    ]);
    static #mspecialchars = new Map();
    static resetkey = this.#specialchars.get("Escape");
    static #nope = new Set([
        "\"", "\\",
    ]);
    // static #charmap = new Uint16Array(Math.pow(2,16));

    static onnewkey = () => {};
    static onoofkey = () => {};

    static getkeys(){
        return this.#keys;
    }
    static contains(key){
        return this.#keys.has(key);
    }
    static spcontains(spkey){
        return this.#specialchars.has(spkey);
    }
    static check(key){
        if(this.spcontains(key)) key = this.#specialchars.get(key);
        else if(key.length <= 1) return true;
        else return false;
    }
    static keydown(e){
        let key = e.key;
        if(this.#nope.has(key)) return;
        // if(key.length > 1) {}
        if(this.spcontains(key)) key = this.#specialchars.get(key);
        else if(key.length > 1) return;
        if(key === this.resetkey){
            for(const k of this.#keys){
                this.#keys.delete(k);
                const ekey = this.#mspecialchars.has(k) ? this.#mspecialchars.get(k) : k;
                this.onoofkey({key: k, ekey: ekey});
            }
        }
        if(this.contains(key)) return;

        this.#keys.add(key);
        this.onnewkey({key: key, ekey: e.key});
    }
    static keyup(e){
        let key = e.key;
        if(this.spcontains(key)) key = this.#specialchars.get(key);
        else if(key.length > 1) return;
        if(!this.contains(key)) return;

        this.onoofkey({key: key, ekey: e.key});
        this.#keys.delete(key);
    }

    static init(){
        if(this.#initialized) return;
        this.#initialized = true;

        for (const [k, v] of this.#specialchars) {
            this.#mspecialchars.set(v, k);
        }
        window.addEventListener("keydown", this.keydown.bind(this), {passive: true});
        window.addEventListener("keyup", this.keyup.bind(this), {passive: true});
    }
}

// this code was made a long time ago
// it sucks
// it probably has a billion memory leaks
// i know
// but it works (kind of)
// so whatever
class Ani{
    #mode = "none";
    #next = Promise.resolve();
    #done = false;
    #query = "";
    #start = 0;
    #curr = 0;
    #anikeys = [];
    #querycnt = Infinity;
    #changedproperties = new Set();
    static #counter = 0;
    static #animations = new Map(); // failed system to keep track of animations gonna fix latr

    static #defaultvalues = {
        margin: "0px",
        padding: "0px",
        width: "0px",
        height: "0px",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        opacity: "1",
        rotate: "0deg",
        scale: "1",
        skew: "0deg",
        marginTop: "0px",
        marginLeft: "0px",
        marginRight: "0px",
        marginBottom: "0px",
        paddingTop: "0px",
        paddingLeft: "0px",
        paddingRight: "0px",
        paddingBottom: "0px",

        // transform: "none", not supported
        // color: "transparent",
        // fontSize: "0px",
    };

    static #propnorms = [
        "rotate",
    ];// properties that scream if not manually set.

    constructor(query, params = {}){
        if (!query) {
            this.#mode = "obj";
            return this;
        }
        
        this.#query = query;
        this.#querycnt = params.querycnt || Infinity;
        this.#done = false;
        this.#start = performance.now();
        this.#curr = this.#start;
        this.#mode = "query";
    }
    // function handler
    #queuePromise(action, duration = 0) {
        this.#next = this.#next.then(() => new Promise((resolve) => {
            action();
            setTimeout(() => {
                resolve();
            }, duration);
        }));
        // this.#curr = performance.now();
        return this;
    }
    
    #updatecurr(duration){
        this.#curr += duration;
    }

    #increment(){
        Ani.#counter++;
        return Ani.#counter;
    }

    static rmvani(id){
        id--;
        // console.log(id, Ani.#animations.get(id));
        // Ani.#animations.get(id)?.cancel();
        Ani.#animations.delete(id);
        // console.log(Ani.#animations.size);
    }

    #cleanupcleanupeverybodyeverywherecleanupcleanupeverybodydoyourshare(){
        Ani.#animations.forEach((ani, id) => {
            ani.cancel();
            Ani.#animations.delete(id);
        });
    }

    #addunit(value, addition) { // ripped from chatgpt
        const regex = /^(-?\d*\.?\d+)([a-z%]*)$/i;
        let match = value.match(regex);
        const defaultvalue = Ani.#defaultvalues[value];

        if (!match) {
            if(!defaultvalue){
                const msg = `this value is likely |none| but still poopoo: ${value}, ${addition}. For values like rotate, set them to a defulat value like 0deg`;
                throw new Error(msg);
            
            }console.warn(`Value ${value} not recognized, using default value ${Ani.#defaultvalues[value]}`);
            match = defaultvalue.match(regex);
        }

        const [, num, unit] = match;
        const newValue = Math.max(parseFloat(num) + addition);
        // console.log(this.#query, value,unit);

        return `${newValue}${unit}`;
    }

    norm(){
        return this.#queuePromise(() => {
            document.querySelectorAll(this.#query).forEach(el => {
                const computed = getComputedStyle(el);
                for(const prop of Ani.#propnorms){
                    if(computed[prop] === "none" || computed[prop] === ""){
                        el.style[prop] = Ani.#defaultvalues[prop];
                    }
                }
            });
        });
    }

    contif(conditionfunc, falsefunc){
        return this.#queuePromise(() => {
            // console.log(conditionfunc());   
            this.#done = this.#done || !conditionfunc();
            if(!this.#done){
                falsefunc(this);
            }
        });
    }

    delay(duration = 1000){
        this.#updatecurr(duration);
        return this.#queuePromise(() => {}, duration);
    }

    then(callback, duration = 0) {
        this.#updatecurr(duration);
        return this.#queuePromise(() => {
            callback(this);
        }, duration);
    }

    def(){
        const defprops = {
            rotate: 0,

        };
        document.querySelectorAll(this.#query).forEach(el => {
            for(const key in defprops){
                el.style[key] = defprops[key];
            }
        });
        return this.delay(0);
    }

    reset(overwrite = {}){
        return this.#queuePromise(() => {
            
            let props = {};
            for(const prop of this.#changedproperties){
                if(overwrite[prop] !== undefined) props[prop] = overwrite[prop];
                else props[prop] = Ani.#defaultvalues[prop];
            }
            document.querySelectorAll(this.#query).forEach((el) => {
                console.log(el.animate(props, { duration: 0, fill: "forwards" }));
            });
            this.#changedproperties.clear();
        });
    }

    whendone(){
        // console.log(this.#curr - performance.now());
        return this.#curr - performance.now(); // usually this.#start, but could be innacurate due if code is slow (probably will be lol)
    }

    finish(){
        return this.#queuePromise(() => {
            this.#done = true;
            // this.#cleanupcleanupeverybodyeverywherecleanupcleanupeverybodydoyourshare();
        });
    }

    rule(obj){
        // TODO: prevent rule interference across ani instances
        // ignore obj mode
        if(this.#mode == "obj"){
            return this;
        }
        if(this.#done){
            console.error("Animation already finished");
            return this;
        }
        const duration = (obj.duration >= 0) ? obj.duration: 1000;
        const easing = obj.easing || "linear";
        const forwards = obj.forwards || true;
        const additive = obj.additive || [false, false];
        const iterations = obj.iterations || 1;
        const from = obj.from || {};
        const to = obj.to || {};
        const otherignore = obj.otherignore || false;
        const elements = document.querySelectorAll(this.#query);
        // const id = this.#increment(); // do this in the loop
        this.#updatecurr(duration * iterations);
        let idx = 0;
        let keys = [];
        
        while(idx < Math.min(this.#querycnt, elements.length)){
            keys.push(this.#increment());
            idx++;
        }
        idx = 0;
        for(const prop in from){
            this.#changedproperties.add(prop);
        }
        
        for(const prop in to){
            this.#changedproperties.add(prop);
        }
        
        


        return this.#queuePromise(() => {
            if(this.#done){
                console.error("Animation already finished");
                return this;
            }
            for(const el of elements){
                if (idx >= this.#querycnt){
                    break;
                }
                idx++;

                const key = keys.shift();
                if(!otherignore && el.dataset.ani){
                    if(key < el.dataset.ani)
                        continue;
                    Ani.rmvani(el.dataset.ani);
                }
                // const key = performance.now();
                if(!otherignore)
                    el.dataset.ani = key;
                const frames = [{}, {}];
                for(const prop in from){
                    const val = from[prop];
                    frames[0][prop] = additive[0]
                        ? this.#addunit(getComputedStyle(el)[prop], parseFloat(val))
                        : val;
                }

                for (const prop in to){
                const val = to[prop];
                    frames[1][prop] = additive[1]
                        ? this.#addunit(getComputedStyle(el)[prop], parseFloat(val))
                        : val;
                }

                Ani.#animations.set(
                    key,
                    el.animate(frames, {
                        duration,
                        easing,
                        iterations,
                        fill: forwards ? "forwards" : "none"
                    })
                );
                // console.log(this.#query, Ani.#animations.get(key));
                Ani.#animations.get(key).onfinish = () => Ani.#animations.delete(key);
            }
        }, duration);
        
    }
}
