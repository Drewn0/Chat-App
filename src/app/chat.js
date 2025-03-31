import React, { useState } from 'react';
import { Grid2, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { socket } from '../socket';

export default function Chat({ sessionId, webhook }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    console.log('Chat sessionId:', sessionId);

    const data = webhook
    console.log('Chat webhook-server event received:', data)
    const eventSessionId = ((data['data'] || {})['payload'] || {})['client_state'] || 'none'
    const cos = atob(eventSessionId);
    console.log('eventSessionId:', cos, 'sessionId:', sessionId);
    if (cos == sessionId) {
        console.log('Chat webhook-server event received for my session:', data['data']['event_type'])
        if (data['data']['event_type'] === 'call.transcription' && data['data']['payload']['transcription_data']['is_final'] === true) {
            console.log('payload: ', data['data']['payload']['transcription_data']);
            setMessages([...messages, { text: data['data']['payload']['transcription_data']['transcript'], sender: "Receiver" }]);
        }
    }

    const sendMessage = () => {
        if (input.trim() !== "") {
            setMessages([...messages, { text: input, sender: "Caller" }]);
            speak(input.trim());
            setInput("");
        }
    };
    const speak = (input) => {
        console.log('socket:', socket, 'sessionId:', sessionId);
        if (socket && sessionId) {
            socket.emit('say', { text: input, session_id: sessionId }, (data) => {
                console.log('say event received:', data);
            });
        } else {
            console.log('no socket or sessionId');
        }
    };

    return (
        <Grid2 container direction="row" sx={{ flex: 1, border: "2px solid #1976D2" }}>
            <List sx={{ overflowY: "auto", maxHeight: "370px" }}>
                {messages.map((message, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={`${message.sender}: ${message.text}`} />
                    </ListItem>
                ))}
            </List>
            <Grid2 container direction="column" sx={{ flex: 1, border: "2px solid #1976D2" }}>
                <TextField
                    sx={{ input: { color: "#1976D2" }, borderColor: "#1976D2" }}
                    label="Type a message"
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={sendMessage} sx={{ width: '100%' }}>
                    Say
                </Button>
            </Grid2>
        </Grid2>
    );
}
