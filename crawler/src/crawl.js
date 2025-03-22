'use strict'

const {normalize} = require('./utils');
const {log} = require('./print');
const fetch = require('./fetch');
const extract = require('./extract');

function crawl(start, limit = 100) {
    let cache = {};
    let id = 0;
    let carry = 0;
    let count = 0;
    let pages = [];
    let links = [];
    log(`Start crawl "${start}" with limit ${limit}`);
    
    return new Promise((resolve, reject) => {
        !function curl(src, dest) {
            let destNorm = normalize(dest);
            if (destNorm in cache === false) {
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
        }(null, start);
    });
}

module.exports = crawl;