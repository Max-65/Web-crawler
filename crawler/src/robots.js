'use strict'

const axios = require('axios');
const {log} = require('./print');

async function checkRobotsTxt(baseUrl) {
    const disallowedPaths = [];
    let crawlDelay = 200; // default value for delay

    const robotsUrl = new URL(baseUrl + 'robots.txt').href;
    try {
        const response = await axios.get(robotsUrl);
        let robotsText = response.data;
        if (!robotsText) {
            log(`Warning: robots.txt was not found for "${baseUrl}". Default crawl config applied.`);
            return {disallowedPaths, crawlDelay};
        }
        robotsText = robotsText.split('\n');

        for (let line of robotsText) {
            if(line.startsWith('User-agent:') && line !== 'User-agent: *'){
                break;
            }
            if (line.startsWith('Disallow:')) {
                const path = line.split(': ')[1].trim();
                disallowedPaths.push(path);
            }
            else if (line.startsWith('Crawl-delay:')) {
                crawlDelay = parseInt(line.split(': ')[1]) * 1000;
            }
        };
        return {disallowedPaths, crawlDelay};
    }
    catch(error) {
        log('Failed on the request: ' + error.message);
        return {disallowedPaths, crawlDelay};
    }
}

function isUrlAllowed(url, disallowedPaths) {
    const destUrl = new URL(url);
    return !disallowedPaths.some(path => {
        if (path === '') return false;
        return destUrl.pathname.startsWith(path);
    })
}

module.exports = {checkRobotsTxt, isUrlAllowed};