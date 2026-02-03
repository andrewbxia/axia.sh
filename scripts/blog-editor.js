// ok ill be honest this code kinda sucks too but its my first time doing this kidna thing so cut me some slack

const samplepost = `
<!--
<h1>Sample Blog Post</h1>
<h2>Introduction</h2>
<p>This is a sample blog post to demonstrate various HTML tags.</p>
<h2>Content</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <abbr title="Hypertext Markup Language">HTML</abbr> is the standard markup language for creating web pages.</p>
<h3>Subheading</h3>
<p>Here is a list of items:</p>
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>
<p>Here is a link to <a href="https://www.example.com">example.com</a>.</p>
<h2>Conclusion</h2>
<p>Thank you for reading this sample post. Feel free to use these tags in your own posts.</p>
<ol class="footnote-list">
    <li> This is a footnote.</li>
    <li> This is another footnote.</li>
    <li> This is a third footnote.</li>
</ol>

-->`;




let slider = null;
let dragging = false;
const editorcntid = "blog-writing";
const mainid = "main";
const inscontent = "blog-content";
const editorid = "blog-editor";
const savekeyword = "lastsave";
const savelimit = 10000;
const savemeter = new MeteredPatientTrigger(savelimit, () => autosave());
const savestatusmeter = new MeteredTrigger(33, () => savestatus());
let prevwidths = [0, 0];
const editorhtml = `
<section id="${editorcntid}">
    <div id="${editorid}"></div>
</section>
<div id="slider"></div>
`;
// const slider = eid("slider");
// params already defined

function resetsavedata(method){
    if(!savedata[method]) return new Error("method not found");
    if(!confirm(`reset ${method} data? it has: ${savedata[method]}`)) return;
    savedata[method] = defsavedata[method];
    localStorage.setItem(savekeyword, JSON.stringify(savedata));
}
function beaut(){
    if(!editor) return;
    setTimeout(() => 
            beautify.beautify(editor.session)
    
    ,100);
}

function savestatus(){
    if(!saved){
        eid("save-status").innerText = `saving...(${savelimit - (perf.now() - savemeter.getrecent())}ms)`;
    }
    else if(parseInt(lastsave) > perf.now() - savelimit){
        eid("save-status").innerText = "saved!";
    }
    else{
        eid("save-status").innerText = `saved! ${((perf.now() - lastsave)/1000).toFixed(2)}s ago`;
    }

}
const defsavedata = {
    drafts: {},
    ids: [],
    lastsave: null,
}
const savedata = localStorage.getItem(savekeyword) ? JSON.parse(localStorage.getItem(savekeyword)) : defsavedata;
const editmode = {method: "lastsave", id: -1};
let draftsaveidx = -1;
let lastsave = perf.now();
let writingid = null;
let editing = false;
let loadlastsave = false;
let saved = true;
let preload = "";
let beautify = null;
let editor = null;
const blogtemplate = generatepost({}).innerHTML + samplepost;
function geteditorspace(){
    return eid("post-" + writingid);
}

function addblankpost(){
    writingid = 0;
    log(writingid);
    eid("blog").prepend(mk("article", {class: "post", id: `post-${writingid}`, "data-id": writingid}));
    eid(`post-${writingid}`).innerHTML = preload || samplepost;
}

function editpost(fetchid){
    editmode.id = fetchid;
    writingid = fetchid;
    editmode.method = "id";
    getpost(fetchid).then(post => {
        if(post.length === 0){
            preload = blogtemplate;
            alert("post not found");
        }
        else{
            preload = generatepost(post[0]).innerHTML;
            eid(mainid).dispatchEvent(new Event("loadpost"));
        }
        eid(`post-${writingid}`).innerHTML = preload;
    });
}

function editdraft(draftid){
    editmode.id = draftid;
    editmode.method = "drafts";
    if(savedata.drafts[draftid] !== undefined){
        preload = savedata.drafts[draftid];
    }
    else{
        alert("draft not found");
        preload = blogtemplate;
    }
}

