const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require("socket.io");

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(server);

    io.on('connection', socket => {
        console.log('Client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('webhook', (data) => {
            console.log('server recieved webhook with ', data);
            io.emit('webhook-server', data);
        });

        socket.on('call', (data, callback) => {
            console.log('Received call with ', data);
            fetch("https://4960-176-111-123-203.ngrok-free.app/api/call", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone_number: data.phone_number })
            })
                .then(response => response.json())
                .then(response => {
                    console.log('Call response ', response);
                    if (callback) {
                        callback(response);
                    }
                })
                .catch(error => {
                    console.error('Error during call:', error);
                    if (callback) {
                        callback({ ok: false, error: 'Call failed' });
                    }
                });
        });

        socket.on('hangup', (data, callback) => {
            console.log('Received hangup with ', data);
            fetch("https://4960-176-111-123-203.ngrok-free.app/api/" + data['session_id'] + '/hangup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
                .then(response => response.json())
                .then(response => {
                    console.log('Hangup response ', response);
                    callback(response);
                });
        });

        socket.on('say', (data, callback) => {
            console.log('Received say with ', data);
            fetch("https://4960-176-111-123-203.ngrok-free.app/api/" + data['session_id'] + '/say', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: data['text'] })
            })
                .then(response => response.json())
                .then(response => {
                    console.log('Say responce ', response);
                    callback(response);
                });

        });

    });
    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});