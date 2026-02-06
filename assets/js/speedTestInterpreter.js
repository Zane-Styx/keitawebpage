// speedTestInterpreter.js
// Consumer-focused internet speed test interpretation system

// Disable OpenSpeedTest default results redirect (handled by custom UI)
window.OST_DISABLE_RESULT_REDIRECT = true;

// Main interpretation function - exposed globally
window.interpretSpeedTest = function(results) {
    const normalized = normalizeResults(results);
    const { download, upload, ping, downloadData, uploadData } = normalized;

    // Metric Rating System
    const downloadRating = rateDownload(download);
    const uploadRating = rateUpload(upload);
    const pingRating = ratePing(ping);
    // Overall Connection Rating (worst of critical metrics, excluding N/A ratings)
    const ratingsToConsider = [downloadRating, pingRating];
    if (uploadRating !== 'N/A') ratingsToConsider.push(uploadRating);
    const overallRating = getOverallRating(...ratingsToConsider);

    // Limiting Factor Detection
    const limitingFactor = detectLimitingFactor(
        { download: downloadRating, upload: uploadRating, ping: pingRating },
        overallRating
    );

    // Generate Human-Readable Test Summary
    const summary = generateSummary(normalized, overallRating);

    // Why this rating explanation
    const ratingExplanation = generateRatingExplanation(limitingFactor, normalized, overallRating);

    // Real-world impact
    const realWorldImpact = generateRealWorldImpact(normalized);

    // Actionable Advice
    const advice = generateAdvice(limitingFactor, normalized);

    // Usage Capability Estimation
    const capabilities = calculateCapabilities(normalized);

    // Detailed metric explanations
    const metrics = {
        download: {
            value: download,
            rating: downloadRating,
            explanation: getMetricExplanation('download', download, downloadRating),
            reason: getMetricReason('download', download, downloadRating)
        },
        upload: {
            value: upload,
            rating: uploadRating,
            explanation: getMetricExplanation('upload', upload, uploadRating),
            reason: getMetricReason('upload', upload, uploadRating)
        },
        ping: {
            value: ping,
            rating: pingRating,
            explanation: getMetricExplanation('ping', ping, pingRating),
            reason: getMetricReason('ping', ping, pingRating)
        }
    };

    const criteria = {
        download: { fair: 10, good: 25, excellent: 100 },
        upload: { fair: 3, good: 10, excellent: 20 },
        ping: { excellent: 20, good: 50, fair: 100 }
    };

    // Return structured result
    return {
        summary,
        overallRating,
        limitingFactor,
        limitingFactorLabel: toTitleCase(limitingFactor),
        ratingExplanation,
        realWorldImpact,
        advice,
        capabilities,
        metrics,
        criteria,
        raw: normalized
    };
};

// Convenience handler: interpret + render
window.handleSpeedTestResults = function(results) {
    console.log('handleSpeedTestResults called with:', results);
    try {
        const interpretation = window.interpretSpeedTest(results);
        console.log('Interpretation generated:', interpretation);
        if (window.renderResults) {
            window.renderResults(interpretation);
        } else {
            console.error('renderResults function not found');
        }
    } catch (error) {
        console.error('Failed to interpret speed test results:', error);
    }
};

// Rating functions
function rateDownload(download) {
    if (download >= 100) return 'Excellent';
    if (download >= 25) return 'Good';
    if (download >= 10) return 'Fair';
    return 'Poor';
}

function rateUpload(upload) {
    if (upload === 0) return 'N/A';  // Upload test disabled
    if (upload >= 20) return 'Excellent';
    if (upload >= 10) return 'Good';
    if (upload >= 3) return 'Fair';
    return 'Poor';
}

function ratePing(ping) {
    if (ping <= 20) return 'Excellent';
    if (ping <= 50) return 'Good';
    if (ping <= 100) return 'Fair';
    return 'Poor';
}

