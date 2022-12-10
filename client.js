const OS = require("os");
const TLS = require("tls");
const MessageReader = require("./message_reader");


const port = 465;
const host = process.argv[2] || "smtp.gmail.com";

const socket = TLS.connect({ host, port, servername: host }, () => {});

const hostname = OS.hostname();
const messageParser = new MessageReader();

socket.on("data", messageParser.pipe.bind(messageParser));
socket.on("error", error => console.log("disconnected from server:", error));

messageParser.on("message", message => {
    const args = message.split(" ");
    if (args[0] === "220") {
        socket.write(`HELO ${hostname}\r\n`)
    }

    if (args[0] === "250") {
        socket.write("QUIT\r\n");
    }

    console.log(message);
})






