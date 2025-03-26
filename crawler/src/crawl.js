'use strict'



const {normalize} = require('./utils');
const {log} = require('./print');
const fetch = require('./fetch');
const extract = require('./extract');
const {checkRobotsTxt, isUrlAllowed} = require('./robots.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function crawl(start, limit = 20) {
    let cache = {};
    let id = 0;
    let carry = 0;
    let count = 0;
    let pages = [];
    let links = [];
    log(`Start crawl "${start}" with limit ${limit}`);
    
    return new Promise((resolve, reject) => {
        !async function curl(src, dest) {
            let destNorm = normalize(dest);
            // if dest is root page, check robots.txt
            let disallowedPaths = [], crawlDelay = 200;
            if (src === null) {
                ({disallowedPaths, crawlDelay} = await checkRobotsTxt(destNorm));
            }

            if (!isUrlAllowed(destNorm, disallowedPaths)) {
                log(`Url "${destNorm}" is not allowed for parsing in robots.txt`);
            }
            else if (destNorm in cache === false) {
                if (count + 1 > limit) {
                    return;
                }
                cache[destNorm] = ++id;
                let page = {id, url: destNorm};
                count++;
                carry++;

                log(`Request (#${page.id}) "${destNorm}"`);
                fetch(destNorm)
                    .then(fetched => {
                        log(`Fetched (#${page.id}) "${destNorm}" with code ${fetched.code}`);
                        page.code = fetched.code;
                        extract(fetched, destNorm, start).forEach(ln => curl(destNorm, ln));
                    })
                    .catch(err => {
                        log(`Fetched (#${page.id}) "${destNorm}" with error ${err.message}`);
                        page.code = null;
                    })
                    .finally(() => {
                        pages.push(page);
                        // resolve the result on the last response
                        if (--carry === 0) {
                            log(`Finish crawl "${start}" on count ${count}`);
                            resolve({
                                pages: pages.sort((p1, p2) => p1.id - p2.id),
                                links: links.sort((l1, l2) => l1.from - l2.from || l1.to - l2.to),
                                count,
                                fin: count < limit
                            });
                        }
                    });
            }
            // save the link if is not root
            if (src !== null) {
                let srcNorm = normalize(src);
                links.push({from: cache[srcNorm], to: cache[destNorm], link: dest});
            }
            delay(crawlDelay);
        }(null, start);
    });
}

module.exports = crawl;