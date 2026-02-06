# Research Website (Celina Plains ISP Study)

## Overview
This project is a research-focused speed test website customized for the Celina Plains ISP performance study. It combines a static landing page with a speed test flow, interpretation logic, and a manual input form to support data collection and analysis.

## How the website is made
### Structure
- Landing page: [index.html](index.html) (research content, methodology, criteria, and footer contacts)
- Speed test page: [hosted.html](hosted.html) (iframe wrapper + manual input modal)
- Speed test runner: [index-speedofme.html](index-speedofme.html) (SpeedOfMe API integration + UI)
- Interpretation logic: [assets/js/speedTestInterpreter.js](assets/js/speedTestInterpreter.js)
- Results rendering: [assets/js/resultsUI.js](assets/js/resultsUI.js)
- Styling: [assets/css/index.css](assets/css/index.css) and other CSS files in assets/css
- Data materials: assets/data (dataset placeholders + codebook + analysis notes)

### Process (high level)
1. The landing page presents the research context, methodology, and criteria.
2. The speed test runs inside an iframe on [hosted.html](hosted.html), using SpeedOfMe in [index-speedofme.html](index-speedofme.html).
3. When a test completes, results are normalized and interpreted in [assets/js/speedTestInterpreter.js](assets/js/speedTestInterpreter.js).
4. The UI is rendered in [assets/js/resultsUI.js](assets/js/resultsUI.js), including summary and charts.
5. Manual results can be entered via the modal in [hosted.html](hosted.html) and interpreted the same way.

### Tech used
- Static HTML/CSS/JavaScript (no framework)
- SpeedOfMe API for automated testing
- Custom interpretation and UI rendering

## How to run
Serve the folder with any static server (or open [index.html](index.html) directly). For best results, use a local web server so the iframe and scripts load consistently.
