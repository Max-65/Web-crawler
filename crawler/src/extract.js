'use strict'

const url = require('url');
const {JSDOM} = require('jsdom');

const {inScope} = require('./utils');
const ft = require('./enum/ft');

function extractRaw(fetched) {
    switch (fetched.type) {
        case ft.OK:
            let document = new JSDOM(fetched.content).window.document;
            let elements = document.getElementsByTagName('A');
            return Array.from(elements)
                .map(el => el.getAttribute('href'))
                .filter(href => typeof href === 'string')
                .map(href => href.trim())
                .filter(Boolean);

        case ft.REDIRECT:
            return [fetched.location];
            
        case ft.NO_DATA:
        default:
            return [];
    }
}

function extract(fetched, src, base) {
    return extractRaw(fetched)
        .map(href => url.resolve(src, href))
        .filter(dest => /^https?\:\/\//i.test(dest))
        .filter(dest => inScope(dest, base));
}

module.exports = extract;