function enterpage(){
    const responses = [];
    if(savedata.lastsave !== null){
        responses.push(prompt(
            `${savedata.lastsave} \n load last save? 
            (nothing for yes, type 'draft' for draft selection, number for article id, anything else for no)`));
    }
    else responses.push("");
    if(responses[0] === "draft"){
        let resp = "";
        while(!isnum(pint(resp))){
            resp = prompt(`drafts: ${Object.keys(savedata.drafts)} \n select draft id`);
        }
        responses.push(resp);
        editmode.id = responses[1]; // let be string
        editdraft(editmode.id);
        
    }
    else if(isnum(pint(responses[0]))){
        const fetchid = pint(responses[0]);
        editpost(fetchid);
    }
    else if (responses[0] === ""){
        preload = savedata.lastsave;
        return;
    }
    else{
        preload = blogtemplate;
        editmode.method = "lastsave";
    }
}



function setupsave(){
    if(!localStorage.getItem(savekeyword)){
        localStorage.setItem(savekeyword, JSON.stringify(savedata));
    }
}


/* 
blog save data method
const savedata = {
    drafts: [],
    ids: [],
    lastsave: null,
}
edit-mode: {method: "last", id: -1}
automatically save in "last", not as edit-mode tho
when enter page{
	ask to add in last
	
	if nothing selected do last, 
	if draft selected print out drafts and ask selection id
	if id number selected fetch it from blog
	
	if nothing set edit-mode as its default value

	if draft or id do {method: "draft/id", id: id}

}

when exit page or switch to new post to edit or ctrl s{

	ask to save as edit-mode, if yes return

	ask to either save as draft{
		ask if new draft or overwrite draft #

	}
	if id inputted{
		if id inputted exists warn but go with it
		if new id inputted cool beans
	}
	if nothing inputted save as last but warn
}*/
function savework(){

    const resps = [];
    resps.push(confirm(`save as ${JSON.stringify(editmode)}?`));
    if(resps[0]){
        if(editmode.method === "lastsave")
            savedata[editmode.method] = geteditorspace().innerHTML;
        else
            savedata[editmode.method][editmode.id] = geteditorspace().innerHTML;
    }
    else{
        let resp = "";
        while(resp !== "draft" && !isnum(pint(resp))){
            resp = prompt(`save as draft or id? (type 'draft' for draft selection, number for article id), curr mode: ${JSON.stringify(editmode)}`);
        }
        resps.push(resp);
        if(resp === "draft"){
            resp = "";
            resp = prompt(`new draft or overwrite draft? (type anything for new draft, number for spec. draft id (max <=${savedata.drafts.length})`, editmode.id);
            let draftsavingidx = resp;

            // draftsavingidx = savedata.drafts.length;

            if(savedata.drafts[draftsavingidx]){
                if(!confirm(`draft ${draftsavingidx} exists, overwriting, ye or ne`)){
                    alert("draft not saved");
                    return;
                }
            }
            savedata.drafts[draftsavingidx] = geteditorspace().innerHTML;
        }
        else{
            let id = pint(resp);
            if(id > lastpostid + 1){
                alert("post not found, saving as new");
            }
            id = min(id, lastpostid + 1);
            savedata.ids[id] = geteditorspace().innerHTML;
        }
    }


    autosave();
}
function autosave(){
    savedata.lastsave = geteditorspace().innerHTML;
    localStorage.setItem(savekeyword, JSON.stringify(savedata));
    // todo: save as json of seperate blog ids and then a save system for drafts (save1, save2, yatta yatta)
    // find way to edit individual article elements
    saved = true;
    lastsave = perf.now();
    log(`saved ${lastsave}`);
}
if (params.has("b-edit")){
    setInterval(() => savestatusmeter.fire(), 50);

    editing = true;
    eid(mainid).style.width = "100%";
    const p_aceurls = [
        "./scripts/ace-min-noconflict/ace.js"];
    const aceurls = [
        "./scripts/ace-min-noconflict/ext-language_tools.js",
        "./scripts/ace-min-noconflict/ext-spellcheck.js",
        "./scripts/ace-min-noconflict/ext-beautify.js"
    ];

    let numloaded = 0;

    // eid(mainid).innerHTML = editorhtml + eid(mainid).innerHTML;
    // console.log(eid(mainid).innerHTML);
    eid("page-left").innerHTML = editorhtml;
    eqa("main, #page-left, #page-right, #page, #demark-bar, .track, #cd-player")
        .forEach((el) => el.classList.add("editing"));
    slider = eid("slider");
    slider.addEventListener("mousedown", (event) => {
        dragging = true;
        prevwidths = [event.clientX, eid(editorcntid).offsetWidth];
        slider.classList.add("grab");
    });

    const mainwidth = pint(docprop("--main-width"));
    const extrawidth = 5*2 + 15; // 5 padding 15 slider width
    
    document.addEventListener("mousemove", (event) => {
        if (dragging) {
            let newwidth = (event.clientX - prevwidths[0]) + prevwidths[1];
            if(abs(mainwidth + newwidth + extrawidth - eid("page").clientWidth) < 15) 
                newwidth = eid("page").clientWidth - mainwidth - extrawidth;
            eid(editorcntid).style.width = `${newwidth}px`;
        }
        window.dispatchEvent(new Event("resize"));
    });
    
    document.addEventListener("mouseup", () => {
        dragging = false;
        slider.classList.remove("grab");
    });

    style("/styles/blog-editor.css");

    p_aceurls.forEach(url =>{
        const script = document.createElement("script");
        script.src = url;
        script.onload = () =>{
            numloaded++;
            if(numloaded === p_aceurls.length){
                numloaded = 0;
                aceurls.forEach(url =>{
                    const script = document.createElement("script");
                    script.src = url;
                    script.onload = () =>{
                        numloaded++;
                        if(numloaded === aceurls.length){
                            initediting();   
                        }
                    };
                    document.head.appendChild(script);
                });
            }
        };
        document.head.appendChild(script);
    });

    
}
function initediting() {
    log("init editigin");
    setupsave();
    enterpage();

    ace.require("ace/ext/language_tools");
    ace.require("ace/ext/spellcheck");
    beautify = ace.require("ace/ext/beautify");
    editor = ace.edit("blog-editor");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        useSoftTabs: true,
        fontSize: "1rem",
        spellcheck: true,
        tabSize: 8,
        wrap: true,
    });
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/html");

    if(editmode.method === "lastsave"){
        loadlastsave = true;
        addblankpost();
        writingid = 0;
    }
    else if(editmode.method === "drafts"){
        addblankpost();
    }
    else if(editmode.method === "id"){
    }
    editor.setValue(preload);

    eid(`post-${writingid}`).innerHTML = editor.getValue();

    const doc = editor.session.getDocument();
    beaut();

    log("editor loaded");
    eid(mainid).addEventListener("loadpost", () => {
        if(editmode.method === "id")
            editor.setValue(preload);
        beaut();
    });
    doc.on("change", () => {
        if(!eid(`post-${writingid}`)) return;
        eid(`post-${writingid}`).innerHTML = editor.getValue();
        
        saved = false;
        savemeter.fire();
    });

    // extra commands curated by chatgpt :)
    editor.commands.addCommand({
        name: "instBrEnter",
        bindKey: { win: "Ctrl+Enter" },
        exec: function(editor) {
            const session = editor.getSession();
            const cursor = editor.getCursorPosition();
            const line = session.getLine(cursor.row);
            const indentation = line.match(/^\s*/)[0]; // get leading whitespace
            editor.insert(`\n${indentation}<br>\n${indentation}`);
        }
    });
    document.addEventListener("keydown", (event) => {
        if(event.ctrlKey && event.key === 's'){
            event.preventDefault();
            savework();
            alert("saved!");
        }
    });

    document.addEventListener("dblclick", (event) => {
        const el = event.target;
        if(el.matches("article.post *")){
            const article = el.closest("article.post");
            log(el, article)
            const id = pint(article.dataset.id);
            if(confirm(`load this post (${id})?`)){
                editor.setValue(article.innerHTML);
                writingid = article.dataset.id;
                editpost(writingid);
                beaut();
            }
        }
    });
    
}


window.addEventListener("beforeunload", (event) => {
    if(editing && !saved){
        
        event.returnValue = "SAVE SAVE SAVE";
        return "SAVE SAVE SAVE";
    }
});