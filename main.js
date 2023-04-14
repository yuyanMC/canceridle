let version = "b0.0.3-2-2";
let player = new Object();

player.variation = new Decimal(0);
player.number = new Decimal(1);
player.glucose = new Decimal(15);
player.vessel = new Decimal(0);
player.vesselspeed = new Decimal(0);

player.showBoard = false;

player.up11 = false;

var ctn = false;
var ticking = true;

var gluplus = new Decimal(0);

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
function update(){
    $("#resnumnum")[0].innerHTML = shorten(player.number);
    $("#resnumglu")[0].innerHTML = `+${shorten(gluplus)} ${shorten(player.glucose)}`;
    $("#resnumves")[0].innerHTML = shorten(player.vessel);
    $("#veshint")[0].innerHTML = `癌细胞-${shorten(Decimal.pow(400, player.vessel.plus(1)))} 血管+1`;
}
function load(){
    $("#ver")[0].innerHTML = version;
    $("#resetsure").hide();
    $("#settings").click(function (e) {
        $(".tab").hide();
        $("#settingsbar").show();
        $(".bar .selected")[0].classList.remove("selected");
        $(".bar #settings")[0].classList.add("selected");
        $(".resourcebox").hide();
    });
    $("#cancer").click(function (e) {
        $(".tab").hide();
        $("#cancerbar").show();
        $(".bar .selected")[0].classList.remove("selected");
        $(".bar #cancer")[0].classList.add("selected");
        if(player.showBoard){
            $(".resourcebox").show();
        }
    });
    $("#upgrades").click(function (e) {
        $(".tab").hide();
        $("#upgradesbar").show();
        $(".bar .selected")[0].classList.remove("selected");
        $(".bar #upgrades")[0].classList.add("selected");
        if(player.showBoard){
            $(".resourcebox").show();
        }
    });
    $("#dev").click(function (e) {
        player.number = new Decimal("1.8e308");
        player.glucose = new Decimal("1.8e308");
    });
    $("#variation").click(function (e) {
        player.variation = player.variation.plus(1);
        if(player.variation.gte(5)){
            player.variation = new Decimal(5);
            $("#varbox").fadeOut(1000);
            $("#splbox").fadeIn(1000);
        }
        update();
    });
    $("#split").click(function (e) {
        if(player.glucose.lt(1)){
            return;
        }
        player.glucose = player.glucose.sub(1);
        player.number = player.number.mul(1.5);
        if(player.number.gte(1e6)){
            player.number = player.number.sub(1e6).pow(0.99).add(1e6);
        }
        player.showBoard = true;
        if(player.number.gte(5)){
            $(".resourcebox").fadeIn(1000);
        }
        if(player.glucose.lte(5)){
            $("#splhint").fadeIn(1000);
            $("#gluresbox").fadeIn(1000);
        }
        if(player.glucose.eq(0)){
            $("#vesbox").fadeIn(1000);
            $("#vesresbox").fadeIn(1000);
        }
        if(player.number.gte(2e9)){
            $("#upgrades").fadeIn(1000);
        }
        update();
    });
    $("#vessel").click(function (e) {
        if(player.number.lt(Decimal.pow(400, player.vessel.plus(1)))){
            return;
        }
        player.number = player.number.sub(Decimal.pow(400, player.vessel.plus(1)));
        player.vessel = player.vessel.plus(1);
        player.vesselspeed = player.vesselspeed.plus(1);
        update();
    });
    $("#up11").click(function (e) {
        if(player.up11){
            return;
        }
        if(player.number.lt(20e9)){
            return;
        }
        player.up11 = true;
        player.number = player.number.sub(20e9);
        $("#up11")[0].classList.add("finished");
        $("#up12").fadeIn(1000);
    });
    $("#up12").click(function (e) {
        if(player.up12){
            return;
        }
        if(player.number.lt(250e15)){
            return;
        }
        player.up12 = true;
        player.number = player.number.sub(250e15);
        $("#up12")[0].classList.add("finished");
    });
    $("#reset").click(function (e) {
        $("#reset").hide();
        $("#resetsure").show();
        setTimeout(() => {
            $("#reset").show();
            $("#resetsure").hide();
        },10000);
    });
    $("#resetsure").click(function (e) {
        localStorage.removeItem("cancer");
        location.reload();
    });
    $("#save").click(function (e) {
        saveToClipboard();
    });
    $("#load").click(function (e) {
        saveFromText();
    });
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
    if(player.variation.gte(5)){
        $("#varbox").hide();
        $("#splbox").show();
    }
    if(player.showBoard){
        $(".resourcebox").show();
    }
    if(player.glucose.lte(5) || player.vessel.gt(0)){
        $("#splhint").show();
        $("#gluresbox").show();
    }
    if(player.glucose.eq(0) || player.vessel.gt(0)){
        $("#vesbox").show();
        $("#vesresbox").show();
    }
    if(player.number.gte(2e9)){
        $("#upgrades").show();
    }
    if(player.up11){
        $("#up11")[0].classList.add("finished");
        $("#up12").show();
    }
    gluplus = new Decimal(0);
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
init();
load();
setTimeout(autoSave,0);
setTimeout(tick,0);