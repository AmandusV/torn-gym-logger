// ==UserScript==
// @name         Torn Gym Logger (Manual Entry)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Logs gym training manually to Google Sheets via popup form
// @author       Amandus
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// ==/UserScript==

(function() {
    'use strict';

    const GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyiO3AN6Bv7muyzfDbn9SploSfIZ6W181ullVX-j3cbftTpupU74NK28ma0a8rcmLpt2g/exec';

    function createPopupForm() {
        const form = document.createElement('div');
        form.style.position = 'fixed';
        form.style.top = '50%';
        form.style.left = '50%';
        form.style.transform = 'translate(-50%, -50%)';
        form.style.backgroundColor = '#fff';
        form.style.padding = '20px';
        form.style.border = '2px solid #333';
        form.style.zIndex = '10000';
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
            <input type="number" id="energy"><br><br>
            <label>Stat Gain:</label>
            <input type="text" id="gain"><br><br>
            <label>Happy Level:</label>
            <input type="number" id="happy"><br><br>
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
    console.log("Sending data to webhook:", data);

    try {
        GM_xmlhttpRequest({
            method: "POST",
            url: GOOGLE_SHEET_WEBHOOK,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(data),
            onload: function(response) {
                console.log("Webhook response status:", response.status);
                console.log("Webhook response text:", response.responseText);

                if (response.status === 200 && response.responseText.includes("Success")) {
                    alert("Training logged successfully!");
                } else {
                    alert("Webhook error: " + response.responseText);
                }
            },
            onerror: function(error) {
                console.error("Webhook error:", error);
                alert("Logging failed. Check webhook URL.");
            }
        });
    } catch (err) {
        console.error("Unexpected error during GM_xmlhttpRequest:", err);
        alert("Unexpected error occurred while logging.");
    }
}

    function addLogButton() {
        const btn = document.createElement('button');
        btn.innerText = '📋 Log Gym Training';
        btn.style.position = 'fixed';
        btn.style.bottom = '100px';
        btn.style.right = '20px';
        btn.style.zIndex = '10000';
        btn.style.padding = '10px';
        btn.style.backgroundColor = '#007bff';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

        btn.onclick = () => {
            createPopupForm();
        };

        document.body.appendChild(btn);
        console.log("📋 Log Gym Training button added.");
    }

    window.addEventListener('load', () => {
        setTimeout(addLogButton, 5000);
    });
})();
