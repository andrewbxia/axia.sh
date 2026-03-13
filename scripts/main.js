"use strict";
// attachdebug("hi");

// hi debugger if its saturday for you rn u get a cookie
// i explicitly state where in this code chatgpt was used n stuffies
// init funcs
KeySet.init();
checkvisit();
document.addEventListener("visitorstats", () => {
    eq("#visitor-stats span.total").innerText = visitorstats.visitor_count;
    eq("#visitor-stats span.unique").innerText = visitorstats.visitor_unique;
    const visitorid = pint(ls.get("visitorid"));
    log("visitorid", visitorid);
    if(visitorid){
        eq("#visitor-stats span.unique").setAttribute("data-hover", `(ur the ${numsuffix(visitorid)}!)`);
    }
    else{
        // huh
        ls.rm("lastvisit");
    }
});
assert(eqa("main").length <= 1, "more than 1 main tag thingy!");
// attachdebug(
//     "fix2str",
//     benchmark(fix2str, rand, 1000),
//     "fix2num: ",
//     benchmark(fix2num, rand, 1000),
// );

// REJECT CAMEL CASE
FpsMeter.init();
KeySetSide.init();

const containerlimiterid = "page";
ScrollProgress.init(containerlimiterid);
ThemeSwitch.init(() => {
    togglewcb();
}, "var(--header-height)");


// branding visuals
//document.title = baseurl; // later have this textanimate based on branding activeq
const axia = eid("branding"), 
    axiatxt = minurl + "·∫:p_d_", 
    axialen = axiatxt.length;
    // "axia.sh"
// const axiachstyle = styling(`
//     .b-ch{
//         font-size: ${1000/axialen}%;
//     }
//     `);
axia.innerText = "";

for(let i = 0; i < axialen; i++){
    app(axia, mktxt("span", axiatxt[i], {class: "b-ch", id: "b-ch-"+i}));
}
window.addEventListener("resize", () => {
    axia.style.fontSize = `${axia.clientWidth * 1.5 / axialen}px`;
});
window.dispatchEvent(new Event("resize"));


const bsplash = new RollingActives(axia, "active-100");
styling(`
#branding>span.b-ch{
    ${Array.from({length: 20}, (_, i) => `
        &.active-${(i + 1) * 10}{
            &::before{
                height: ${10 * (i + 2)}%;
            }
            &::after{
                bottom: ${100 - (i + 2) * 10}%;
                height: ${max(6, (i + 1) * .6)}px;
            }
        }
    `).reverse().join('')}
}
`);

axia.childNodes.forEach((el, idx) => {
    el.addEventListener("mouseover", () => {
        bsplash.set([idx], 0, 125);
    });
});
axia.addEventListener("click", (e) => {
    const el = e.target.closest("span.b-ch");
    if(!el)return;
    const idx = pint(el.id.substring("b-ch-".length));
    el.classList.add("active-40");
    setTimeout(() => {
        el.classList.remove("active-40");
    }, 100);
    bsplash.pass({reverse: 0, nucleationsites: 1, start: min(axialen, idx + 1), delay: 60, decay: 100});
    bsplash.pass({reverse: 1, nucleationsites: 1, start: max(0, idx - 1),       delay: 60, decay: 100});
});


const bsplashrand = new WeightedChoices([
    [() => max(bsplash.pass({reverse: 0}), bsplash.pass({reverse: 1})), 2],
    [() => max(bsplash.pass({reverse: 1, nucleationsites: 1, delay: 370}),
        bsplash.pass({reverse: 0, nucleationsites: 1, delay: 370})), 1],
]);

function playbsplash() {
    if(!axia.matches(":hover")){
        const t = bsplashrand.spinthelottery()();
        setTimeout(() => {
            playbsplash();
        }, t + 10 * randint(700, 300));
    }
    else{
        setTimeout(playbsplash, 1000);
    }
}
setTimeout(() => {
    playbsplash();
}, randint(7000,3000));

const isay = eid("i-say");
const status = eid("status");
const statshade = eq(".speech-bubble > .bubble-shade");
const statbubble = eq(".speech-bubble > .bubble");
const statcover = eq(".delay-cover > .bubble-cover");
const statspeed = 50;



