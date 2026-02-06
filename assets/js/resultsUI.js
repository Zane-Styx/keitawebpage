// resultsUI.js
// UI rendering for speed test interpretation results

window.renderResults = function(interpretation) {
    console.log('renderResults called with:', interpretation);
    
    const container = document.getElementById('interpretation-results');
    if (!container) {
        console.error('Results container not found');
        return;
    }
    
    console.log('Container found, rendering results...');
    
    // Hide the OpenSpeedTest UI (object element and the actual SVG)
    const speedTestUI = document.getElementById('OpenSpeedTest-UI');
    if (speedTestUI) {
        speedTestUI.style.visibility = 'hidden';
        speedTestUI.style.display = 'none';
        speedTestUI.style.position = 'absolute';
        speedTestUI.style.zIndex = '-1';
    }
    
    // Hide the actual SVG element that replaces the object
    const svgElement = document.querySelector('body > svg');
    if (svgElement) {
        svgElement.style.display = 'none';
    }
    
    // Hide any visible SVG elements
    document.querySelectorAll('svg').forEach(svg => {
        if (svg.parentElement && svg.parentElement.id !== 'interpretation-results') {
            svg.style.display = 'none';
        }
    });
    
    // Hide loading spinner
    const loadingApp = document.getElementById('loading_app');
    if (loadingApp) {
        loadingApp.style.display = 'none';
    }
    
    // Hide credits
    const credits = document.querySelector('.Credits');
    if (credits) {
        credits.style.display = 'none';
    }
    
    // Only notify parent if this is manual input (not built-in test)
    // Check if we're in an iframe and if the interpretation has manualInput flag
    if (window.parent && window.parent !== window && interpretation.manualInput) {
        if (window.parent.hideSpeedTestShowResults) {
            window.parent.hideSpeedTestShowResults();
        }
    }
    
    // Show Try Again button in parent for built-in test
    if (window.parent && window.parent !== window && !interpretation.manualInput) {
        if (window.parent.document.getElementById('tryAgainBtn')) {
            window.parent.document.getElementById('tryAgainBtn').classList.add('visible');
        }
    }

    const limitingFactorLabel = interpretation.limitingFactorLabel || interpretation.limitingFactor || 'metric';
    const gamingLabel = interpretation.capabilities.gaming === '⚠'
        ? 'Online Gaming (higher ping may add lag)'
        : 'Online Gaming';

    const criteria = interpretation.criteria || {
        download: { fair: 10, good: 25, excellent: 100 },
        upload: { fair: 3, good: 10, excellent: 20 },
        ping: { excellent: 20, good: 50, fair: 100 }
    };

    const clampPercent = (value) => Math.max(0, Math.min(100, value));
    const toPercent = (value, max, invert = false) => {
        if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
        const ratio = value / max;
        const percent = invert ? (1 - ratio) * 100 : ratio * 100;
        return clampPercent(percent);
    };

    const downloadMax = criteria.download.excellent || 100;
    const uploadMax = criteria.upload.excellent || 20;
    const pingMax = criteria.ping.fair || 100;
    const chartBars = [
        {
            label: 'Download',
            value: interpretation.metrics.download.value,
            unit: 'Mbps',
            percent: toPercent(interpretation.metrics.download.value, downloadMax)
        },
        {
            label: 'Upload',
            value: interpretation.metrics.upload.value,
            unit: 'Mbps',
            percent: toPercent(interpretation.metrics.upload.value, uploadMax)
        },
        {
            label: 'Ping',
            value: interpretation.metrics.ping.value,
            unit: 'ms',
            percent: toPercent(interpretation.metrics.ping.value, pingMax, true)
        }
    ];

    const html = `
        <div class="interpretation-container">
            <div class="result-section overall-rating">
                <h2 class="rating-badge rating-${interpretation.overallRating.toLowerCase()}">
                    ${interpretation.overallRating} Connection
                </h2>
            </div>

            <div class="result-section test-summary">
                <h3>📊 TEST SUMMARY</h3>
                <p class="summary-text">${interpretation.summary}</p>
            </div>

            <div class="result-section metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-icon">⬇️</span>
                        <span class="metric-name">Download</span>
                    </div>
                    <div class="metric-value">${interpretation.metrics.download.value.toFixed(2)} <span class="unit">Mbps</span></div>
                    <div class="metric-rating rating-${interpretation.metrics.download.rating.toLowerCase()}">
                        ${interpretation.metrics.download.rating}
                    </div>
                    <p class="metric-explanation">${interpretation.metrics.download.explanation}</p>
                    <p class="metric-reason">${interpretation.metrics.download.reason}</p>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-icon">⬆️</span>
                        <span class="metric-name">Upload</span>
                    </div>
                    ${interpretation.metrics.upload.value > 0 ? `
                        <div class="metric-value">${interpretation.metrics.upload.value.toFixed(2)} <span class="unit">Mbps</span></div>
                        <div class="metric-rating rating-${interpretation.metrics.upload.rating.toLowerCase()}">
                            ${interpretation.metrics.upload.rating}
                        </div>
                        <p class="metric-explanation">${interpretation.metrics.upload.explanation}</p>
                        <p class="metric-reason">${interpretation.metrics.upload.reason}</p>
                    ` : `
                        <div class="metric-value" style="font-size: 14px; color: #a0a0a0;">Not Available</div>
                        <div class="metric-rating" style="background: rgba(255, 193, 7, 0.15); color: #ffc107; border-color: #ffc107;">
                            Limited
                        </div>
                        <p class="metric-explanation" style="font-size: 13px;">Due to the limitations of free web hosting, we are currently unable to perform upload speed tests.</p>
                    `}
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-icon">📡</span>
                        <span class="metric-name">Ping</span>
                    </div>
                    <div class="metric-value">${interpretation.metrics.ping.value.toFixed(0)} <span class="unit">ms</span></div>
                    <div class="metric-rating rating-${interpretation.metrics.ping.rating.toLowerCase()}">
                        ${interpretation.metrics.ping.rating}
                    </div>
                    <p class="metric-explanation">${interpretation.metrics.ping.explanation}</p>
                    <p class="metric-reason">${interpretation.metrics.ping.reason}</p>
                </div>
            </div>

            <div class="result-section">
                <h3>📈 METRIC CHARTS</h3>
                <div style="display: grid; gap: 12px;">
                    ${chartBars.map(bar => `
                        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #e5e7eb; margin-bottom: 6px;">
                                <span>${bar.label}</span>
                                <span>${Number.isFinite(bar.value) ? bar.value.toFixed(bar.unit === 'ms' ? 0 : 2) : '0'} ${bar.unit}</span>
                            </div>
                            <div style="height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;">
                                <div style="height: 100%; width: ${bar.percent.toFixed(0)}%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"></div>
                            </div>
                            <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 6px;">
                                Reference max: ${bar.label === 'Download' ? downloadMax : bar.label === 'Upload' ? uploadMax : pingMax} ${bar.unit}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="result-section why-rating">
                <h3>❓ WHY THIS RATING</h3>
                <p class="explanation-text"><strong>Your ${limitingFactorLabel} is the limiting factor.</strong></p>
                <p class="explanation-text">${interpretation.ratingExplanation}</p>
            </div>

            <div class="result-section real-world">
                <h3>🌐 WHAT YOU MAY NOTICE</h3>
                <pre class="impact-list">${interpretation.realWorldImpact}</pre>
            </div>

            <div class="result-section capabilities">
                <h3>⚡ WHAT YOU CAN DO WITH YOUR SPEED</h3>
                <div class="capabilities-grid">
                    <div class="capability-item">
                        <span class="capability-icon">${interpretation.capabilities.streaming4K}</span>
                        <span>4K Streaming</span>
                    </div>
                    <div class="capability-item">
                        <span class="capability-icon">${interpretation.capabilities.streamingHD}</span>
                        <span>HD Streaming</span>
                    </div>
                    <div class="capability-item">
                        <span class="capability-icon">${interpretation.capabilities.videoCallsHD}</span>
                        <span>HD Video Calls</span>
                    </div>
                    <div class="capability-item">
                        <span class="capability-icon">${interpretation.capabilities.gaming}</span>
                        <span>${gamingLabel}</span>
                    </div>
                    <div class="capability-item">
                        <span class="capability-icon">${interpretation.capabilities.competitiveGaming}</span>
                        <span>Competitive Gaming</span>
                    </div>
                    <div class="capability-item">
                        <span class="capability-icon">${interpretation.capabilities.cloudSync}</span>
                        <span>Fast Cloud Sync</span>
                    </div>
                </div>
                
                <div class="download-times">
                    <h4>Estimated Download Times:</h4>
                    <ul>
                        <li>1 GB file: <strong>${interpretation.capabilities.downloadTime1GB}</strong></li>
                        <li>100 MB file: <strong>${interpretation.capabilities.downloadTime100MB}</strong></li>
                    </ul>
                </div>
            </div>

            <div class="result-section advice">
                <h3>💡 RECOMMENDED ACTIONS</h3>
                <pre class="advice-text">${interpretation.advice}</pre>
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
    
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('Results rendered and displayed');
};

// Hide results
window.hideResults = function() {
    const container = document.getElementById('interpretation-results');
    if (container) {
        container.style.display = 'none';
    }
    
    // Show the OpenSpeedTest UI again
    const speedTestUI = document.getElementById('OpenSpeedTest-UI');
    if (speedTestUI) {
        speedTestUI.style.visibility = 'visible';
        speedTestUI.style.display = 'block';
        speedTestUI.style.position = 'static';
        speedTestUI.style.zIndex = 'auto';
    }
    
    // Show SVG elements again
    const svgElement = document.querySelector('body > svg');
    if (svgElement) {
        svgElement.style.display = 'block';
    }
    
    document.querySelectorAll('svg').forEach(svg => {
        svg.style.display = 'block';
    });
    
    // Show loading spinner
    const loadingApp = document.getElementById('loading_app');
    if (loadingApp) {
        loadingApp.style.display = 'block';
    }
    
    // Show credits
    const credits = document.querySelector('.Credits');
    if (credits) {
        credits.style.display = 'block';
    }
};
