

function makejournal(id, title = "placeholder egggo", needsjournal = true){
    const journal = mk("form", {class: "journal"});
    const header = mktxt("h3", "journal");
    const written = appmany(mk("label"), [
            mktxt("p", "1-2 sentences on what you've accomplished!"),
            mk("textarea", {name: "written", placeholder: "i ate two potatoes today..."})
        ]
    );
    const screenshots = appmany(mk("label"), [
        mktxt("p", "upload screenshots of anything new you made!"),
        mk("input", {type: "file", name: "screenshots", accept: "image/*", multiple: true})
    ]);
    const submit = mktxt("button", `submit journal!`, {onclick: `tracker.completequest("${title}")`, type: "button"});
    if(needsjournal)
        appmany(journal, [
            header, written, screenshots, submit
        ]);
    else{
        appmany(journal, [
            submit
        ]);
    }

    return journal;
}
function makequestscreen(title, desc, journal, extra = p()){
    const header = mktxt("h2", title);
    const description = mktxt("p", desc);
    const screen = mk("div", {class: "quest-screen"});
    appmany(screen, [
        header, description, extra, journal
    ]);
    return screen;
}

//timer

function getmidnight(date){
    date.setHours(23,59,59);
    return date;
}


function completedtoday(){
    return eq("button.egg.complete.active") !== null; // if complete and active we goog
}

const guides = [
    "../assets/guides/2-html1.pdf",
    "../assets/guides/3-css1.pdf",
    "../assets/guides/7-css2.pdf",
    "../assets/guides/4-js1.pdf",
];
const featureideas = [
    // 45-min to implement features
    "an easter egg triggered by the konami code!",
    "a cat photo gallery with your cat in the corner that people can click to pet!",
    "a blog page with a post or two",
    "an all-about-you section with fun tidbits and photos",
    "custom cursors that that you made the sprites for yourself",
    "an art gallery with interactive photos displaying extra info when clicked",
    "a music player that plays your fav songs",
    "a dark mode toggle that persists across sessions",
    "an animated background with parallax scrolling",
    "a pomodoro timer widget for productivity",
    "a status widget that shows your current mood with cute icons and text",
];
function randfeature(n) {
    const shuffled = featureideas.sort(() => 0.5 - Math.random()).slice(0, n);
    if(n === 1) return shuffled[0];
    return shuffled.slice(0, -1).join(", ") + ", or " + shuffled[n - 1];
}

class Quest{
    title = "none";
    journal = null;
    completed = -1;
    duedate = -1;
    elements = [];

