// ==UserScript==
// @name         Cookie Clicker Timer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a clock to Cookie Clicker that shows how much 'time' is in the bank right now. Also shows sudden differences.
// @author       You
// @match        orteil.dashnet.org/cookieclicker/
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var Settings = {
        delta: {
            // Should the delta clock be enabled?
            enabled: true,
            // How long to show the delta clock for in ms
            displayTime: 5000,
            // How significant the deviation from the current buffed cps needs to be in order to be considered significant.
            // A value of 5 means, 5 times greates than the cps.
            significantChange: 5,
            // Hex color of the delta clock when the delta is positive
            colorPositive: "#90ee90",
            // Hex color of the delta clock when the delta is negative
            colorNegative: "#ff9580",
        }
    }

    var CookieDelta = {
        // Cookie amount last time the delta was checked. Start out the record with the current amount.
        recordedBank: Game.cookies,
        // When the last check was ran; Unix epoch in ms
        lastCheck: 0,
        // How much change has accumulated; in seconds
        totalDelta: 0,
        // When the clock should dissapear; Unix epoch in ms
        showUntil: 0,
    }

    // HTML Elements relevant to the script.
    var Layout = {
        // The left section. That is the one containing the big cookie.
        sectionLeft: document.getElementById("sectionLeft"),
        // The main element, containing all others.
        main: createMainElement(),
        // The clock showing the current amount of 'time' in the bank.
        bank: createBankElement(),
        // The change in banked 'time' when sudden changes occur.
        delta: createDeltaElement(),
    }

    // Formats the given time, in seconds, into a nice human readable way.
    function formatTime(time) {
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

    function updateBankClock() {
        var time = (Game.cookies / Game.unbuffedCps);
        Layout.bank.innerHTML = formatTime(time);
    }

    function updateDeltaClock() {
        // Get the delta for how much time has passed since the last check
        let timeNow = Date.now();
        let timeDelta = timeNow - CookieDelta.lastCheck;
        CookieDelta.lastCheck = timeNow;

        // Calculate if the differene in the bank since last check
        let diff = Game.cookies - CookieDelta.recordedBank;
        let diffAbs = Math.abs(diff);
        let productionMultiplier = timeDelta * Settings.delta.significantChange / 1000;
        if (diffAbs > Game.cookiesPs * productionMultiplier) {
            let timeDiff = diffAbs / Game.unbuffedCps;
            if (diff > 0) {
                CookieDelta.totalDelta += timeDiff;
            } else {
                CookieDelta.totalDelta -= timeDiff;
            }

            CookieDelta.showUntil = timeNow + Settings.delta.displayTime;
        }

        // Update div and show or hide it depending on timer
        if (CookieDelta.showUntil > timeNow) {
            let sign = CookieDelta.totalDelta > 0 ? "+ " : "- ";
            let color = CookieDelta.totalDelta > 0 ? Settings.delta.colorPositive : Settings.delta.colorNegative;
            Layout.delta.innerHTML = sign + formatTime(Math.abs(CookieDelta.totalDelta));
            Layout.delta.style.height = "1em";
            Layout.delta.style.color = color;
        } else {
            Layout.delta.style.height = "0em";
            CookieDelta.totalDelta = 0;
        }

        // Update the record
        CookieDelta.recordedBank = Game.cookies;
    }

    // Create the main element housing all other elements
    function createMainElement() {
        var div = document.createElement("div");

        div.id = "CCT.main";
        div.classList.add("title");
        div.style.position = "absolute";
        div.style.left = "0px";
        div.style.top = "19%";
        div.style.width = "100%";
        div.style.zIndex = "100";
        div.style.padding = "4px";
        div.style.background = "rgba(0,0,0,0.4)";

        return div;
    }

    // Creates element for the bank clock
    function createBankElement() {
        return createTextElement("CCT.clock");
    }

    // Create the element for the delta clock
    function createDeltaElement() {
        let delta = createTextElement("CCT.delta");

        delta.style.transition = "height 600ms ease 0s";
        delta.style.overflow = "hidden";
        delta.style.height = "0em";
        delta.style.paddingRight = "2ch";

        return delta;
    }

    // Creates a simple element to hold text
    function createTextElement(id) {
        var div = document.createElement("div");

        div.id = id;
        div.classList.add("monospace");
        div.style.fontSize = "20px";
        div.style.textAlign = "center";

        return div;
    }

    // Set everything up
    function setup() {
        //Setup the layout
        Layout.sectionLeft.appendChild(Layout.main);
        Layout.main.appendChild(Layout.bank);
        Layout.main.appendChild(Layout.delta);

        //Start repeating functions
        var bankClock = setInterval(updateBankClock, 50);
        if (Settings.delta.enabled) {
            var deltaClock = setInterval(updateDeltaClock, 50);
        }
    }

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    setup();
})();
