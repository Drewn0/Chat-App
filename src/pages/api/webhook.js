import io from 'socket.io-client';

const socket = io('ws://localhost:3000')
export default async function handler(req, res) {

  if (req.method === 'POST') {
    // Process the webhook payload
    const payload = req.body;
    
    console.log('Webhook received:', payload);

    socket.on('connect', (socket) => {
      console.log('websocket connected connected')
    });

    socket.emit('webhook', payload, (response) => {
      console.log("Emited webhook with response", response.status);
    })
    // Send a response to acknowledge receipt of the webhook
    res.status(200).json({ message: 'Webhook received successfully' });

  } else {
    // Respond with a 405 Method Not Allowed if the method is not POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