function statusshade(){
    const temp = mktxt("template", statbubble.innerHTML);
    temp.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));

    statshade.innerHTML = temp.innerHTML;
    // statcover.innerHTML = temp.innerHTML;
    

    statcover.style.setProperty("--c-height", `${statbubble.offsetHeight * .5}px`);
    setvar(isay, "bubble-ah", `${status.offsetHeight}px`);
    // attachdebug(status.offsetHeight)

}

function statusiter(stattxt, ref, idx){
    if(!ref) {
        return;
    }
    let statstr = stattxt.substring(0, idx);
    while(statstr.length < stattxt.length){
        if(stattxt[statstr.length] === " ")
            statstr += " ";
        else
            statstr += String.fromCharCode(randint(126-33, 33));
    }

    ref.textContent = statstr;
    // statusshade();

    if(!(idx > stattxt.length))
        setTimeout(() => {
            statusiter(stattxt, ref, idx + round(rand() + 0.3));
        }, statspeed);
        // attachdebug(idx, stattxt.length, stattxt.substring(0, idx), stattxt);
    // return perf.now;

}
const nonestat = {title: "", date: 0, status: ""};
const loadstat = {title: "loading", date: new Date() - 3.14159 * 1000, status: "fetching status..."};

async function setstatus(sid = 0){
    let stat = loadstat;
    if(sid < 0)
        stat = loadstat;
    else{
        setstatus(-1); // loading
        stat = await getstatus(sid);
    }
    const daysago = dateago(new Date(stat.date), "day", 2);
    const info = div({id: "status-info", style: "margin-bottom: 1rem;"});

    let titlestr = stat.title;
    if(asc(0, stat.title.length, 16)){
        titlestr = `__${stat.title}__`;
    }
    
    const title = h3(titlestr, {style: "margin-bottom: .125rem;"});
    const stattxt = p(stat.status);
    const ago = h6(`${fix2num(daysago[0], 1)} ${daysago[1]}s ago...`);

    // appending things
    status.innerHTML = "";
    appmany(info, [title, ago]);

    if(stat.title.length > 0)
        appmany(status, [info, stattxt]);
    else
        appmany(status, [stattxt, info]);
    statusshade();

    // status effect
    if(sid === -1) return;
    const walker = document.createTreeWalker(
        stattxt , 
        NodeFilter.SHOW_TEXT, 
        null, 
        false
    );
    const txtnodes = [];
    while(walker.nextNode()) {
        txtnodes.push(walker.currentNode);
    }
    let currtime = 0;
    for(const txtnode of txtnodes){
        const txtfart = txtnode.textContent;
        const txt = txtfart; // copy
        txtnode.textContent = "";
        setTimeout(() => {
            statusiter(txt, txtnode, 0);
        }, currtime);
        currtime += txt.length * statspeed + randint(50, 50);

    }

}

statusshade();
setstatus();

async function randstatus(){
    setstatus(randint(pow(2, 16)));
}

let currretryani = new Animation();
let currretryrot = 0, retryrotadd = 0;
let retryrotok = true;

statcover.addEventListener("click", (e) => {
    const retrysvg = statcover.querySelector("svg");
    if(retryrotok){ // animation ended
        currretryrot = compst(retrysvg).rotate;
        retryrotadd = 0;
    }
    retryrotadd += 360;
    retryrotok = false;
    const currrotate = compst(retrysvg).rotate;
    const newrotate = `${poat(currrotate) + retryrotadd}deg`;
    currretryani.cancel();
    currretryani = retrysvg.animate(
        [

            {offset: 0, rotate: currrotate, easing: "ease-out"},
            {offset: 0.4, rotate: newrotate, easing: docprop("--ease-more-in-out")},
            {rotate: currretryrot, easing: "ease-in"}
        ],

        {
            duration: 1500 * sqrt(retryrotadd / 360),
        }
    );

    statcover.classList.add("active");

    currretryani.finished.then(() => {
        attachdebug(perf.now);
        retryrotok = true;
        statcover.classList.remove("active");
    })
    .catch(nofunc);
});

document.addEventListener("click", (e) => {
    attachdebug(e.target.tagName, e.target.cloneNode(false).outerHTML);
});

function togglewcb(){
    if(thememode === "dark")
        eid("wcb").classList.add("wcb-d");
    else
        eid("wcb").classList.remove("wcb-d");
}
togglewcb();