    constructor(title, journal){
        this.title = title;
        this.journal = journal;
        this.completed = -1;
        this.duedate = -1;

        this.journal.onsubmit = (e) => {
            alert("ok")
            e.preventDefault();
        }
    }
    abletocomplete(){
        if(this.iscomplete) return false;
        if(this.title === "login") // first quest 
            return true;
        if(this.title === "structure") // second quest, can submit direclty after first
            return true;
        return this.duedate - Date.now() <= times.day;
    }
    assign(el){
        this.elements.push(el);
        if(this.iscomplete) el.classList.add("complete");
    }
    setelementsactive(){
        this.elements.forEach(el => {
            el.classList.add("complete");
        });
    }
    getjournal(){
        return this.journal.cloneNode(true);
    }
    get status(){
        return {
            title: this.title,
            completed: this.completed
        };
    }
    get iscomplete(){
        return this.completed !== -1;
    }
    complete(title){
        if(this.iscomplete){
            err("quest already competed");
            return;
        }
        this.completed = Date.now();
        this.setelementsactive();

    }

}
class Tracker{
    daysmissed = 0;
    startday = -1;
    progress = {};
    lskey = "ysws-egg-tracker";
    completed = false;
    static quests = {
        login: new Quest("login", 
            makequestscreen(
                "login",
                "login to Hack Club!",
                makejournal(1, "login", false)

            )
        ),
        structure: new Quest("structure", 
            makequestscreen(
                "structure",
                "create the basic structure of your homepage!",
                makejournal(6, "structure"),
                p(`<a href="${guides[0]}" target="_blank">a guide for getting into HTML!</a> `)
            )
        ),
        "style 1": new Quest("style1", 
            makequestscreen(
                "style 1",
                "add some juicy styling to your homepage! make it pop! get creative :)",
                makejournal(7, "style 1"),
                p(`<a href="${guides[1]}" target="_blank">a guide for getting into CSS!</a>`)
            )
        ),
        "style 2": new Quest("style2", 
            makequestscreen(
                "style 2",
                "add some more styling to your homepage! with some fresh eyes, make it look even more awesomer!",
                makejournal(8, "style 2"),
                p(`<a href="${guides[2]}" target="_blank">a guide for getting into more CSS!</a>`)
            )
        ),
        "feat 1": new Quest("feat1", 
            makequestscreen(
                "feat 1",
                `add a new feature to your homepage! it can be anything you want! make sure it follows the <a href="#guidelines">guidelines</a> for qualifying as meaningful work! some ideas: a ${randfeature(3)}!`,
                makejournal(9, "feat 1")),
                p(`Extra: an <a href="${guides[3]}" target="_blank">optional guide for getting into javascript</a>, which can bring your site alive with interactivity!`),
        ),
        "feat 2": new Quest("feat2", 
            makequestscreen(
                "feat 2",
                `add another new feature to your homepage! make sure it follows the <a href="#guidelines">guidelines</a> for qualifying as meaningful work! it can be anything you want! some ideas: a ${randfeature(3)}!`,
                makejournal(10, "feat 2"),
            )
        ),
            
        "feat 3": new Quest("feat3", 
            makequestscreen(
                "feat 3",
                `add one more new feature to your homepage! make sure it follows the <a href="#guidelines">guidelines</a> for qualifying as meaningful work! it can be anything you want! some ideas: a ${randfeature(3)}!`,
                makejournal(11, "feat 3")),
        ),
        "feat 4": new Quest("feat4", 
            makequestscreen(
                "feat 4",
                `add one last feature to your homepage! make sure it follows the <a href="#guidelines">guidelines</a> for qualifying as meaningful work! it can be anything you want! some ideas: a ${randfeature(3)}!`,
                makejournal(12, "feat 4")
            )
        ),
    };
    static questorder = Object.keys(Tracker.quests);
    static questduedates = {
        login: 0,
        structure: 1,
        "style 1": 2,
        "style 2": 3,
        "feat 1": 4,
        "feat 2": 5,
        "feat 3": 6,
        "feat 4": 7,
    };
    static timeinterval = 100;
    interval = -1;

    checkjustcompleted(){
        if(this.completed) return false;
        this.completed = this.currquest() === Tracker.questorder.length;
        return this.completed;
    }
    celebrateifcomplete(){
        if(this.checkjustcompleted()){
            clearInterval(this.interval);
            if(this.daysmissed <= 1){
                alert(`WOOP WOOP YEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA YOU DID IT OMG WOWWWWWW NICCEEEEEEE

                    ok now go publish on github and post it in the slack for us to review and stuff idk this is all very WIP!
                    You also qualify for the extra sticker and $20 in total by keeping up the streak! yay!
                    
                    `);
            }
            else{
                alert(`WOOP WOOP YER DID IT!!!

                    ok now go publish on github and post in the slack and stuff for your 15$ domain grant!! yay!
                    
                    `)
            }
            return true;
        }
        return false;
    }

    currquest(){
        let q = 0;
        let title = "";
        while(q < Tracker.questorder.length){
            title = Tracker.questorder[q];
            if(!Tracker.quests[title].iscomplete){
                return q;
            }
            q++;
        }
        return q;
    }

    clearprogress(){
        ls.rm(this.lskey);
    }
    fetchprogress(){
        return JSON.parse(ls.get(this.lskey));
    }

