// drop-in functions to insert elements into page
// requires helper.js and helper-classes.js

class FpsMeter{
    static #prevfps = 0;
    static #maxfps = 0;
    static #defaultwindow = 1000;
    static #updateint = 100;
    static #fpsm = new PerSec(FpsMeter.#defaultwindow);
    static #avgs = new RollingAvg(100);
    static #dispfps = 
        new MeteredTrigger(FpsMeter.#updateint, () => {
            eid("fps").innerText = FpsMeter.#fpsm.cntn();
        });

    static #fps(){
        FpsMeter.#fpsm.add();
        FpsMeter.#avgs.add(FpsMeter.#fpsm.cntn());
        if(FpsMeter.#prevfps !== FpsMeter.#fpsm.cntn()){
            FpsMeter.#dispfps.fire();
            FpsMeter.#prevfps = FpsMeter.#fpsm.cntn();

            // occasionally adapt to thing 
            if(!chance(100)){
                FpsMeter.#maxfps = max(FpsMeter.#maxfps, FpsMeter.#prevfps);
            }
            else{
                FpsMeter.#maxfps = FpsMeter.#avgs.get() - 5;
            }
        }
        window.requestAnimationFrame(FpsMeter.#fps);
    }

    static init(){
        if(!eid("fps")) appdoc(mk("div", 
            {id: "fps", style: `position: fixed; bottom: 4px; left: 0; z-index: 3; pointer-events: none;
                    text-shadow: .05em .05em 0px var(--theme-light);`}));
        window.requestAnimationFrame(FpsMeter.#fps);
    }

    static get maxfps(){
        return FpsMeter.#maxfps;
    }
    static get avg(){
        return FpsMeter.#avgs.get();
    }
    static get currfps(){
        return FpsMeter.#fpsm.cntn();
    }
}
class KeySetSide{

    static #keyset = null;
    static #defaultwindow = 600;
    static #kps = new PerSec(KeySetSide.#defaultwindow);

    static init(){
        if(!eid("keyset")){
            appdoc(mk("div", {id: "keyset"}));
            styling(`
#keyset{
    position: fixed;
    z-index: 1;
    left: 0;
    top: var(--header-height);
    /* width: 1ch; */
    display: flex;
    flex-direction: column;
    >p{
        animation: pop-in 0.15s forwards;
    }
}
@keyframes pop-in{
    0%{
        transform: translate(-100%, 0);
        rotate: -25deg;
    }
    35%{
        margin-left: 1ch;
        transform: translate(.35ch, 0);
        rotate: 15deg;
    }
    100%{
        transform: translate(0, 0);
        rotate: 0deg;
    }
}    
`);
        }
        KeySetSide.#keyset = eid("keyset");

        KeySet.init();
        KeySet.onnewkey = (key) => {
            KeySetSide.#kps.add();
            const keyel = p(key.key, {"data-key": key.ekey, 
                style: `font-size: ${sqrt(KeySetSide.#kps.cntn())}ch;` });
            keyel.style.animationTimingFunction = `cubic-bezier(1,${pow(1.5, 
                min(10, sqrt(KeySetSide.#kps.cntn())))},0.45,1.25)`;

            app(KeySetSide.#keyset, keyel);
        }
        KeySet.onoofkey = (key) => {
            setTimeout(() => {
                const el = eq(`#keyset>[data-key="${key.ekey}"]`);
                    if(el) el.remove()
            }, 50);
        }
    }
}

class ScrollProgress{
    static #bar = null;
    static #trigger = null;
    static #containerlimiterid = null;

    static init(containerlimiterid = "none"){
        if(containerlimiterid === "none"){
            throw new Error("need id thingy");
        }
        ScrollProgress.#containerlimiterid = containerlimiterid;

        if(!eid("scroll-progress")){
            appdoc(mk("div", {id: "scroll-progress"}));
            styling(`        
#scroll-progress{
    position: fixed;
    z-index: 2;
    bottom: 0;
    left: 0;
    height: 8px;
    background-color: var(--theme-dark);
    --start-width: 100%;
    width: var(--start-width);
    transition: width 0.5s var(--ease-backtrack);
    transform: skew(30deg);
    --speed: 3s;
    &::before, &::after{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: var(--start-width);
    }
    &::before{
        background-color: var(--theme-light-other);
        animation: border-anim-lr var(--speed) var(--ease-more-in) infinite;
    }
    &::after{
        background-color: rgba(var(--theme-light-vals), .5);
        animation: border-anim-rl var(--speed) var(--ease-more-in) infinite;
        animation-delay: calc(var(--speed) * -1 / 4);
        
    }
}`);
        }
        ScrollProgress.#bar = eid("scroll-progress");
        ScrollProgress.#trigger = new MeteredQueueTrigger(70, () => {
            ScrollProgress.#bar.style.width = 
            `${(window.scrollY / 
                (eid(ScrollProgress.#containerlimiterid).offsetHeight - window.innerHeight)) * 100}%`;
        });
        