const barsizealert = () => {
    // if(pxlheight / window.innerHeight < 0.75){
    if(false){
        alert(`
            hi! thanks for checking out my site :)\n
            with some browsers like firefox, the nifty background effect you see here may get pretty laggy when you zoom out a lot since they dont handle zoomed-out vw-scaled elements well, 
            however with chrome-based you shouldnt be too worried!\n
            also if its pretty laggy even at normal zoom, just like zoom in more to mask my bad coding :p (i really tried)\n
            ok thats it have fun!
                        ~~ andrew`);
        ls.set("barsizealert", "1");
        window.removeEventListener("resize", barsizealert);
    }
};
if(ls.get("barsizealert") !== "1"){
    window.addEventListener("resize", barsizealert);
}
function clearbarsizealert(){
    ls.rm("barsizealert");
}






// once everything is loaded
// document.addEventListener("DOMContentLoaded", () => {
BGBars.init();
document.addEventListener("blogloaded", () => {
    if(BGBars.barsfired > 0) return;
    window.addEventListener("scroll", () => {
        const comparing = eid(containerlimiterid).offsetHeight;
        const limiting = eid(containerlimiterid).offsetHeight;
        BGBars.fire(
            comparing, limiting,
        );
    });
    window.dispatchEvent(new Event("scroll"));
});


const baseartzlink = "../assets/imgs/artz/";

// have fun seeing the art i commented out
// todo: maybe make this handle n images instead of 4 with programatic css
const artzinfo = [
    // ["IMG_1106.jpg", `old ahh 60 second portrait of me`],
    ["IMG_1366.webp", `old doodle for irl friend madeleine !!`],
    ["IMG_1378.webp", `ORIIIIIIIIIIIIIIIIIIII`],
    ["IMG_1698.webp", `${linkhtml("https://www.youtube.com/@RandomCatOnRoblox", "randomcat")} 
        fanart while i still thought he was cool`],
    ["IMG_1795.webp", `rainstorm sh4rk doodle (saltwater boi)`],
    ["IMG_1853.webp", `half shitty merc fleet doodle half learning impact frames 
        (i think the gun is pretty cool beans tho)`],
    ["IMG_1861.webp", `yveltal slurp(ee)`],
    ["IMG_2119.webp", `vandalizing my own 
        <i>${linkhtml(baseartzlink + "IMG_2119_og.webp", "vandalized",{title: "trust me"})}</i> 
        ap chem booklet (jk thx alx and rachel i like it lol)`],
    // ["IMG_2231.jpg", `christmas doodle 4 online kiddos`],
    ["IMG_2380.webp", `ap chemistry collab`],
    ["IMG_2000.webp", `my first dip into digital art (god why didnt i use any blending for the lighting lol),
         birthday piece done for online friend`],
    ["plutonium.webp", `did a bunch of the pixel art on ${
        linkhtml("https://wplace.live/?lat=35.85735782205856&lng=-106.30502962822266&zoom=16.18", 
            " the wplace periodic table at los alamos!"
        )
    } I think I like doing pixel art now :p`],
    ["miao_sticker.webp", `printed out a bunch of stickers of a cat I drew in roblox spray paint like 2 years ago lmao, 
        here's the proof ${linkhtml("https://stickermule.com", "StickerMule")} sent me`],
    ["IMG_2954.webp", `just bought acryllic markers and cooked on the BOOom`],
    ["sewh_shark.webp", `played ${linkhtml("https://sewh.miraheze.org/wiki/Main_Page",
        'S.E.W.H.'
    )} and liked it a lot! ${linkhtml("https://joeylent.dev/", 
        "Joey")} told me to add the (poorly drawn) blahaj lol`],
    ["IMG_3150.webp", `scuffed yveltal planner doodle ! !`],
    ["IMG_3151.webp", `other scuffed planner doodle`],
    ["IMG_3385.webp", `random physics doodle (i dont smoke irl dont worry)`],

    // "IMG_.jpg",
    // "IMG_.jpg",
    // "IMG_.jpg",
    // "IMG_.jpg",
];

artzinfo.sort(() => chance(2)); // big brain

// Configuration: number of images per track (can be changed to any value)
const numImages = 4;

// Generate direction names dynamically
const dirs = Array.from({length: numImages}, (_, i) => `side-${i}`);