    completequest(title){
        const questtitle = Tracker.questorder[this.currquest()];
        const quest = Tracker.quests[questtitle];
        if(Tracker.questorder[this.currquest()] !== title){
            alert(`cant submit this journal right now! These materials are likely for submitting to the ${numsuffix(1 + eggquestnames.indexOf((
                Tracker.questorder[this.currquest()])))} egg instead!`)
            return;
        }


        
        if(!quest.abletocomplete()){
            // not due yet
            alert(`
                woa! slow down there! you can only submit this egg in ${datestr(dateto(quest.duedate - Date.now() - times.day, "day", 1, 0))}!`);
            return;
        }
        Tracker.quests[title].complete(title);
        const timepast = Tracker.quests[title].duedate - Date.now();
        this.setprogress(title);


        if(this.interval === -1) return; // tracker not start yet, preload
        if(timepast < 0){
            //late :(
            const daysmissed = ceil(-timepast / (24 * times.hour));
            this.skiptime(-daysmissed * 24 * times.hour); // delay next eggs by n days

            this.daysmissed += daysmissed;
            // only 1 day missed so far
            if(this.daysmissed <= 1){
                alert(`
                    Looks like you missed a day! Don't worry, it's great that you submitted, and you can still qualify for the extra goodies if you keep up the streak from now on! :)
                    `);

            }
            // missed more than one
            else{
                alert(`
                    Uh oh! looks like you've missed more than a day in total! Dont worry, if you continue until the end and fill the carton, you can still qualify for the $15 for a great domain!
                    `);
            }

        }
        else{
            //ontime
        alert(`yay! thanks for submitting!
            If we approve your submission, 
            you can come back tomorrow to submit your next journal entry!
            In the meanwhile, click the next egg to view tomorrow's objective :)`);
        }

    }

    setprogress(title){
        const quest = Tracker.quests[title];
        this.progress[title] = quest.status;
        if(this.startday === -1 && quest.iscomplete){ // havent started yet 
            this.startday = quest.completed;
            this.start();
        }
        this.saveprogress();
    }
    setallprogress(){
        Tracker.questorder.forEach(title => {
            this.setprogress(title);
        });
    }

    saveprogress(){
        const stats = {
            daysmissed: this.daysmissed,
            progress: this.progress,
            startday: this.startday,
        }
        ls.set(this.lskey, JSON.stringify(stats));
    }

    init(){
        // fetch data from ls
        if(ls.get(this.lskey)){
            const save = this.fetchprogress();
            this.progress = save.progress;
            this.daysmissed = save.daysmissed;
            this.startday = save.startday;
        }
        else
            // new user
            this.setallprogress();
        this.saveprogress();
        // update quests with progress data
        log(this.progress);
        Tracker.questorder.forEach(title => {
            if(this.progress[title].completed !== -1){
                this.completequest(title);
            }
        });

        //start tracker if already started
        this.startday = min(this.startday, this.progress[Tracker.questorder[0]].completed);
        if(this.startday !== -1){
            this.start();
        }
        else{
            //make furst eggs active 
            Tracker.quests[Tracker.questorder[0]].elements.forEach(egg => egg.classList.add("active"));
        }
    }

    start(){
        if(this.interval !== -1) {
            return;
        }
        // set startday if not yet
        if(this.startday === -1){

        }


        // set due dates for quest
        Tracker.questorder.forEach(title => {
            const quest = Tracker.quests[title];
            if(quest.duedate !== -1) return; // already set by prev completion
            log("fsdlkj")
            const startdaymidnight = getmidnight(new Date(this.startday));
            const offsetdays = (this.daysmissed + Tracker.questduedates[title]);
            startdaymidnight.setDate(startdaymidnight.getDate() + offsetdays);
            quest.duedate = startdaymidnight.getTime();
        });


        this.interval = setInterval(() => {
            this.loop();
        }, Tracker.timeinterval);
    }

