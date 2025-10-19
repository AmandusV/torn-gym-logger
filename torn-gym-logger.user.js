// ==UserScript==
// @name         Torn Gym Logger (All Stats)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Logs gym training for all stats to Google Sheets with manual input
// @author       Amandus
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// ==/UserScript==

(function() {
    'use strict';

    const API_KEY = 'YOUR_TORN_API_KEY'; // Replace with your Torn API key
    const GOOGLE_SHEET_WEBHOOK = 'YOUR_WEBHOOK_URL'; // Replace with your Google Apps Script URL

    async function fetchTornData(endpoint, selections) {
        const url = `https://api.torn.com/${endpoint}?selections=${selections}&key=${API_KEY}`;
        const response = await fetch(url);
        return await response.json();
    }

    function createPopupForm(defaults) {
        const form = document.createElement('div');
        form.style.position = 'fixed';
        form.style.top = '50%';
        form.style.left = '50%';
        form.style.transform = 'translate(-50%, -50%)';
        form.style.backgroundColor = '#fff';
        form.style.padding = '20px';
        form.style.border = '2px solid #333';
        form.style.zIndex = '9999';
        form.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        form.innerHTML = `
            <h3>Log Gym Training</h3>
            <label>Stat Trained:</label>
            <select id="stat">
                <option value="strength">Strength</option>
                <option value="speed">Speed</option>
                <option value="dexterity">Dexterity</option>
                <option value="defense">Defense</option>
            </select><br><br>
            <label>Energy Used:</label>
            <input type="number" id="energy" value="${defaults.energy}"><br><br>
            <label>Stat Gain:</label>
            <input type="text" id="gain"><br><br>
            <label>Happy Level:</label>
            <input type="number" id="happy" value="${defaults.happy}"><br><br>
            <label>Points Used:</label>
            <input type="number" id="points"><br><br>
            <label>Booster Used:</label>
            <input type="text" id="booster"><br><br>
            <button id="submitLog">Submit</button>
            <button id="cancelLog">Cancel</button>
        `;
        document.body.appendChild(form);

        document.getElementById('submitLog').onclick = () => {
            const logData = {
                date: new Date().toISOString(),
                stat: document.getElementById('stat').value,
                energyUsed: document.getElementById('energy').value,
                gain: document.getElementById('gain').value,
                happy: document.getElementById('happy').value,
                pointsUsed: document.getElementById('points').value,
                boosterUsed: document.getElementById('booster').value
            };
            sendToGoogleSheet(logData);
            document.body.removeChild(form);
        };

        document.getElementById('cancelLog').onclick = () => {
            document.body.removeChild(form);
        };
    }

    function sendToGoogleSheet(data) {
        GM_xmlhttpRequest({
            method: "POST",
            url: GOOGLE_SHEET_WEBHOOK,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(data),
            onload: function(response) {
                alert("Training logged successfully!");
                console.log("Logged:", response.responseText);
            }
        });
    }

    function addLogButton() {
        const target = document.querySelector('#mainContainer');
        if (!target) return;

        const btn = document.createElement('button');
        btn.innerText = '📋 Log Gym Training';
        btn.style.position = 'fixed';
        btn.style.bottom = '100px'; // Moves it higher above Torn’s bottom bar
        btn.style.right = '20px';
        btn.style.zIndex = '10000'; // Ensures it’s above other UI elements
        btn.style.padding = '10px';
        btn.style.backgroundColor = '#007bff';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

        btn.onclick = async () => {
            const user = await fetchTornData('user', 'energy,happy');
            createPopupForm({ energy: user.energy.current, happy: user.happy });
        };

        target.appendChild(btn);
    }

    window.addEventListener('load', () => {
        setTimeout(addLogButton, 3000);
    });
})();