        window.addEventListener("scroll", () => {
            ScrollProgress.#trigger.fire();
        });
    }

}

class Debug{
    static #zindex = 2;

    static init(){
        if(!eid("debug")){
            appdoc(mk("div", {id: "debug", style: `
                position: fixed;
                top: 0; 
                left: 0;
                font-size: 1.5vh;
                background: var(--theme-light-other); 
                color: var(--theme-dark-other); 
                z-index: ${Debug.#zindex};
                transition-property: background, color;
                transition-duration: .5s;
                transition-timing-function: ease-out;
                `}));
        }
    }

    static insert(type, ...args){
        if(!debug) return;
        Debug.#components[type](...args);
    }

    static #components = {
        centerdot: (size = 8, color = "red") => {
            if(eid("debug-centerdot")) return;
            appdoc(mk("div", {id: "debug-centerdot", style: `
                position: fixed;
                pointer-events: none;

                top: 50%;
                left: 50%;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: ${Debug.#zindex};
                `
            }));
        },
        
    }
}

class ThemeSwitch{

    static #switcher = null;
    static #extra = nofunc;
    static #limiter = 250;
    static #triggertheme = new MeteredTrigger(ThemeSwitch.#limiter, (...args) => {
        toggletheme();
        ThemeSwitch.#extra(...args);
    });
    static #occupied = false;
    static #occupiedtypes = []; // list of currently playing switch types

    static #coverscss = `
    .ts-cover{
        position: fixed;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        /* transition: background-color .5s ease; */
        /* outline: solid 10px red; */
        &.l-d{
            background-color: var(--theme-l-d-diff);
        }
        &.d-l{
            background-color: white;
            backdrop-filter: var(--theme-d-l-filter);
        }

        /* diff transitions */
        &.collapse{
            left: 100%;
            bottom: 0;
            width: 200vh;
            height: 200vw;
            transform-origin: 0% 100%;
        }
        &.slide-in-left{
            top: 0;
            right: 100%;        
        }
        &.slide-in-right{
            left: 100%;
            right: 0vw;
            bottom: 0;
            transform-origin: 100% 0%;        
        }
        &.filter{
            background-color: var(--theme-l-d-diff);
            mix-blend-mode: difference;
        }
    }
    :root.dark body>.ts-cover{
        &.filter{
            /* dark to light */
            backdrop-filter: var(--theme-d-l-filter);
            background-color: transparent;
            mix-blend-mode: normal;
        }
    }`;
    static #playanimations = [
        function collapse() {

            ThemeSwitch.#addtype("collapse");


            // collapse the .collapse div
            new Ani(".collapse").rule({
                from: {rotate: "0deg"},
                to: {rotate: "-90deg"},
                duration: 700,
                easing: "ease-in",
                forwards: true,
                additive: [false, false],
            })       
            .rule({
                from: {rotate: "0deg"},
                to: {rotate: "15deg"},
                duration: 300,
                easing: "ease-out",
                forwards: true,
                additive: [true, true],
            })
            .rule({
                from: {rotate: "0deg"},
                to: {rotate: "-90deg"},
                duration: 400,
                easing: "ease-in",
                forwards: true,
                additive: [true, false],
            })
            .then(() => {
                ThemeSwitch.fire();
                ThemeSwitch.#resettypes();
            });

            // .then(() => {
            //     eq(".collapse").classList.remove("filter");
            //     ThemeSwitch.fire();
            // })
            // .rule({
            //     from: {rotate: "0deg"},
            //     to: {rotate: "-360deg"}, // push a little extra to end
            //     duration: 700,
            //     easing: "ease-in",
            //     forwards: true,
            //     additive: [true, false],
            // })
            // .then(() => {
            //     ThemeSwitch.#resettypes();
            // });
        },

        function slidein(){
            const slideduration = 1980 / 3, collisionduration = 1980 / 2;

            ThemeSwitch.#addtype("slide-in-left", "slide-in-right");
            // before-screen slides in
            
            const beforescreendelay = new Ani(".slide-in-left").then(() => {
                eq(".slide-in-left").style.left = "initial";
            })
            .rule({
                from: {right: "100vw"},
                to: {right: "50vw"},
                duration: slideduration,
                easing: "ease-out",
                forwards: true,
                additive: [false, false],
            })
            
            // slide-in slides out
            const slideindelay = new Ani(".slide-in-right").delay(beforescreendelay.whendone() - 100)
            .rule({
                from: {left: "100%"},
                to: {left: "50%"},
                duration: slideduration,
                easing: "ease-in",
                forwards: true,
                additive: [true, false],
            }).then(() => {
                ThemeSwitch.fire();
                // eq(".slide-in-left").classList.remove("filter");
                // eq(".slide-in-right").classList.remove("filter");
            });

            // collision
            new Ani(".slide-in-left").delay(slideindelay.whendone() - 5)
            .rule({
                from: {right: "50vw"},
                to: {right: "100vw"},
                duration: collisionduration,
                easing: "ease-out",
                forwards: true,
                additive: [false, false],
            }).then(() => {
                ThemeSwitch.#resettypes();
            })
            .reset({left: "0"});

            // slide-in tumbles
            new Ani(".slide-in-right").delay(slideindelay.whendone())
            .rule({
                from: {left: "50%", rotate: "0deg", bottom: "0%"},
                to: {left: "20%", rotate: "-20deg", bottom: "-150%"},
                duration: collisionduration-10,
                easing: "cubic-bezier(.43,-0.3,1,.31)",
                forwards: true,
                additive: [false, false],
            }).reset({left: "100%"});
        }
    ]
    static #addtype(...types){
        if(ThemeSwitch.#occupied) return;
        for(const type of types){
            ThemeSwitch.#occupiedtypes.push(type);
            prepdoc(mk("div", {class: `ts-cover filter ${type}`}));
        }
        eid("theme-switch").classList.add("pre");
        ThemeSwitch.#occupied = true;
    }
    static #resettypes(){
        ThemeSwitch.#occupied = false;
        for(const t of ThemeSwitch.#occupiedtypes){
            const el = eq(`.ts-cover.${t}`);
            if(el) el.remove();
        }
        ThemeSwitch.#occupiedtypes = [];
    }

    static init(onclick = nofunc, top = "0px"){
        ThemeSwitch.#extra = onclick;
        styling(ThemeSwitch.#coverscss);
        
        
        if(!eid("theme-switch")){
            const ts = fromhtml(`<div id="theme-switch">
    <div class="ts-container">
        <div class="container" id="c-moon" title="clik 4 dark mode">
            <!-- svgs from parkalex.dev -->
            <svg xmlns="http://www.w3.org/2000/svg" id="moon-svg"
                viewBox="0 0 24 24"> 
                <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93 9.93 9.93 0 0 0 7.07-2.929 10.007 10.007 0 0 0 2.583-4.491 1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343 7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483 10.027 10.027 0 0 0 2.89 7.848 9.972 9.972 0 0 0 7.848 2.891 8.036 8.036 0 0 1-1.484 2.059z">
                </path> 
            </svg>
        </div>
        <div class="container" id="c-sun" title="clickies four light(better) mode">
            <svg xmlns="http://www.w3.org/2000/svg" id="sun-svg"
                viewBox="0 0 24 24"> 
                <path d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z">
                </path>
            </svg>
        </div>
    </div>
