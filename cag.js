let player = new Object();

player.tabs = new Object();
player.resources = new Object();

class MultipleRegisterError extends Error{
    constructor(message, options) {
        super(message, options);
    }
}

var ctn = false;
var ticking = true;

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
function reload_settings(){

}
function registerTab(tabId,tabName){
    if(player.tabs.tabId != undefined){
        throw MultipleRegisterError(`Tab ${ tabId } is already exists.`);
    }
    player.tabs[tabId] = new Object();
    player.tabs[tabId].name = tabName;
    let newTab = $("<button></button>");
    newTab.attr("id","_cag_bar_" + tabId);
    newTab.text(tabName)
    $("._cag_bar").append(newTab);
}
function tick(){
    player.vesselspeed = player.vesselspeed.sub(0.02);
    if(player.vesselspeed.lt(0)){
        player.vesselspeed = new Decimal(0);
    }
    if(player.up11){
        gluplus = player.vessel;
    }else{
        gluplus = player.vesselspeed;
    }
    player.glucose = player.glucose.plus(gluplus);
    update();
    if(ticking){
        setTimeout(tick,100);
    }
}
function writeSave(){
    localStorage["cancer"] = JSON.stringify(player);
}
function readSave(){
    if(!localStorage["cancer"]){
        return;
    }
    player = JSON.parse(localStorage["cancer"]);
    for(key in player){
        if(typeof player[key] === 'string'){
            player[key] = new Decimal(player[key]);
        }
    }
    update();
}
async function autoSave(){
    dates = Date.now();
    while((Date.now()-dates)<=5000){
        $("#autosave")[0].innerHTML = `自动保存 ${((dates+5000-Date.now())/1000).toFixed(1)}s`
        await sleep(100);
    }
    writeSave();
    setTimeout(autoSave,0);
}
async function saveToClipboard(){
    try {
        await navigator.clipboard.writeText(localStorage["cancer"]);
        alert("已保存到剪贴板");
    } catch (err) {
        alert("保存失败");
    }
}
function saveFromText(){
    try {
        var s = prompt("输入存档","abc");
        if(s != null){
            localStorage["cancer"]=JSON.stringify(JSON.parse(s));
            location.reload();
        }
    } catch (err) {
        alert("加载失败");
    }
}
async function init(){
    try{
        readSave();
    }catch(err){
        console.error(err);
        if(confirm("存档损坏。要删除存档吗？（选否复制存档）")){
            localStorage.removeItem("cancer");
            location.reload();
        }
        document.body.innerHTML="<button onclick=\"ctn=true;\">点击此处保存存档</button>";
        while(!ctn){
            await sleep(100);
        }
        try {
            await navigator.clipboard.writeText(localStorage["cancer"]);
            alert("存档已保存到剪贴板，请稍后重置存档");
        } catch (err) {
            console.error(err);
            alert("存档保存失败");
        }
        location.reload();
    }
}
/*
init();
load();
setTimeout(autoSave,0);
setTimeout(tick,0);
*/