// Generate position offsets for animation delay
// Creates a pattern that staggers the animation timing
// For cnt=8: produces [0, 4, 1, 5, 2, 6, 3, 7] - alternates between first and second half
function generateposs(cnt){
    const poss = [];
    const half = Math.floor(cnt / 2);
    for(let i = 0; i < cnt; i++){
        // Alternate pattern: 0, half, half+1, 1, half+2, 2, etc.
        if(i % 2 === 0){
            poss.push(i / 2);
        } else {
            poss.push(half + Math.floor(i / 2));
        }
    }
    return poss;
}

const poss = generateposs(numImages * 2);
const imgprefix = "chich";

let trackimgcss = "", bgurlloaded = 0;
async function artzurl(idx){
    // // uncomment this out to have overflow cats but it eats up bandwidth which I dont feel good doing
    // if(idx >= artzinfo.length){
    //     idx %= artzinfo.length;
    //     const catdata = await fetch("https://api.thecatapi.com/v1/images/search")
    //         .then(response => response.json()).catch(e => e);
        
    //     if(!catdata.message){
    //         const url = catdata[0].url;
    //         return url;
    //     }
    // }
    
    return baseartzlink + artzinfo[idx % artzinfo.length][0];
    
}
(async () =>{
    const upper = dirs.length * 4;
    for(let i = 0; i < upper; i++){
        const url = await artzurl(i);
        trackimgcss += `
        .${imgprefix}${i} {
            --bg-url: url('${url}');
        }\n
        `;
        bgurlloaded++;
    }
    styling(trackimgcss);
    
    // Generate dynamic CSS for positioning based on number of images
    let positionCSS = "";
    const angleStep = 360 / numImages;
    // Keep as CSS variable string so it can be dynamically adjusted by the stylesheet
    const radius = "var(--size)"; 
    
    for(let i = 0; i < numImages; i++){
        const angle = i * angleStep;
        
        // Calculate position using polar coordinates
        // For a regular polygon, we rotate around Y axis and translate in Z
        positionCSS += `
        .track > div.side-${i} {
            transform: rotateY(${angle}deg) translateZ(${radius});
        }\n`;
    }
    
    styling(positionCSS);
    
    eqa(".t-img").forEach((e) => {
        const bimg = compst(e).backgroundImage;
        const bimgurl = bimg.substring(5, bimg.length - 2);
    
        const img = new Image();
        imglazy(img);
        img.onload = () => {
            e.style.aspectRatio = `${img.width} / ${img.height}`;
        };
        // log(bimgurl);
        img.src = bimgurl;
        // img.opacity = "0";
        
    });
})();

function trackitem(idx, transition = "none"){
    let desc = "";
    // if(idx >= artzinfo.length) desc = "index overflow cat!!";
    // else 
    desc = artzinfo[idx % artzinfo.length][1];
    return app(div({class: `${dirs[idx % dirs.length]} opp-txt` }), 
        app(
            div(
                {class: `${imgprefix}${(idx)} t-img`,
                    style: `animation-delay: calc(${-poss[idx % poss.length]} * var(--spin-speed) / 16 - var(--spin-speed) / 4);`,
            }),
            app(
                div({style: `transition: ${transition}`}), 
                p(desc, {class: "t-img-desc"}),
                // img(artzurl(idx), {style: "opacity: 0;"}),
            ))
        );
}

const artztransitions = new WeightedChoices([
    ["0.75s var(--ease-doublebacktrack);", 4],
    ["0.75s var(--ease-backtrack);", 2.5],
    ["none", 1]
]);

function addtotrack(track, classadd = 0){
    for(let i = 0; i < dirs.length; i++){
        const transition = artztransitions.spinthelottery();
        // overflow cat for indices out of range
        const titem = trackitem(i + classadd, transition);
        app(track, titem);
    }
}

eqa(".track-outer .track-1.track:not(.other)").forEach((e) => {
    addtotrack(e);
});
eqa(".track-outer .track-1.track.other").forEach((e) => {
    addtotrack(e, dirs.length);
});
eqa(".track-outer .track-2.track:not(.other)").forEach((e) => {
    addtotrack(e, dirs.length * 2);
});
eqa(".track-outer .track-2.track.other").forEach((e) => {
    addtotrack(e, dirs.length * 3);
});

// eqa(".track-outer .track-3.track:not(.other)").forEach((e) => {
//     addtotrack(e, dirs.length * 1);
// });
// eqa(".track-outer .track-3.track.other").forEach((e) => {
//     addtotrack(e, dirs.length * 4);
// });