</div>`);
            document.body.prepend(ts);
            styling(`
:root.dark #theme-switch, :root:not(.dark) #theme-switch.pre{
    top: -50px;
    rotate: 180deg;
}

:root.dark #theme-switch >div.ts-container{
    rotate: 180deg;
    &:hover{
        rotate: calc(180deg - 3deg) !important;
    }
}
#theme-switch >.ts-container{
    rotate: 0deg;
}
#theme-switch, :root.dark #theme-switch.pre{
    /* --scale: 3; scale blurs out the svg */
    pointer-events: all;
    --slant: 15deg;
    --speed: .75s;
    position: fixed;
    z-index: 2;

    rotate: 0deg;
    /*top: calc(50px + var(--header-height)); 2em (h1) + 0.67em from margin-block-startend  user-stylesheet*/
    top: calc(50px + ${top});
    right: 0px;
    transform-origin: -50vw 50svh; /* OH MY GOD THANK YOU LORD AND SAVIOR DVH CHROSIST OMG */
    /* nvm dvh is like really laggy lol */
    transition: var(--speed) var(--ease-backtrack);
    transition-property: rotate, transform, top, right;
    
    width: 0;
    height: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover{
        cursor: pointer;
        transform: translate(-1vw, 1vh);
        >.ts-container{
            rotate: -3deg;
            >.container>svg{
                animation-play-state: paused !important;
                rotate: 270deg;
                &#sun-svg{
                    rotate: -270deg;
                }
                filter: drop-shadow(0px 0px 4px var(--theme-dark-other));
            }
        }
    }

    >.ts-container{
        background-color: var(--theme-light-other);
        transition-property: background-color, rotate;
        transition-duration: 2.65s, var(--speed);
        transition-timing-function: var(--ease-more-in), var(--ease-backtrack);

        display: flex;
        flex-direction: row;
        transform: skew(var(--slant));
        &::before, &::after{
            content: '';
            position: absolute;
            background-color: rgb(var(--theme-light-other-vals), 0.25);
            mix-blend-mode: plus-lighter;
            height: 4px;
            --speed: 10s;
        }
        &::before{
            bottom: 0;
            left: 0;
            height: 100%;
            animation: border-anim-lr var(--speed) linear infinite;
        }
        &::after{
            bottom: 0;
            left: 0;
            animation: border-anim-bt var(--speed) linear infinite;
            width: 100%;
            animation-delay: calc(var(--speed) * -1 / 4);
        }
        
    }
    >.ts-container>.container{
        height:100px;
        width: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: skew(calc(-1 * var(--slant)));
        >svg{
            animation: rotate-full 2s ease-in-out infinite;
            transform-origin: 50% 50%;
            transition: 1.6s var(--ease-backtrack);
            transition-property: rotate, filter;
            /* scale: var(--scale); */
            fill: var(--theme-dark-other);
            height: 72px;
            width:  72px;
            /* Ensure the SVG viewBox matches the aspect ratio and size in your HTML:
            <svg viewBox="0 0 24 24" ...> for a 1:1 ratio */
        
            filter: drop-shadow(0px 0px 2px var(--theme-dark-other));
        }
        #sun-svg{
            animation-direction: reverse;
        }
    }
}