// Overall rating function
function getOverallRating(...ratings) {
    const ratingOrder = ['Poor', 'Fair', 'Good', 'Excellent'];
    return ratings.reduce((worst, current) => {
        return ratingOrder.indexOf(current) < ratingOrder.indexOf(worst) ? current : worst;
    }, 'Excellent');
}

// Limiting factor detection
function detectLimitingFactor(ratings, worstRating) {
    // Return the first metric that matches the worst rating (excluding N/A ratings)
    for (const [metric, rating] of Object.entries(ratings)) {
        if (rating === worstRating && rating !== 'N/A') {
            return metric;
        }
    }
    return null;
}

// Generate summary
function generateSummary(results, overallRating) {
    const dataLine = (results.downloadData > 0)
        ? ` Data used: ${results.downloadData.toFixed(2)} MB down.`
        : '';
    const uploadText = results.upload > 0 
        ? `, upload speed of ${results.upload.toFixed(2)} Mbps, ` 
        : ' (upload test not available), ';
    return `This speed test achieved a download speed of ${results.download.toFixed(2)} Mbps${uploadText}` +
           `ping of ${results.ping.toFixed(0)} ms.${dataLine} Your connection is rated as ${overallRating}.`;
}

// Generate rating explanation
function generateRatingExplanation(limitingFactor, results, overallRating) {
    if (!limitingFactor) {
        return `Your overall rating is ${overallRating} based on the combined performance of all metrics.`;
    }
    const factorName = toTitleCase(limitingFactor);
    const value = results[limitingFactor];
    
    let explanation = `Your overall rating is ${overallRating} because your ${factorName} `;
    
    if (limitingFactor === 'download') {
        explanation += `speed of ${value.toFixed(2)} Mbps is the limiting factor. `;
        if (value < 10) {
            explanation += `This is below the minimum threshold for reliable HD streaming.`;
        } else if (value < 25) {
            explanation += `This is adequate for basic web browsing but may struggle with HD video.`;
        } else if (value < 100) {
            explanation += `This is good for most activities but may not support multiple 4K streams.`;
        }
    } else if (limitingFactor === 'upload') {
        explanation += `speed of ${value.toFixed(2)} Mbps is the limiting factor. `;
        if (value < 3) {
            explanation += `This will cause problems with video calls and cloud backups.`;
        } else if (value < 10) {
            explanation += `This is adequate for basic tasks but may struggle with video calls.`;
        } else if (value < 20) {
            explanation += `This is good for most activities but may limit HD video uploads.`;
        }
    } else if (limitingFactor === 'ping') {
        explanation += `of ${value.toFixed(0)} ms is the limiting factor. `;
        if (value > 100) {
            explanation += `This high latency will cause noticeable delays in online gaming and video calls.`;
        } else if (value > 50) {
            explanation += `This moderate latency may cause occasional delays in real-time applications.`;
        } else if (value > 20) {
            explanation += `This is acceptable for most uses but competitive gaming may feel slightly delayed.`;
        }
    }
    
    return explanation;
}

// Generate real-world impact
function generateRealWorldImpact(results) {
    const { download, upload, ping } = results;
    let impact = [];
    
    // Gaming
    if (ping <= 20) {
        impact.push("✓ Excellent for competitive online gaming");
    } else if (ping <= 50) {
        impact.push("⚠ Acceptable for casual gaming, may have occasional lag");
    } else {
        impact.push("✗ Not recommended for online gaming due to high latency");
    }
    
    // Video Streaming
    if (download >= 25) {
        impact.push("✓ Smooth 4K and HD video streaming");
    } else if (download >= 10) {
        impact.push("⚠ Can handle HD streaming, 4K may buffer");
    } else {
        impact.push("✗ May experience buffering even with SD content");
    }
    
    // Video Calls
    if (upload > 0) {
        if (upload >= 10 && ping <= 50) {
            impact.push("✓ Crystal clear HD video calls");
        } else if (upload >= 3 && ping <= 100) {
            impact.push("⚠ Standard video calls work, HD may be choppy");
        } else {
            impact.push("✗ Video calls will likely be poor quality or unstable");
        }
    } else {
        impact.push("⚠ Video call quality cannot be determined without upload test");
    }
    
    // Web Browsing
    if (download >= 10 && ping <= 100) {
        impact.push("✓ Fast and responsive web browsing");
    } else if (download >= 3) {
        impact.push("⚠ Basic web browsing works but slower than ideal");
    } else {
        impact.push("✗ Web pages will load slowly");
    }
    
    // Cloud/Large Files
    if (upload > 0) {
        if (download >= 100 && upload >= 20) {
            impact.push("✓ Quick cloud syncing and file transfers");
        } else if (download >= 25 && upload >= 10) {
            impact.push("⚠ Cloud syncing works but larger files take time");
        } else {
            impact.push("✗ Cloud uploads and large downloads will be slow");
        }
    } else {
        impact.push("⚠ Cloud upload speed cannot be determined without upload test");
    }
    
    return impact.join('\n');
}

