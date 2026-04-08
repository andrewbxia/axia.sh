
function completeegg(id){
    Egg.complete(id);
    alert(`yay! thanks for submitting!
        If we approve your submission, 
        you can come back tomorrow to submit your next journal entry!
        In the meanwhile, click the shiny egg to see your next objective :)`);
}

function makejournal(id, title = "placeholder egggo",){
    const journal = mk("form", {class: "journal"});
    const header = mktxt("h2", title);
    const desc = appmany(mk("label"), [
            mktxt("p", "1-2 sentences on what you've accomplished!"),
            mk("textarea", {name: "desc", placeholder: "i ate two potatoes today..."})
        ]
    );
    const screenshots = appmany(mk("label"), [
        mktxt("p", "upload screenshots of anything new you made!"),
        mk("input", {type: "file", name: "screenshots", accept: "image/*", multiple: true})
    ]);
    const submit = mktxt("button", "Submit", {type: "submit"});

    appmany(journal, [
        header, desc, screenshots, submit
    ]);

    journal.onsubmit = (e) => {
        e.preventDefault();
        // dont submit it, just mark egg as complete for now
        completeegg(id);
    }
    return journal;
}


//timer
const midnight = new Date();
midnight.setHours(23, 59, 59);
function timetilltom(){
    const now = new Date();
    const diff = midnight - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return {h, m, s};
}
function completedtoday(){
    return eq("button.egg.complete.active") !== null; // if complete and active we goog
}

class EggTracker{

    static #lskey = "coop-progress";
    static defaultid = 6;

    static progress = Array(12 + 1).fill(new Date(0));

    static init(){
        const get = ls.get(EggTracker.#lskey);
        if(!get){ // new user
            ls.set(EggTracker.#lskey, JSON.stringify(EggTracker.progress));
        }
        EggTracker.progress = JSON.parse(get);
    }

    
    static clear(){
        ls.rm(EggTracker.#lskey);
    }





}

class Egg{
    // leggo my eggo
    static #lskey = "coop-progress";
    static currid = EggTracker.defaultid; // 7...12
    el = null; // button element with bg egg
    #id = -1; // 7...12


    static complete(id){
        if(id !== Egg.currid) return;
        eq(`button.egg.${id}`).classList.add("complete");
        // eq(`button.egg.${id}`).classList.remove("active");
        // Egg.currid++;
        // eq(`button.egg.${Egg.currid}`).classList.add("active");
    }


    constructor(egg, id, content){
        this.el = egg;
        this.#id = id;

        egg.classList.add(`egg-${id}`);
        if(id == Egg.currid){
            egg.classList.add("active"); // curr egg today
        }
        else if(id < Egg.currid){ //&& id >= Egg.#defaultid){
            egg.classList.add("complete"); // already completed eggs
        }
        else{
            egg.classList.add("todo"); // future eggs
        }

        egg.onclick = () => {
            if(id > Egg.currid) {
                egg.blur();
                return alert("you havent unlocked this egg yet!");
            }
        }
    
        const inner = mk("div", {class: "inner"});
        if(journals[id] !== null)
            app(inner, journals[id]);
        egg.appendChild(inner);
        


    }

}

const eggelements = [...eqa("#carton button.egg")];
// randomize order
eggelements.sort(() => Math.random() - 0.5);
eggelements.splice(0, 0, null); // 1 index eggs

const eggs = [null];
const journals = [
    ...Array(5 - 0 + 1).fill(null), // 0 - 5
    // 6 -> login
    makejournal(
        6,
        "login",
    ),

    // 7 -> structure
    makejournal(
        7,
        "structure"
    ),

    // 8 -> style 1
    makejournal(
        8,
        "style 1"
    ),

    // 9 -> style 2
    makejournal(
        9,
        "style 2"
    ),

    // 10 -> feature 1
    makejournal(
        10,
        "feat 1"
    ),

    // 11 -> feat 2
    makejournal(
        11,
        "feat 2"
    ),

    // 12 -> feat 3
    makejournal(
        12,
        "feat 3"
    )
];

attachdebug(journals.length);

EggTracker.init();
for(let i = 1; i <= eggelements.length; i++){
    const egg = eggelements[i];
    egg.dataset.id = i;
    egg.innerText = `egg ${i}`;
    eggs.push(new Egg(egg, i, `egg ${i} content`));
}