@keyframes theme-glow{
    0%{
        filter: drop-shadow(0px 0px 1px var(--theme-dark-other));
    }
    25%{
        filter: drop-shadow(0px 0px 2px var(--theme-dark-other));
    }
    100%{
        filter: drop-shadow(0px 0px 1px var(--theme-dark-other));
    }
}
@keyframes rotate-full{
    0%{
        transform: rotate(0deg);
    }
    100%{
        transform: rotate(360deg);
    }
    
}`);
        }
        ThemeSwitch.#switcher = eid("theme-switch");

        ThemeSwitch.#switcher.onclick = () => 
            ThemeSwitch.fire();
    }
    static fire(){
        if(!ThemeSwitch.#switcher) return;
        
        // eid("theme-switch").classList.toggle("dark");
        if(!ThemeSwitch.#animate()){ // if wasn't able to play, just fire.
            ThemeSwitch.#triggertheme.fire();
            eid("theme-switch").classList.remove("pre"); // coming from pass of #animate
        
        }
    }
    
    static #animate(){
        if(ThemeSwitch.#occupied) return false;
        ThemeSwitch.#playanimations[thememode === "light" ? 0 : 1]();
        // randarrchoose(ThemeSwitch.#playanimations)();
        return true;
    }

    
}

class BGBars{
    static #currpxl = 0;
    static #step = 1150;
    static #maxpxl = () => min(1080 * 5, pxlheight * 3.75);
    static #maxscroll = () => window.innerHeight / pxlheight * BGBars.#maxpxl();
    static #maxdepth = 4;
    static #depths;
    static #bardepthpower = 1.5;
    static #depthpows;
    static #invdepthpows;
    static #bgbar = null;
    static #numbars = 0;
    static #panstrength = 0.1;
    static #basecolor;
    static #barspawninterval = 300;
    static #initialized = false;
    static #barsfired = 0;
    static #limiter = 100;
    static #barkeyframes = [
        "passdown",
        "passup",
        "passright",
        "passleft"
    ];
    static #invdepths = []//max(.5, BGBars.#depths.length - depth);

    // static #containerlimiterid = "page";
    static #scrollfunc = (...args) => {throw new Error("init boy")};
    static #scrollbarst = new MeteredQueueTrigger(100, BGBars.#scrollfunc);



    static init(options = {}){
        if(BGBars.#initialized) return;
        if(!(helperjs && helperclassesjs)) throw new Error("helper.js and helper-classes.js not loaded yet");
        BGBars.#initialized = true;
        BGBars.#currpxl = 0;
        BGBars.#step = options.step || BGBars.#step;
        BGBars.#maxpxl = options.maxpxl !== undefined ? () => options.maxpxl : BGBars.#maxpxl;
        BGBars.#maxscroll = options.maxscroll !== undefined ? () => options.maxscroll : BGBars.#maxscroll;
        BGBars.#maxdepth = options.maxdepth || BGBars.#maxdepth;
        BGBars.#bardepthpower = options.bardepthpower || BGBars.#bardepthpower;

        BGBars.#depths = [];
        BGBars.#depthpows = [];
        BGBars.#invdepthpows = [];
        BGBars.#invdepths = [];

        for(let d = 1; d <= BGBars.#maxdepth; d++){
            BGBars.#depths.push(d);
            BGBars.#depthpows.push(pow(d, BGBars.#bardepthpower));
            BGBars.#invdepthpows.push(pow(max(.5, BGBars.#maxdepth - d), BGBars.#bardepthpower));
            BGBars.#invdepths.push(max(.5, BGBars.#maxdepth - d));
        }
        log(BGBars.#invdepthpows);
        BGBars.#barspawninterval = options.barspawninterval || BGBars.#barspawninterval;
        // BGBars.#containerlimiterid = options.containerlimiterid || BGBars.#containerlimiterid;

        BGBars.#panstrength = options.panstrength || BGBars.#panstrength;
        BGBars.#basecolor = tohsl(docprop("--theme-light"), true);

        if(!eid("bg-bars"))
            appdoc(mk("div", {id: "bg-bars"}));
        BGBars.#bgbar = eid("bg-bars");
        styling(`