// experimental track thing

// eqa(".track-outer .track-3.track:not(.other)").forEach((e) => {
//     addtotrack(e, dirs.length * 1);
// });
// eqa(".track-outer .track-3.track.other").forEach((e) => {
//     addtotrack(e, dirs.length * 4);
// });
const track3 = eqa(".track .track3");
let lastscroll = 0;
function scrolltrack3(event){
    event.preventDefault();
    const diff = window.scrollY - lastscroll;
    lastscroll = window.scrollY;
}

for(const track of track3){
    track.addEventListener("scroll", scrolltrack3);
}

// left menu 

const lmenu = eid("left-menu");
const lmenuops = eid("left-menu-options");
const lmenutime = 750;
const lmenuttl = 600;
const lmenuhover = () => lmenu.matches(":hover") || lmenuops.matches(":hover");

const lmenuvis = new MeteredPatientTrigger(lmenutime, () => {
    setTimeout(() => {
        if(lmenuhover()) return;
        lmenu.style.opacity = "0";
    }, lmenutime);
});

const lmenuretract = new MeteredPatientTrigger(lmenuttl, () => {
    setTimeout(() => {
        if(lmenuhover()) return;
        lmenuvis.fire();
    }, lmenuttl);
});

lmenu.onmouseover = lmenuops.onmouseover = () => {
    lmenu.style.opacity = "1";
}
lmenu.onmouseout = lmenuops.onmouseout = () => {
    if(lmenuhover()) return;
    
    lmenu.style.transform = "";
    lmenuvis.fire();
}

eqa("#left-menu-options>div").forEach(option => {
    const name = option.dataset.name;
    const menuitem = eq(`#left-menu>.${name}`);
    
    const rotation = elprop(eid("left-menu"), "--rotate");
    const rotationr = rotation * deg2rad;
    option.classList.add(name);

    option.onmouseover = () => {
        menuitem.classList.add("active");
        option.classList.add("active");

        // Get the perspective value from #left-menu css
        const perspective = elprop(eid("left-menu-outer"), "perspective");

        const z = (option.offsetTop + menuitem.clientHeight) * cos(rotationr);
        const scale = perspective / (perspective - z);

        const desiredlevel = option.offsetTop / cos(rotationr);
        const currheight = menuitem.offsetTop;
        // const foldheight = menuitem.clientHeight / cos(rotationr) - menuitem.clientHeight;
        const foldheight = menuitem.clientHeight - menuitem.clientHeight * cos(pi/2 - rotationr);
        const midheight = (menuitem.clientHeight - option.clientHeight) / 2;

        const offset = desiredlevel - currheight + foldheight / scale - midheight * 0;
        
        lmenu.style.transform = `
            rotateX(${rotation}deg)
            translateY(${offset}px)
        `;
        // lmenu.style.transform = `
        //     rotateX(${rotation}deg) 
        //     translateY(${0}px)
        // `;
        // log(menuitem.offsetTop, option.offsetTop, menuitem.clientHeight, scale);
    };
    option.onmouseout = () => {
        menuitem.classList.remove("active");
        option.classList.remove("active");
    };
    menuitem.onmouseover = option.onmouseover; // hacky fix i think
    menuitem.onmouseout = option.onmouseout;
});

// https://www.npmjs.com/package/ani-cursor/v/0.0.5
// const ani2css = (selector, data) => window.AniCursor.convertAniBinaryToCSS(selector, data);
// async function appcursor(selector, url) {
//     const response = await fetch(url);
//     const data = new Uint8Array(await response.arrayBuffer());

//     styling(ani2css(selector, data));
// }
// //default
// appcursor("body, ::-webkit-scrollbar-track", "../assets/cursors/don-chan/通常.ani");
// //pointer
// appcursor("a, button, ::-webkit-scrollbar-thumb, #self-88x31 img, #blog>nav>button, #theme-switch", "../assets/cursors/don-chan/リンクの選択.ani");
// //text
// appcursor("textarea, input, select, [contenteditable]", "../assets/cursors/don-chan/テキスト選択.ani");
// //ew-resize
// appcursor("#slider", "../assets/cursors/don-chan/左右に拡大縮小.ani");
// //move
// appcursor("#slider.grab", "../assets/cursors/don-chan/移動.ani");