// Generate actionable advice
function generateAdvice(limitingFactor, results) {
    const advice = [];
    
    switch (limitingFactor) {
        case 'ping':
            advice.push("**Immediate Actions:**");
            advice.push("• Restart your router and modem (unplug for 30 seconds)");
            advice.push("• Connect via Ethernet cable instead of Wi-Fi if possible");
            advice.push("• Check for interference from other wireless devices");
            advice.push("• Close bandwidth-heavy applications");
            advice.push("\n**If problems persist:**");
            advice.push("• Contact your ISP to check for line issues");
            advice.push("• Ask about upgrading to a lower-latency connection");
            advice.push("• Consider if distance from server is causing high ping");
            break;
            
        case 'download':
            advice.push("**Immediate Actions:**");
            advice.push("• Check if other devices are using your network");
            advice.push("• Pause any active downloads or streaming");
            advice.push("• Try connecting via Ethernet for more stable speeds");
            advice.push("• Test at different times - peak hours may be slower");
            advice.push("\n**Long-term Solutions:**");
            advice.push("• Consider upgrading your internet plan");
            advice.push("• Contact ISP if speeds are much lower than advertised");
            advice.push("• Upgrade your router if it's more than 3-4 years old");
            break;
            
        case 'upload':
            advice.push("**Immediate Actions:**");
            advice.push("• Check if cloud backups or syncing are running");
            advice.push("• Pause any file uploads or video calls");
            advice.push("• Use Ethernet connection for better upload stability");
            advice.push("\n**Long-term Solutions:**");
            advice.push("• Most plans have lower upload than download - this is normal");
            advice.push("• Consider a plan with higher upload if you frequently video call or upload");
            advice.push("• Business plans often have better upload speeds");
            break;
            
        default:
            advice.push("**Your connection is performing well!**");
            advice.push("• Continue monitoring periodically to ensure consistency");
            advice.push("• Keep your router firmware updated");
            advice.push("• Consider a wired connection for gaming or important work");
    }
    
    return advice.join('\n');
}

// Calculate capabilities and file transfer times
function calculateCapabilities(results) {
    const { download, upload, ping } = results;
    
    // Calculate download times (in seconds)
    // Convert Mbps to MB/s: Mbps / 8
    const downloadMBps = download / 8;
    
    const time1GB = downloadMBps > 0 ? (1024 / downloadMBps) : Infinity;
    const time100MB = downloadMBps > 0 ? (100 / downloadMBps) : Infinity;
    
    // Format time as human-readable
    const format1GB = formatTime(time1GB);
    const format100MB = formatTime(time100MB);
    
    // Determine capabilities
    const capabilities = {
        streaming4K: download >= 25 ? '✓' : '✗',
        streamingHD: download >= 10 ? '✓' : '✗',
        videoCallsHD: upload > 0 ? ((upload >= 5 && ping <= 100) ? '✓' : '✗') : '?',
        videoCallsSD: upload > 0 ? ((upload >= 1.5 && ping <= 150) ? '✓' : '⚠') : '?',
        gaming: (ping <= 50) ? '✓' : (ping <= 100 ? '⚠' : '✗'),
        competitiveGaming: (ping <= 20) ? '✓' : '✗',
        webBrowsing: download >= 5 ? '✓' : '⚠',
        cloudSync: upload > 0 ? ((download >= 10 && upload >= 5) ? '✓' : '⚠') : '?',
        downloadTime1GB: format1GB,
        downloadTime100MB: format100MB
    };
    
    return capabilities;
}

