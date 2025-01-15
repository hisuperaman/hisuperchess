const socket = io(config.serverURL, {
    reconnectionDelayMax: 10000,
    auth: {
        // token: "123"
    },
    query: {
        // "my-key": "my-value"
    }
});

socket.on('connect', ()=>{

})


export default socket;