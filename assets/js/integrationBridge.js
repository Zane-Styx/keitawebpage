// integrationBridge.js
// Bridge between OpenSpeedTest and the interpretation system

// Store the original OpenSpeedTest namespace
const OriginalOpenSpeedTest = window.OpenSpeedTest || {};

// Flag to track if we've already captured results
let resultsCaptured = false;

// Function to capture OpenSpeedTest results and display interpretation
function captureAndInterpretResults() {
    // This will be called after the speed test completes
    // We need to extract data from the OpenSpeedTest variables
    
    // Add a listener for when the test completes
    const checkInterval = setInterval(() => {
        // Look for the results in the global scope
        // OpenSpeedTest stores results in global variables
        if (typeof downloadSpeed !== 'undefined' && 
            typeof uploadSpeed !== 'undefined' && 
            typeof pingEstimate !== 'undefined' && 
            downloadSpeed > 0 && !resultsCaptured) {
            
            resultsCaptured = true;
            clearInterval(checkInterval);
            
            // Create results object
            const results = {
                download: downloadSpeed || 0,
                upload: uploadSpeed || 0,
                ping: pingEstimate || 0,
                downloadData: (dataUsedfordl / 1048576) || 0, // Convert to MB
                uploadData: (dataUsedforul / 1048576) || 0 // Convert to MB
            };
            
            console.log('Speed test completed:', results);
            
            // Interpret the results
            const interpretation = window.interpretSpeedTest(results);
            
            // Render the interpretation
            window.renderResults(interpretation);
            
            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.getElementById('interpretation-results');
                if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    }, 1000);
    
    // Stop checking after 5 minutes
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 300000);
}

// Alternative method: Monitor for test completion via DOM changes
function monitorTestCompletion() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Check if the speed test has completed by looking for status text
            const statusElements = document.querySelectorAll('[id*="status"], [id*="Status"]');
            statusElements.forEach(el => {
                if (el.textContent.includes('All done') && !resultsCaptured) {
                    console.log('Test completion detected via DOM');
                    captureAndInterpretResults();
                }
            });
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
    });
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('Speed Test Interpreter loaded');
    
    // Start monitoring
    monitorTestCompletion();
    
    // Also start periodic checking
    setTimeout(() => {
        captureAndInterpretResults();
    }, 2000);
});

// Reset flag when starting a new test
document.addEventListener('click', (e) => {
    if (e.target.id === 'startButtonDesk' || 
        e.target.id === 'startButtonMob' ||
        e.target.closest('#startButtonDesk') ||
        e.target.closest('#startButtonMob')) {
        console.log('New test starting - resetting results');
        resultsCaptured = false;
        window.hideResults();
    }
});

// Listen for Enter key (OpenSpeedTest also starts on Enter)
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        resultsCaptured = false;
        window.hideResults();
    }
});