@keyframes passdown{
    from{
        transform: translateY(-100vh) translateX(-50%);
    }
    to{
        transform: translateY(0) translateX(-50%);
    }
}
@keyframes passup{
    from{
        transform: translateY(100vh) translateX(-50%);
    }
    to{
        transform: translateY(0) translateX(-50%);
    }
}
@keyframes passright{
    from{
        transform: translateX(-150%);
    }
    to{
        transform: translateX(-50%);
    }
}
@keyframes passleft{
    from{
        transform: translateX(50%);
    }
    to{
        transform: translateX(-50%);
    }
}
@keyframes expand{
    from{
        width: 0;
    }
    to{
        width: 156.25vw;
    }
}

#bg-bars{
    z-index: -1;
    position: fixed;
    /* overflow: hidden; */
    top: 0;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: transparent;
    >div{
        position: relative;
        /* overflow-y: hidden; */
        >.bg-bar{
            position: absolute;
            width: 156.25vw; /*calc(2500vw/16);, also not using larger value since it lags like potato chips*/
            left: 50%;
            transform: translateX(-50%);
            transform-origin: 0% 50%;
            filter: opacity(0.5);
            animation-timing-function: 
            /* ease-in-out; */
            var(--ease-morein-out);
        }
    }
}`);
        
        let bgbarscss = "#bg-bars{";
        for(let d = 1; d <= BGBars.#maxdepth; d++){
            app(BGBars.#bgbar, mk("div", {class: `c-${d}`}));
            bgbarscss += `
