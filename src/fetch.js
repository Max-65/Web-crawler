'use strict';

const url = require('url');

const clients = Object.freeze({
    'http:': require('http'),
    'https:': require('https')
});

const ft = require('./enum/ft');
function fetch(dest) {
    let destURL = new URL(dest);
    let client = clients[destURL.protocol];
    if (!client) {
        throw new Error('Could not select a client for ' + destURL.protocol);
    }
    return new Promise((resolve, reject) => {
        let req = client.get(destURL.href, res => {
            let code = res.statusCode;
            let codeGroup = Math.floor(code / 100);
            if (codeGroup === 2) {
                let body = [];
                res.setEncoding('utf8');
                res.on('data', chunk => body.push(chunk));
                res.on('end', () => resolve({code, content: body.join(''), type: ft.OK}));
            }
            else if (codeGroup === 3 && res.headers.location) {
                resolve({code, location: res.headers.location, type: ft.REDIRECT});
            }
            else {
                resolve({code, type: ft.NO_DATA});
            }
        });
        req.on('error', err => reject('Failed on the request: ' + err.message));
        req.end();
    });
}

module.exports = fetch;