// Log messages are printed with current date
function log(message) {
    process.stdout.write(`[${(new Date).toISOString()}] ${message}\n`);
}

module.exports = {log};