'use strict';

const {URL} = require('url');
const axios = require('axios');
const ft = require('./enum/ft');
const {log} = require('./print');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetch(dest) {
    let destURL = new URL(dest);

    try {
        const response = await axios.get(destURL, {
            headers: {'User-Agent': userAgent},
            maxBodyLength: 3 * 1024 * 1024, // up to 3 MB of non-header content
            validateStatus: null
        });
        let code = response.status;
        let codeGroup = Math.floor(code / 100);
        if (codeGroup === 2) {
            return {code, content: response.data, path: destURL.pathname, type: ft.OK};
        }
        else if (codeGroup === 3 && res.headers.location) {
            return {code, location: res.headers.location, type: ft.REDIRECT};
        }
        else {
            return {code, type: ft.NO_DATA};
        }
    }
    catch(error) {
        if (error.code === "ERR_FR_MAX_BODY_LENGTH_EXCEEDED") {
            log("File is too large (> 5MB)");

        }
        else {
            log('Failed on the request: ' + error.message);
        }
    };
}

module.exports = fetch;