    loop(){
        // begin startday, start update loop
        // attachdebug(perf.now);

        // check completion
        this.celebrateifcomplete();
        if(this.completed){
            clearInterval(this.interval);
        }

        const currquesttitle = Tracker.questorder[this.currquest()];
        let hasoverdue = false; let hasactive = false;
        Tracker.questorder.forEach(title => {
            // check progress var
            // set all completed eggs as 'complete' class
            const quest = Tracker.quests[title];
            const completed = quest.iscomplete;
            const active = currquesttitle === title;

            if(completed){
                // alr. handled by egg.assign
                // return;
            }

            //set curr egg as 'active' class
            quest.elements.forEach(egg => {
                if(active && !completed && quest.abletocomplete()){
                    egg.classList.add("active");
                    hasactive = true;
                }
                else egg.classList.remove("active");
            });

            // set all uncompleted eggs (including current) as attr(data-todo)
            const hoursto = dateto(new Date(quest.duedate), "day", 1);
            const overdue = hoursto[0] < 0 && !completed;
            if(overdue) hoursto[0] = -hoursto[0];
            hasoverdue = hasoverdue || overdue;
            const todostr = datestr(hoursto);

            quest.elements.forEach(egg => {
                egg.dataset.todo = todostr;
                if(overdue){
                    egg.classList.add("overdue");
                    egg.dataset.todo = `overdue by ${todostr}!`;
                }
                else
                    egg.classList.remove("overdue");
            });
        });
        // update streak content
        eid("streak").innerText = `
            Day ${this.currquest()} of 7!
        `;
        // timer stuff
        eid("timer").classList.remove("active");
        eid("timer").classList.remove("overdue");
        if(hasoverdue){
            eid("timer").innerText = "you have overdue journals!";
            eid("timer").classList.add("overdue");
        }
        else if(hasactive){
            const currquest = Tracker.quests[currquesttitle];
            const hoursto = dateto(new Date(currquest.duedate), "day", 1);
            eid("timer").innerText = `Submit your next journal by midnight! You havwe ${datestr(hoursto)} left!`;
            eid("timer").classList.add("active");
        }
        else{
            eid("timer").innerText = `Yayy! Great work! Submit your next journal tomorrow!`;
        }

        
    }
    skiptime(t){
        Tracker.questorder.forEach(title => {
            const quest = Tracker.quests[title];
            quest.duedate -= t;
        });
        this.startday -= t;
        this.saveprogress();
    }
}
class Egg{
    title = "none";
    eggel = null;

    constructor(eggel, title){
        this.eggel = eggel;
        this.title = title;

        app(eggel.querySelector(".inner"), Tracker.quests[title].getjournal());


    }
}

// --------------
const rows = [eq("#carton > .back >.eggs"), eq("#carton >.mid >.eggs")];
const eggcolors = ["brown", "white", "blue"];
const eggprobs = new WeightedChoices(eggcolors, [
    1, 1, 1.25
]);
const eggels = [], eggs = [];

for(let row = 0; row < 2; row++){
    for(let i = 0; i < 6; i++){
        const id = row * 6 + i;
        assert(eggels.length === id, `id mismatch: ${id}, ${eggels.length}`);
        const egg = mk("button", {class: `egg egg-${id} ${eggprobs.choose()}`});
        appmany(egg, [
            div({class: "status"}),
            div({class: "inner"})
        ]);
       
        app(rows[row], egg);
        eggels.push(egg);
    }
}
assert(eggels.length === 12, "what");


const eggquestnames = [
    ...Array(5).fill("login"),
    "structure",
    "style 1",
    "style 2",
    "feat 1",
    "feat 2",
    "feat 3",
    "feat 4",
];

function ondozen(func = nofunc, ...args){
    for(let id = 0; id < eggels.length; id++){
        func(eggels[id], id, ...args);
    }
}
ondozen((eggel, id) => {
    eggs.push(new Egg(eggel, eggquestnames[id]));
});

const tracker = new Tracker();
// if(debug)
    // tracker.clearprogress();
Tracker.quests["login"].duedate = Infinity; // first step, can submit anytime

ondozen((eggel, id) => {
    Tracker.quests[eggquestnames[id]].assign(eggel);
});
tracker.init();
//preload w/ idea
eid('idea').innerText = `new idea: ${randfeature(1)}`;