function normalizeResults(results) {
    const safe = results || {};
    return {
        download: toNumber(safe.download),
        upload: toNumber(safe.upload),
        ping: toNumber(safe.ping),
        downloadData: toNumber(safe.downloadData),
        uploadData: toNumber(safe.uploadData)
    };
}

function toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}

function toTitleCase(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// Format time in seconds to human-readable format
function formatTime(seconds) {
    if (seconds === Infinity || isNaN(seconds)) {
        return "N/A";
    }
    
    if (seconds < 1) {
        return "< 1 second";
    } else if (seconds < 60) {
        return `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return secs > 0 ? `${minutes} min ${secs} sec` : `${minutes} min`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.round((seconds % 3600) / 60);
        return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
    }
}

// Get metric explanation
function getMetricExplanation(metric, value, rating) {
    const explanations = {
        download: {
            Excellent: "Your download speed is excellent! You can stream 4K content and download large files quickly.",
            Good: "Your download speed is good for most online activities including HD streaming.",
            Fair: "Your download speed is adequate for basic browsing but may struggle with HD video.",
            Poor: "Your download speed is below recommended levels and will cause slow loading times."
        },
        upload: {
            Excellent: "Your upload speed is excellent! Perfect for video calls, livestreaming, and cloud backups.",
            Good: "Your upload speed is good for video calls and uploading files.",
            Fair: "Your upload speed is adequate for basic tasks but video calls may struggle.",
            Poor: "Your upload speed is very low and will cause problems with video calls and uploads."
        },
        ping: {
            Excellent: "Your ping is excellent! You'll have no noticeable delay in online interactions.",
            Good: "Your ping is good. Most online activities will feel responsive.",
            Fair: "Your ping is acceptable but you may notice delays in gaming or video calls.",
            Poor: "Your ping is high. You'll experience noticeable delays and lag."
        }
    };
    
    return explanations[metric][rating];
}

// Get metric reason
function getMetricReason(metric, value, rating) {
    const reasons = {
        download: {
            Excellent: `At ${value.toFixed(2)} Mbps, you exceed the 100 Mbps threshold for excellent speeds.`,
            Good: `At ${value.toFixed(2)} Mbps, you're above the 25 Mbps threshold for good speeds.`,
            Fair: `At ${value.toFixed(2)} Mbps, you're between 10-25 Mbps which is considered fair.`,
            Poor: `At ${value.toFixed(2)} Mbps, you're below the 10 Mbps minimum for fair speeds.`
        },
        upload: {
            Excellent: `At ${value.toFixed(2)} Mbps, you exceed the 20 Mbps threshold for excellent speeds.`,
            Good: `At ${value.toFixed(2)} Mbps, you're above the 10 Mbps threshold for good speeds.`,
            Fair: `At ${value.toFixed(2)} Mbps, you're between 3-10 Mbps which is considered fair.`,
            Poor: `At ${value.toFixed(2)} Mbps, you're below the 3 Mbps minimum for fair speeds.`
        },
        ping: {
            Excellent: `At ${value.toFixed(0)} ms, you're under the 20 ms threshold for excellent latency.`,
            Good: `At ${value.toFixed(0)} ms, you're between 20-50 ms which is good latency.`,
            Fair: `At ${value.toFixed(0)} ms, you're between 50-100 ms which is fair latency.`,
            Poor: `At ${value.toFixed(0)} ms, you exceed the 100 ms threshold for acceptable latency.`
        }
    };
    
    return reasons[metric][rating];
}