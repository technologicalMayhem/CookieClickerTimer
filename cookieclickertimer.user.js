// ==UserScript==
// @name         Cookie Clicker Timer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://orteil.dashnet.org/cookieclicker/
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getBankTime() {
    var time = (Game.cookies / Game.unbuffedCps );

    var years = Math.floor(time / 31536000);
    time -= years * 31536000;
    var days = Math.floor(time / 86400);
    time -= days * 86400;
    var hours = Math.floor(time / 3600);
    time -= hours * 3600;
    var minutes = Math.floor(time / 60);
    time -= minutes * 60;
    var seconds = Math.floor(time);

    var times = [
        {time: years, word: "years"},
        {time: days, word: "days"},
        {time: hours, word: "hours"},
        {time: minutes, word: "minutes"},
        {time: seconds, word: "seconds"}
    ];
    var count = 0;
    for (let i = 0; i < times.length; i++) {
        const element = times[i];
        if (element.time === 0) count++;
        else break;
    }
    times.splice(0, count);
    var text = [];
    times.forEach(val => text.push(`${new String(val.time).padStart(2,'0')} ${val.word}`));
    return text.slice(0, 3).join(", ");
}

function updateBankTime() {
    document.getElementById("time").innerHTML = getBankTime();
}

function createBankTimeElement() {
    var div = document.createElement("div");
    div.id = "time";
    div.classList.add("title");
    div.classList.add("monospace");
    div.style.position = "absolute";
    div.style.left = "0px";
    div.style.top = "19%";
    div.style.width = "100%";
    div.style.zIndex = "100";
    div.style.padding = "4px";
    div.style.fontSize = "20px";
    div.style.textAlign = "center";
    div.style.background = "rgba(0,0,0,0.4)";

    document.getElementById("sectionLeft").appendChild(div);
    var t = setInterval(updateBankTime, 50);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

createBankTimeElement();
})();
