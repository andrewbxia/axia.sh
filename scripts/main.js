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

const isay = eid("status");
function statusshade(){
    const shade = eq(".speech-bubble>.bubble-shade");
    const bubble = eq(".speech-bubble>.bubble");
    const cover = eq(" .delay-cover > .bubble-cover");
    shade.innerHTML = bubble.innerHTML;
    cover.style.setProperty("--c-height", `${bubble.offsetHeight * .5}px`);
}

async function setstatus(){
    const status = await getstatus();
    const daysago = dateago(new Date(status.date), "day", 2);
    const info = div();
    app(info, h3(`___ ${status.title} ___`));
    app(info, p(`${fix2num(daysago[0], 1)} ${daysago[1]}s ago...`));

    const statustxt = p(status.status);

    isay.innerHTML = "";
    appmany(isay, [info, statustxt]);
    statusshade();
}
statusshade();
setstatus();


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
const dirs = ["front", "back", "left", "right"];
const poss = [0, 4, 6, 2, 1, 5, 7, 3];
const imgprefix = "chich";

function generateposs(cnt){
    const poss = [];
    return poss;
}

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
    });
})();

function trackitem(idx, transition = "none"){
    let desc = "";
    // if(idx >= artzinfo.length) desc = "index overflow cat!!";
    // else 
    desc = artzinfo[idx % artzinfo.length][1];
    return app(div({class: `${dirs[idx % dirs.length]}` }), 
        app(
            div(
                {class: `${imgprefix}${(idx)} t-img`,
                    style: `animation-delay: calc(${-poss[idx % poss.length]} * var(--spin-speed) / 16 - var(--spin-speed) / 4);`,
            }),
            app(
                div({style: `transition: ${transition}`}), 
                p(desc, {class: "t-img-desc"})
            ))
        );
}

function addtotrack(track, classadd = 0){
    for(let i = 0; i < dirs.length; i++){
        const transition = randarrchoose([
            "0.75s var(--ease-doublebacktrack);",
            "0.75s var(--ease-backtrack);",
            "none"]);
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

//todo: maybe make this handle n images instead of 4 with programatic css
const lmenu = eid("left-menu");
const lmenuops = eid("left-menu-options");
const lmenutime = 750;
const lmenulife = 600;
const lmenuhover = () => lmenu.matches(":hover") || lmenuops.matches(":hover");

const lmenuvis = new MeteredPatientTrigger(lmenutime, () => {
    setTimeout(() => {
        if(lmenuhover()) return;
        log("ok")
        lmenu.style.opacity = "0";
    }, lmenutime);
});

const lmenuretract = new MeteredPatientTrigger(lmenulife, () => {
    setTimeout(() => {
        if(lmenuhover()) return;
        lmenuvis.fire();
    }, lmenulife);
});

lmenu.onmouseover = lmenuops.onmouseover = () => {
    lmenu.style.opacity = "1";
}
lmenu.onmouseout = lmenuops.onmouseout = () => {
    if(lmenuhover()) return;
        lmenu.style.transform = "";
        lmenuvis.fire();
}

eqa("#left-menu-options>div").forEach(e => {
    const option = e;
    const name = option.dataset.name;
    const menuitem = eq(`#left-menu>.${name}`);
    
    const rotation = 35;
    const rotationr = rotation * deg2rad;
    option.classList.add(name);

    option.onmouseover = () => {
        menuitem.classList.add("active");

        // Get the perspective value from #left-menu (chatgpt)
        const perspective = 1000;
        const realheight = brect(eid("left-menu")).height;
        // ((menuitem.clientHeight + menuitem.offsetTop) / eid("left-menu").clientHeight);
        // log(perspective);

        // perspective scaling code from chatgpt
        // Calculate the offset considering the perspective and rotation
        // Project the offsetTop into the transformed space
        // Approximate: scale offset by perspective / (perspective - z)
        // where z = menuitem.clientHeight * sin(rotationr)
        const z = menuitem.clientHeight * sin(rotationr);
        const scale = perspective / (perspective - z);

        const offset = (
            (menuitem.offsetTop * scale - option.offsetTop / cos(rotationr) 
                - (2 * menuitem.clientHeight * sin(rotationr / 2) * sin(rotationr / 2)) /
                sin((90 - rotation) * deg2rad) 
            ) 
        );

        lmenu.style.transform = `
            rotateX(${rotation}deg) 
            translateY(${-offset}px)
        `;
        // eid("left-menu-outer").style.perspective = `${perspective}px`;
        // log(scale, offset);
    };
    menuitem.onmouseover = option.onmouseover; // hacky fix i think
    option.onmouseout = () => {
        menuitem.classList.remove("active");
    };
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