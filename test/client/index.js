const {
    getClientWithPort
} = require('../test-config');


const client = getClientWithPort();

client.on('connect', () => {
    console.log('connect')
    // process.exit(1)
});

function handle(signal) {
    console.log(`Received ${signal}`);
}

process.on('SIGTERM', handle);
