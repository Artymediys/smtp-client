const Socket = require("net").Socket;
const MessageReader = require("./message_reader");

const socket = new Socket();
const messageParser = new MessageReader();

socket.on("data", messageParser.pipe.bind(messageParser));
socket.on("error", error => console.log("disconnected from server:", error));

messageParser.on("message", message => {
    const args = message.split(" ");
    if (args[0] === "220") {
        socket.write(`HELO ${args[1]}\r\n`)
    }
    if (args[0] === "250") {
        socket.write("QUIT\r\n");
    }
    console.log(message);

})

const host = process.argv[2] || "localhost";
const port = 25;

socket.connect({ host, port }, () => {

});




