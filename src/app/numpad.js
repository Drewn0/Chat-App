import React, { useEffect } from 'react';
import { Grid2, Button, TextField, Box } from "@mui/material";
import { useState } from "react";
import { socket } from '../socket';

export default function Numpad({ sessionId, setSessionId, webhook }) {
    const [display, setDisplay] = useState("");
    const [Calling, setCalling] = useState(false);
    const [calledNumbers, setCalledNumbers] = useState([]);

    useEffect(() => {

        const handleKeyDown = (event) => {
            const allowedKeys = "0123456789*#+";
            if (allowedKeys.includes(event.key)) {
                setDisplay((prevDisplay) => prevDisplay + event.key);
            } else if (event.key === "Backspace") {
                setDisplay((prevDisplay) => prevDisplay.slice(0, -1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, []);

    console.log('Numpad sessionId:', sessionId);

    const data = webhook
    const eventSessionId = ((data['data'] || {})['payload'] || {})['client_state'] || 'none'
    const cos = atob(eventSessionId);
    console.log('eventSessionId:', cos, 'sessionId:', sessionId);
    if (cos == sessionId && Calling == true) {
        if (data['data']['event_type'] === 'call.hangup') {
            setDisplay("Call Ended");
            setCalling((n) => false);
            setSessionId((n) => null);
        }
    }


    const append_Click = (value) => {
        setDisplay(display + value);
    };

    const call = () => {
        setDisplay("Calling...");
        setCalling(true);

        socket.emit("call", { phone_number: display }, (response) => {
            console.log('call response:', response);
            if (response["status"] === "ok") {
                setSessionId(response['session_id']);
                sessionId = response['session_id'];
                setCalledNumbers((prevNumbers) => [...prevNumbers, display]);

            } else {
                setDisplay("Call Failed");
                setCalling(false);
                setSessionId(null);
            }
        });
    };

    const hangup = () => {
        setDisplay("Hanging up...");
        setCalling(false);

        socket.emit("hangup", { session_id: sessionId }, (response) => {
            if (response["status"] === "ok") {
                setDisplay("Call Ended");
                setSessionId(null);
            }
        });
    };

    const reselectNumber = (number) => {
        setDisplay(number);
    };

    const delete_Click = () => {
        setDisplay("");
    };

    return (
        <Box sx={{ border: "2px solid #1976D2", paddingTop: 2, display: "flex", flexDirection: "column", height: "100%", width: 300 }}>
            <Grid2 container direction="column" sx={{ flex: "1 0 auto" }}>
                <TextField
                    id="outline-basic"
                    label="Wpisz numer"
                    variant="outlined"
                    value={display}
                    sx={{ input: { color: "#1976D2" }, marginBottom: 2 }}
                    InputLabelProps={{
                        style: { color: '#1976D2' }
                    }}
                />
                <Grid2 container direction="row" sx={{ borderTop: "2px solid #1976D2", padding: 2 }}>
                    <Grid2 container direction="column" sx={{ flex: 1 }}>
                        <Button onClick={() => append_Click("1")}>1</Button>
                        <Button onClick={() => append_Click("4")}>4</Button>
                        <Button onClick={() => append_Click("7")}>7</Button>
                        <Button onClick={() => append_Click("*")}>*</Button>
                        <Button onClick={() => call()} disabled={Calling}>Call</Button>
                    </Grid2>
                    <Grid2 container direction="column" sx={{ flex: 1 }}>
                        <Button onClick={() => append_Click("2")}>2</Button>
                        <Button onClick={() => append_Click("5")}>5</Button>
                        <Button onClick={() => append_Click("8")}>8</Button>
                        <Button onClick={() => append_Click("0")}>0</Button>
                        <Button onClick={() => hangup()} disabled={!Calling}>Hangup</Button>
                    </Grid2>
                    <Grid2 container direction="column" sx={{ flex: 1 }}>
                        <Button onClick={() => append_Click("3")}>3</Button>
                        <Button onClick={() => append_Click("6")}>6</Button>
                        <Button onClick={() => append_Click("9")}>9</Button>
                        <Button onClick={() => append_Click("#")}>#</Button>
                        <Button onClick={() => delete_Click()}>Delete</Button>
                    </Grid2>
                    <Grid2 container direction="column" sx={{ flex: 0.5, justifyContent: "center", alignItems: "center" }}>
                        <Button onClick={() => append_Click("+")} sx={{ height: "100%" }}>+</Button>
                    </Grid2>
                </Grid2>
            </Grid2>
            <Box sx={{ borderTop: "2px solid #1976D2", marginTop: 2, flex: "1 1 auto", overflowY: "auto" }}>
                <h3>Called Numbers:</h3>
                <ul>
                    {calledNumbers.map((number, index) => (
                        <li key={index} onClick={() => reselectNumber(number)} style={{ cursor: 'pointer' }}>
                            {number}
                        </li>
                    ))}
                </ul>
            </Box>
        </Box>
    );
}
