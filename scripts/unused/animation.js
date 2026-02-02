/* warning messages written by AI */
export class Ani{
    /*
    // Example usage:
    const element = document.getElementById("para");
    const ani1 = Ani(element).rotate();
    const ani2 = Ani(".class", {querycnt: 1}).rotate().simul(
        Ani()
        .rotate()
        .colorchange()
    ).then(()=>{
        print()
    }, 1000).colorchange().delay(2000).rotate();
    const ani3 = Ani(element).delay(ani1.done()).height();
*/
    #start = 0;
    #end = 0;
    #objanis = [];
    #mode = "none";
    #element = null;
    #query = null;
    #querycnt = Infinity;
    #querystyle = null;
    #tquerystyle = null; // transition query style
    #tot = new Map();
    #finished = false;
    static #class = ".ani-";
    static #count = 0; // to allow multiple instances of Ani on same element/query

    static #isnum(num){
        if(typeof num === 'number') {
            return num - num === 0;
        }
        if(typeof num === 'string' && num.trim() !== '') {
            return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
        }
        return false;
    }

    static #objempty(obj){
        for(const key in obj){
            return false;
        }
        return true;
    }

    static #setquerystyle(querystyle, style) {
        let element = document.querySelector(querystyle);
        if (!element) {
            element = document.createElement('style');
            element.className = querystyle;
            document.head.appendChild(element);
        }
        if(style != "")
            element.innerHTML = style;
    }
    

    static #addquerystyle(querystyle, style){
        Ani.#setquerystyle(querystyle, "");
        document.querySelector(querystyle).innerHTML += style;
    }

    #warn(value, name, checkfunction, defaultvalue){
        if(!checkfunction(value)){
            console.warn(`${name} is not a valid value, reverting to ${defaultvalue}`);
            return defaultvalue;
        }
        return value;
    }
    #warnb(value, name, boolean, defaultvalue){
        if(!boolean){
            console.warn(`${name} is not a valid value, reverting to ${defaultvalue}`);
            return defaultvalue;
        }
        return value;
    }



    #checkDuration(duration){
        return Ani.#isnum(duration) && duration >= 0;
    }

    #checkEasing(easing){
        const css = document.createElement('div').style;
        css.transitionTimingFunction = easing;
        return css.transitionTimingFunction != "";
    }
    
    #addDuration(duration) {
        if (!this.#checkDuration(duration)) {
            throw new Error("Duration must be a non-negative number");
        }
        this.#end += duration;
        return this;
    }

    constructor(param = null, extraparams = {}){
        this.#start = performance.now();
        this.#end = this.#start;
        if(param == null){
            this.#mode = "obj"; 
            return;
            // gonna be used in simul() to excecute multiple animations
        }
        else if(typeof param == "string"){
            this.#query = param;
            this.#mode = "query";
            if(extraparams.hasOwnProperty("querycnt")){
                this.#querycnt = this.#warn(extraparams["querycnt"], "Query Count", Ani.#isnum, Infinity);
            }
            this.#querystyle = Ani.#class + Ani.#count.toString(36);
        }
        else if(param instanceof NodeList || Array.isArray(param) && param.every(item => item instanceof Element)){
            this.#mode = "query";
            this.#query = Ani.#class + Ani.#count.toString(36);
            param.forEach(element => element.classList.add(this.#query));
            if(extraparams.hasOwnProperty("querycnt")){
                this.#querycnt = this.#warn(extraparams["querycnt"], "Query Count", Ani.#isnum, Infinity);
            }
            this.#querystyle = Ani.#class + "pluh" + Ani.#count.toString(36);
        }
        
        else if(param instanceof Element){
            this.#mode = "query";
            // dont use element, instead use query
            this.#query = Ani.#class + Ani.#count.toString(36);
            param.classList.add(this.#query);
            this.#querystyle = Ani.#class + "pluh" + Ani.#count.toString(36);
        }
        else{
            throw new Error("Invalid parameter");
        }
        console.assert(this.#mode != "none", "Mode is none, something went wrong");
        this.#tquerystyle = this.#querystyle + "-t";
        Ani.#setquerystyle(this.#querystyle, "");
        Ani.#setquerystyle(this.#tquerystyle, "");
        Ani.#count++;
    }

    #addobjani(obj){
        this.#objanis.push(obj);
        return this;
    }

    finish(){
        document.querySelectorAll(this.#query)?.forEach(element => element.classList.remove(this.#query));
        document.querySelector(this.#querystyle)?.remove();
        document.querySelector(this.#tquerystyle)?.remove();
        this.#finished = true;
    }

    delay({duration = 1000}){
        duration = this.#warn(duration, "Duration", this.#checkDuration, 1000);
        return this.#addDuration(duration);
    }

    then(callback, duration = 1000){
        duration = this.#warn(duration, "Duration", this.#checkDuration, 1000);
        this.#addDuration(duration);
        setTimeout(() => {
            callback(this);
        }, duration);
        return this;
    }

    simul(aniobj){
        /* use case, will do all animations at the same time
        const ani2 = Ani(".class").rotate().simul(
            Ani()
            .rotate()
            .colorchange()
        )
    */
        if(!(aniobj instanceof Ani)){
            console.warn("Invalid parameter, nothing will happen");
            return this;
        }
        if(aniobj.#mode != "obj"){
            console.warn("Invalid parameter, nothing will happen");
            return this;
        }        
        /**
         * aniObj is an instance of Ani
         * this function simul has its own handler for animating
         * for instant transforms (when duration is 0), will be sent to a the regular stylesheet
         * i.e. the one with id this.#querystyle
         * for transitions, will be sent to a temporary stylesheet
         * with unique class this.#querystyle + `-${idx}`
         * that will be removed after the animation is done
         * will be slow, but prob add parameter in future to delete or keep all temp stylesheets, in the latter case it would remove all when the ani object resolves all of its things
         * for now implement first idea of removing all temp stylesheets after the animation is done
         * 
         */
        let idx = 0;
        let maxduration = 0;
        for(const value of aniobj.#objanis){
            this.#execute(value, true, idx);
            idx++;
            maxduration = Math.max(maxduration, value.init.duration);
            if(idx >= this.#querycnt){
                break;
            }
        }
        this.#addDuration(maxduration);

        return this;
        
    }

    
    #execute(obj, simul = false, idx = -1){
        if(this.#finished){
            console.warn("Animation is already finished, nothing will happen");
            return this;
        }
        // cleaned by rule
        let style = `${this.#query}{`;
        let tstyle = `${this.#query}{`;
        let duration = 0;
        // add to style
        /*
            TODO:
            - instead of using #tot, use widow.getComputedStyle to get the current value of the property

        */
        for (const key in obj.init) {
            const value = obj.init[key];
            if (key == "duration") {
                style += `transition-duration: ${value}ms;\n`;
                duration = value;
                continue;
            }
            if (key == "easing") {
                style += `transition-timing-function: ${value};\n`;
                continue;
            }
            let offset = 0;
            if(obj.forwards){
                offset = this.#tot.get(obj.name) || 0;
            }
            style += `${key}: ${value + offset};\n`;
        }
        // add to tstyle
        let tproperties = "";
        for(const key in obj.t){

            let offset = 0;
            if(obj.forwards){
                offset = this.#tot.get(obj.name) || 0;
            }
            if(!obj.init.hasOwnProperty(key)){
                console.warn(`Property ${key} not in init, will default to current val`);
                style += `${key}: ${offset};`;
            }
            tstyle += `${key}: ${offset + obj.t[key]};`;
            tproperties += `${key}, `;
            this.#tot.set(obj.name, obj.t[key] + offset);
        }

        if(tproperties != ""){
            style += `transition-property: ${tproperties.slice(0, -2)};\n`;
        }

        style += "}";
        tstyle += "}";
        // alternate solution doing rn
        let div  = document.createElement("div");


        



        // timeout to curr time


        if(!simul){

        }
        else{
            document.querySelectorAll(this.#query).forEach(element => {
                
            });
        }



        return this;

        if(extra){
            // from simul, make sure to make a new stylesheet for querystyle
            // for tquerystyle, just add to the existing one, since transition info are in querystyle
            setTimeout(() => {
                Ani.#setquerystyle(this.#querystyle + `-${idx}`, style);
                setTimeout(() => {
                    Ani.#addquerystyle(this.#tquerystyle, tstyle);
                }, 0);
                setTimeout(() => {
                    document.querySelector(this.#querystyle + `-${idx}`).remove();
                }, obj.init.duration);
            }, this.#end + duration - performance.now()); // here add duration, since its from
            // simul and duration is not added prior.
        }
        else{
            // wait until current time is at the end of the duration
            this.#addDuration(duration);
            setTimeout(() => {
                Ani.#setquerystyle(this.#querystyle, style);
                setTimeout(() => {
                    Ani.#setquerystyle(this.#tquerystyle, tstyle);
                }, 0); // make sure the transition transitions
            }, this.#end - performance.now());
            return this;

        }

    }

/*
    will be basic initiator for all elements
    parameters for obj{ (degree and height example likely for rotation) 
        name: name || "",
        init:{
            degrees: degrees || 0,
            height: height || 0,
            duration: milliseconds || 1000,
            easing: easing || "linear",
        },
        t:{
            degrees: degrees || 0, (degrees to transform to)
            height: height || 0, (height to transform to)
        },
        forwards: true/false, (if false and nothing in t, will be instant transform then instant back, so
        warn if no duration or easing is set in t.
        
            if forwards is true, use #tot map and require name to set tot value
        rest of parameters will be shoved into the css rule
}
    */
    rule(obj = {}){
        // clean up obj
        obj.name = obj.name || "";
        obj.init = obj.init || {};
        obj.t = obj.t || {};
        obj.forwards = this.#warnb(obj.forwards, "Forwards", typeof obj.forwards === "boolean", true);

        // make sure t is valid
        if(!Ani.#objempty(obj.t)){
            obj.init.duration = this.#warn(obj.init.duration, "Duration", this.#checkDuration, 1000);
            obj.init.easing = this.#warn(obj.init.easing, "Easing", this.#checkEasing, "linear");
        }



        if(this.#mode == "obj"){
            return this.#addobjani(obj);
        }
        else{
            return this.#execute(obj);
        }
        // add all other properties to style
        
        
    }

    done(){
        return this.#end;
    }

    /*
    parameters
    
    Ani.rotate(
        {
            degrees: degrees || 360,
            duration: milliseconds || 0,
            easing: easing || "linear",

        }
    )
    
s.element.style.transform = `rotate(${degrees * begin}deg)`;
            setTimeout(() => {
                this.element.style.transform = `rotate(${degrees * end}deg)`;
            }, 0);
        } else {
            throw new Error("Invalid mode for rotation");
        }
    }

    */

    // rotate({degrees = 360, duration = 0, easing = "linear"}) {
    //     degrees = this.#warn(degrees, "Degrees", Ani.#isnum, 360);
    //     easing = this.#warn(easing, "Easing", this.#checkEasing, "linear");
    //     duration = this.#warn(duration, "Duration", this.#checkDuration, 0);
    //     return this.rule({
    //         name: "rotate",
    //         init: { 
    //             transform: `rotate(${degrees}deg)`,
    //             transition: `transform ${duration}ms ${easing}`
    //         },
    //         forwards: true
    //     });
    // }
    

}
class PermenantAni extends Ani{

    /**
     * like Ani, but will not be removed after execution
     * will allow for use cases like:
     * <button data-aniId="a" onclick="PermenantAni(element.dataset.aniId).rotate()">Rotate</button>
     * so that the element will rotate every time the button is clicked
     * but will keep the rotation after the animation is done
     */
    // implement after Ani is done
    // use static variable to store all instances of PermenantAni as IDs


    constructor(){

    }
}