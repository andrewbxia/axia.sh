export class Ani {
    #q = [];
    #start = 0;
    #curr = 0;
    #query = "";
    #querycnt = 0;
    #finished = false;
    #mode = "none";
    #anis = {
        from:[],
        to:[],
        forwards: false,
        additive: [],
        duration: [],
    };
    #animations = new Map();
    #counter = 0;
    #arrayedkeywords = ["transform"];


    constructor(query, params = {}) {
        if (!query) {
            this.#mode = "obj";
            return this;
        }
        
        this.#query = query;
        this.#querycnt = params.querycnt || Infinity;
        this.#finished = false;
        this.#start = performance.now();
        this.#curr = this.#start;
        this.#mode = "query";
    }

    #addduration(duration){
        this.#curr += duration;
    }


    #increment(){
        this.#counter++;
        return this.#counter;
    }

    #rmvani(id){
        this.#animations.get(id).cancel();
        this.#animations.delete(id);
    }

    #adjtime(time){ // for settimeout
        return time + this.#start - performance.now();
    }

    #addUnit(value, addition) {
        const regex = /^(-?\d*\.?\d+)([a-z%]*)$/i;
        const match = value.match(regex);

        if (!match) {
            throw new Error(`Invalid CSS value: ${value}`);
        }

        const [, num, unit] = match;
        const newValue = parseFloat(num) + addition;

        return `${newValue}${unit}`;
    }

    #queue(){

        while(this.#q.length > 0 && this.#q[0].time <= this.#curr){
            const curr = this.#q.shift();
            curr.callback();
        }

        if(this.#q.length == 0){
            this.#finished = true;
            return this;
        }

        this.#q.shift();
        return this;

    }

    #execute(obj){
        /* 
        if property in from not in to:
            set property to from
        if property in to not in from:
            animate property to go to to
        if property in both:
            animate property from -> to
            if additive:
                add from to current value, animate to to
        */
        const from = obj.from;
        const to = obj.to ;
        const forwards = obj.forwards;
        const additive = obj.additive;
        const duration = obj.duration;
        const easing = obj.easing;
  // for(const key in ani.to){
        //     if(this.#arrayedkeywords.includes(key)){
        //         if(!this.#anis.to.hasOwnProperty(key)){
        //             this.#anis.to[key] = [];
        //         }
        //         if(!this.#anis.from.hasOwnProperty(key)){
        //             // normally this would be additive but idk hwo to to that
        //             this.#anis.from[key] = [];
        //         }
        //         this.#anis.to[key].push(ani.to[key]);
        //         this.#anis.from[key].push(ani.from[key]);
        //         continue;
        //     }
        //     this.#anis.to[key] = ani.to[key];
        //     this.#anis.from[key] = ani.from[key];

        // }
        
        // // if something is unique to from, it is just changed from the current value
        // for(const key in ani.from){
        //     if(!this.#anis.from.hasOwnProperty(key)){
        //         this.#anis.from[key] = [];
        //     }
        //     else if(this.#anis.to.hasOwnProperty(key)){
        //         continue;
        //     }
        //     this.#anis.from[key].push(ani.from[key]);
        // }




        const elements = document.querySelectorAll(this.#query);
        elements.forEach((element) => {
            if(element.dataset.aniid){
                this.#rmvani(element.dataset.aniid);
            }
            const id = this.#increment();
            element.dataset.aniid = id;
            

        })


    }

    #addani(ani = {}){ /// for simul
        /**
         * anis:{
         *      from:{},
         *     to:{},
         * forwards: boolean,
         * 
         * duration: number,
         * easing: string
         * 
         * 
         * }
         */

        this.#anis.additive.push(ani.additive); // adds to "from", then goes to to, absolutely
        if(ani.forwards) this.#anis.forwards = ani.forwards;
        
        this.#anis.duration.push(ani.duration);
        this.#curr = max(this.#curr, ani.duration);
        this.#anis.easing.push(ani.easing);
        this.#anis.from.push(ani.from);
        this.#anis.to.push(ani.to);
        return;

    }

    
    simul(ani = new Ani()){
        if(this.#finished){
            // console.warn("Animation already finished");
            return this;
        }
        if(ani.#mode != "obj"){
            throw new Error("Invalid animation object");
        }
        const duration = ani.#curr;
        for(let i = 0; i < ani.#anis.additive.length; i++){
            this.#execute({from: ani.#anis.from[i], to: ani.#anis.to[i], forwards: ani.#anis.forwards, duration: ani.#anis.duration[i], easing: ani.#anis.easing[i]});
        }
        return this;

       
    }



    rule(obj = {}) {
        if(this.#finished){
            // console.warn("Animation already finished");
            return this;
        }
        const from = obj.from || {};
        const to = obj.to || from;
        const forwards = obj.forwards || false; // styles continue to next animation
        const additive = obj.additive || false; // styles added to curr styles
        const duration = obj.duration || 0;
        const easing = obj.easing || "linear";

        // const rules = {
        //     set:{},
        //     add:{},
        // };

      
        const ret = {
            from: from,
            to: to,
            forwards: forwards,
            additive: additive,
            duration: duration,
            easing: easing
        };
        

        if(this.#mode == "obj"){
            this.#addani(ret);
            return this;
        }
        else{
            return this.#execute(ret);
        }

       
    }

    rotate() {
        
    }

    colorchange() {
    }

    delay(time) {
        
    }

    then(callback, time = 0) {
        
    }


    done() {
      
    }

    finish(){
        this.#finished = true;
        return this;
    }

    execute() {
    }
       
}

