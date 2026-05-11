/*
hey github lurker!
this is the animation library that handles the dark and light mode transition animations
u see on my main page, and was the main product of my initial forway 'playing around' with 
javascript if u read the description of this repostiroy.

what i mean is, this is basically my first javascript project: it's really hacky, finicky, 
works only 80% of the time, and this is NOT AT ALL how I would code this if I were to do 
it again today.

have fun working through the spaghetti code! :)
you have been warned... 😱😱😱
*/


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
        const defultvalue = Ani.#defaultvalues[value];

        if (!match) {
            if(!defultvalue)
                throw new Error(`this value is likely |none| but still poopoo: ${value}. For values like rotate, set them to a defulat value like 0deg`);
            console.warn(`Value ${value} not recognized, using default value ${Ani.#defaultvalues[value]}`);
            match = defaultvalue.match(regex);
        }

        const [, num, unit] = match;
        const newValue = Math.max(parseFloat(num) + addition);
        // console.log(this.#query, value,unit);

        return `${newValue}${unit}`;
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

    finish() {
        return this.#queuePromise(() => {
            this.#done = true;
            // this.#cleanupcleanupeverybodyeverywherecleanupcleanupeverybodydoyourshare();
        });
    }

    rule(obj) {
        // TODO: prevent rule interference across ani instances
        // ignore obj mode
        if (this.#mode == "obj") {
            return this;
        }
        if (this.#done) {
            console.error("Animation already finished");
            return this;
        }
        const duration = (obj.duration >= 0) ? obj.duration: 1000;
        const easing = obj.easing || "linear";
        const forwards = obj.forwards || false;
        const additive = obj.additive || [false, false];
        const iterations = obj.iterations || 1;
        const from = obj.from || [];
        const to = obj.to || [];
        const otherignore = obj.otherignore || false;
        const elements = document.querySelectorAll(this.#query);
        // const id = this.#increment(); // do this in the loop
        this.#updatecurr(duration * iterations);
        let idx = 0;
        let keys = [];
        while (idx < Math.min(this.#querycnt, elements.length)) {
            keys.push(this.#increment());
            idx++;
        }
        idx = 0;
        from.forEach((item) => {
            for (const prop in item) {
                this.#changedproperties.add(prop);
            }
        });
        to.forEach((item) => {
            for (const prop in item) {
                this.#changedproperties.add(prop);
            }
        });
        


        return this.#queuePromise(() => {
            if (this.#done) {
                console.error("Animation already finished");
                return this;
            }
            for (const el of elements) {
                if (idx >= this.#querycnt) {
                    break;
                }
                idx++;

                const key = keys.shift();
                if (!otherignore && el.dataset.ani) {
                    if(key < el.dataset.ani)
                        continue;
                    Ani.rmvani(el.dataset.ani);
                }
                // const key = performance.now();
                if(!otherignore)
                    el.dataset.ani = key;
                const frames = [{}, {}];

                from.forEach((item) => {
                    for (const prop in item) {
                        const val = item[prop];

                        frames[0][prop] = additive[0]
                            ? this.#addunit(getComputedStyle(el)[prop], parseFloat(val))
                            : val;
                    }
                });

                to.forEach((item) => {
                    for (const prop in item) {
                        const val = item[prop];
                        frames[1][prop] = additive[1]
                            ? this.#addunit(getComputedStyle(el)[prop], parseFloat(val))
                            : val;
                    }
                });

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

/*
///use case
new Ani(query).rule({// adds three and 49 
    from:[
        width: "50px",
        height: "70px",
    ]
    to:[
        width: "3px",
        height: "49px",
    ],
    duration: 3000,
    forwards: true,
    easing: "ease-out",
    additive: [true, false], // adds intiially, transitions to absolute

}).rule({ // sets to zero and five, then transitions to a width of 15
    from:[
        width: "0px",
        height: "5px",
    ],
    to: [
        width: "15px",
    ],
    duration: 1000,
    forwards: true,
    easing: "linear",
    additive: [false, true], // sets to zero and five, then transitions to 15 px more than initial
}).rule({
    to: [
        height: "20px",
    ],
    duration: 500,
    forwards: false,
    easing: "ease-in",
    additive: [false, true], // ease adds on 20px. If additive[1] was false, then it would transition from current state to 20px width.
})

*/