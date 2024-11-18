// ==UserScript==
// @name         Naturgy Intercept dataLayer Events with Dynatrace v2
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Intercept dataLayer events and send selected ones to Dynatrace
// @match        *://*naturgy*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to intercept dataLayer.push once dataLayer is available
    function interceptDataLayerPush() {
        const originalPush = window.dataLayer.push;

        window.dataLayer.push = function(...args) {
            console.log("DataLayer push intercepted:", args);

            // Check if the payload contains an 'event' field with 'naturgy' in its value
            const payload = args[0];
            if (payload && typeof payload.event === "string" && payload.event.includes("naturgy")) {
                if (window.dynatrace && typeof window.dynatrace.sendBizEvent === 'function') {
                    window.dynatrace.sendBizEvent('naturgy-omega', payload);
                    console.log("Event sent to Dynatrace:", payload);
                } else {
                    console.warn("Dynatrace object or sendBizEvent function not found.");
                }
            }

            // Call the original dataLayer.push function
            return originalPush.apply(window.dataLayer, args);
        };
    }

    // Wait for dataLayer to be defined, then intercept
    function waitForDataLayer() {
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
            interceptDataLayerPush();
        } else {
            // Retry after a short delay if dataLayer is not yet defined
            setTimeout(waitForDataLayer, 500);
        }
    }

    // Start checking for dataLayer
    waitForDataLayer();

})();
