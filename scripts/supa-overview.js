const supaurl = "https://rvlvbcvqtwmliwwrgqjg.supabase.co";
// i have rls policies enabled, we should be goog goog
const publicanonkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bHZiY3ZxdHdtbGl3d3JncWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MDU3MjcsImV4cCI6MjA1NTA4MTcyN30.oysqGbhO9qgDl9RogWjpwAkgY7-letEY_sIR0WYIP4s";
const overviewparameters = [
    "title",
    "id",
    "description",
    "tags",
    "created_at",
    "edited_at",
    "cover_url"
].join(",");
const postparameters = [ "id", "created_at", "edited_at", "content", 
    "cover_url", "title", "tags", "description" ];
const qlimit = 5;
const pagelimit = debug ? 2: 5;

async function getstatus(){
    const response = await fetch(`${supaurl}/rest/v1/rpc/get_status`, {
        method: "POST",
            headers: {
            apikey: publicanonkey,
            "Authorization": `Bearer ${publicanonkey}`,
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    return data[0];
}

async function getpostsoverview(){
    const response = await fetch(`${supaurl}/rest/v1/posts?select=${overviewparameters}&order=id.desc&limit=${qlimit}`, {
        headers: {
            apikey: publicanonkey,
            "Authorization": `Bearer ${publicanonkey}`,
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    // console.log(data);
    return data;
}

async function getpage(pageidx){
    const response = await fetch(`${supaurl}/rest/v1/posts?order=id.desc&limit=${pagelimit}&offset=${pageidx * pagelimit}`, {
        headers: {
            apikey: publicanonkey,
            "Authorization": `Bearer ${publicanonkey}`,
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    // console.log(data);
    return data;
}

async function getpost(id){
    const response = await fetch(`${supaurl}/rest/v1/posts?id=eq.${id}`, {
        headers: {
            apikey: publicanonkey,
            "Authorization": `Bearer ${publicanonkey}`,
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    // console.log(data);
    return data;
}

const minpostid = 1;
let lastpostid = null;

async function numposts(){
    const response = await fetch(`${supaurl}/rest/v1/posts?select=id&order=id.desc&limit=1`, {
        headers: {
            apikey: publicanonkey,
            "Authorization": `Bearer ${publicanonkey}`,
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    lastpostid = data[0].id;
}
// numposts(); already done in index.html script
// getpostsoverview().then(posts => {
//     console.log(posts);
// });
let checkvisited = false;
const visitorstats = {
    visitor_count: -1,
    visitor_unique: -1,
};

const visitintlimit = 1000 * 60 * 60; // 1 hour
let newvisit = false;
async function checkvisit(){
    if(checkvisited) return;
    checkvisited = true;
    
    const lastvisit = localStorage.getItem('lastvisit');
    const now = Date.now();
    let repeat = false;
    if(lastvisit !== null && 
        now - lastvisit < visitintlimit) {
            console.log("helo repeat customer :p");
            repeat = true
    }
    newvisit = lastvisit === null;
    if(!debug){
        if(newvisit){
            console.log("omg hihihihihihi");
            fetch(`${supaurl}/rest/v1/rpc/inc_u`, {
                method: "POST",
                    headers: {
                    apikey: publicanonkey,
                    "Authorization": `Bearer ${publicanonkey}`,
                    "Content-Type": "application/json"
                }
            });
        }
        if(!repeat){ // new visit
            localStorage.setItem('lastvisit', now);
            fetch(`${supaurl}/rest/v1/rpc/inc`, {
                method: "POST",
                    headers: {
                    apikey: publicanonkey,
                    "Authorization": `Bearer ${publicanonkey}`,
                    "Content-Type": "application/json"
                }
            });
        }
    }


    const resp = await fetch(`${supaurl}/rest/v1/rpc/get_visitors`, {
        method: "POST",
            headers: {
            apikey: publicanonkey,
            "Authorization": `Bearer ${publicanonkey}`,
            "Content-Type": "application/json"
        }
    });

    const json = await resp.json();
    if(json.error){
        console.error("uh oh", json.error);
        console.error(json);
    }
    else{
        visitorstats.visitor_count = json[0].visitor_count;
        visitorstats.visitor_unique = json[0].visitor_unique;

        if(newvisit && localStorage.getItem("visitorid") === null)
            localStorage.setItem("visitorid", json[0].visitor_unique);
        document.dispatchEvent(new Event("visitorstats"));
    }

}

setTimeout(() => {
    if(!checkvisited){
        console.error("checkvisit not called yett");
    }
    else{
        console.log("woah");
    }
}, 5000);