.c-${d}{ 
    z-index: -${d};
    transition: transform ${d * 0.6}s var(--ease-lessout);

    >div{
        filter: blur(${min(7.5, BGBars.#depthpows[d - 1])}px);
    }
}`;
        }
        styling(bgbarscss + "}");

        BGBars.#scrollfunc = options.scrollfunc || (() => ({Y: window.innerHeight + window.scrollY, X: 0}));
        BGBars.#limiter = options.limiter || 100;
        BGBars.#scrollbarst = new MeteredQueueTrigger(BGBars.#limiter,
         (comparing = Infinity, limiting = 0, ...funcargs) => {
            const scroll = BGBars.#scrollfunc(...funcargs);
            const scrollY = scroll.Y;
            const scrollX = scroll.X;
            if(BGBars.#currpxl < comparing){//eid(BGBars.#containerlimiterid).offsetHeight){ 
                BGBars.#bgbars(scrollY);
            }

            if(scrollY >= limiting){//eid(BGBars.#containerlimiterid).offsetHeight){
                return;
            }
            // log(window.scrollY + window.innerHeight, eid("container").offsetHeight);
            for(let depth = 1; depth <= BGBars.#maxdepth; depth++){
                const stopmult = FpsMeter.maxfps / 10;
                if(FpsMeter.currfps + stopmult <= FpsMeter.maxfps - BGBars.#invdepths[depth - 1] * stopmult) return;
                eq("#bg-bars .c-" + depth).style.transform = `translateY(${(scrollY * -BGBars.#panstrength * 
                    BGBars.#invdepthpows[depth - 1]) % (BGBars.#maxscroll())}px)
                    translateX(${(scrollX * -BGBars.#panstrength * pow(BGBars.#invdepths[depth - 1], 2)) 
                        % BGBars.#maxscroll()}px)
                    `;

            }
        });

        TSFuncs.add(BGBars.reset);
        // BGBars.#bgbars(0);

    }
    static #bgbars(newheight){
        if(!eid("bg-bars")){
            dlog("nope");
            return;
        }
        if(!BGBars.#initialized) return;

        while(BGBars.#currpxl <= BGBars.#maxpxl() && BGBars.#currpxl <= newheight + BGBars.#step){
            log("spawning more");
            BGBars.#currpxl += BGBars.#step;
            const currpxl = BGBars.#currpxl; // get curr value (timeout stuff)

            for (let depth = 1; depth <= BGBars.#maxdepth; depth++){
                const delay = rand((depth - 2) * BGBars.#barspawninterval);
                setTimeout(() => {
                    const invdepth = BGBars.#invdepths[depth - 1];
                    const bgcolor = `hsl(${BGBars.#basecolor.h}, ${BGBars.#basecolor.s}%, 
                        ${frand( BGBars.#basecolor.l*invdepth / 4, BGBars.#basecolor.l * .75)}%)`;
                    const bgbar = eq("#bg-bars .c-" + depth);

                    for (let cnt = 0; cnt <= depth / 3; cnt++){
                        BGBars.#numbars++;
                        BGBars.#barsfired++;
                        const bar = mk("div", {class: `bg-bar`});
                        bar.style.animationName = randarrchoose(BGBars.#barkeyframes);
                        if(chance(1)) bar.style.animationName += ", expand";

                        bar.style.height = `${frand(depth, 4) * depth}vh`;
                        bar.style.rotate = `${frand(40, -20) * depth}deg`;
                        bar.style.left = `${frand(50, -25)}%`;
                        bar.style.backgroundColor = bgcolor;
                        bar.style.top = `${currpxl - frand(BGBars.#step)}px`;
                        bar.style.opacity = invdepth * frand(.35 * invdepth, .45);
                        // bar.style.boxShadow = `0 0 ${pow((depth - 1), 2) * 10}px ${bgcolor}`; cool but laggy
                        bar.style.animationDuration = `${frand(1.5,.5)}s`;

                        setTimeout(() => {
                            app(bgbar, bar);
                        }, rand(BGBars.#barspawninterval<<invdepth));
                    }
                }, delay);
                
            }
        }
    }

    static reset(){
        BGBars.#currpxl = 0;
        BGBars.#numbars = 0;
        BGBars.#basecolor = tohsl(docprop("--theme-light"), true);
        eqa("#bg-bars>div").forEach((bar) => {
            bar.innerHTML = "";
        });
        BGBars.#bgbars(window.innerHeight + window.scrollY);
        BGBars.fire();

    }

    static fire(comparing, limiting, currscroll){
        BGBars.#scrollbarst.fire(comparing, limiting, currscroll);
    }
    static get initialized(){
        return BGBars.#initialized;
    }
    static get barsfired(){
        return BGBars.#barsfired;
    }
}