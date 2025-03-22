'use strict'

function getLowerHost(dest) {
    return (new URL(dest)).hostname.toLowerCase();
}

function inScope(dest, base) {
    let destHost = getLowerHost(dest);
    let baseHost = getLowerHost(base);
    let i = destHost.indexOf(baseHost);
    return i === 0 || destHost[i-1] === '.';
}

function normalize(dest) {
    let destURL = new URL(dest);
    let origin = destURL.protocol + '//' + destURL.hostname;
    if (destURL.port && (!/^https?\:/i.test(destURL.protocol) || ![80, 8080, 443].includes(+destURL.port))) {
        origin += ':' + destURL.port;
    }
    let path = destURL.pathname + destURL.search;

    return origin.toLowerCase()
        + path.replace(/%([0-9a-f]{2})/ig, (_, es) => '%' + es.toUpperCase());
}

module.exports = {inScope, normalize};