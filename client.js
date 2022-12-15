const OS = require("os");
const TLS = require("tls");
const Net = require("net");
const MessageReader = require("./message_reader.js");

class Client {
    constructor(host = "smtp.gmail.com", port = 465, isTLS = true) {
        this._host = host;
        this._port = port;
        this._isTLS = isTLS;
        this._localHost = OS.hostname();
    }

    connect() {
        if (this._isTLS) {
            this._socket = TLS.connect({
                host: this._host,
                port: this._port,
                servername: this._host
            });
        } else {
            this._socket = Net.createConnection({
                host: this._host,
                port: this._port
            });
        }

        this._messageParser = new MessageReader();

        this._socket.on("data", this._messageParser.pipe.bind(this._messageParser));
        this._socket.on("error", error => console.log("disconnected from server:", error));

        return new Promise((resolve, reject) => {
            this._messageParser.once("message", message => resolve(message));
        });
    }

    helo() {
        return this._command(`HELO ${this._localHost}`);
    }

    mailFrom(email) {
        return this._command(`MAIL FROM:<${email}>`);
    }

    rcptTo(email) {
        return this._command(`RCPT TO:<${email}>`);
    }

    quit() {
        return this._command("QUIT");
    }

    disconnect() {
        this._socket.destroy();
    }

    _command(cmd) {
        return new Promise((resolve, reject) => {
            this._socket.write(cmd + "\r\n");

            this._messageParser.once("message", message => resolve(message));
        });
    }
}
module.exports = Client;

const test = async () => {
    const client = new Client();

    console.log(
        await client.connect() + "\n" +
        await client.helo() + "\n" +
        await client.mailFrom("artbruh@gmail.com") + "\n" +
        await client.rcptTo("ortur@bruh.com") + "\n" +
        await client.rcptTo("testing@mail.com") + "\n" +
        await client.quit()
    );

    client.disconnect();
}

test();

/*
const host = process.argv[2] || "smtp.gmail.com";
const port = process.argv[3] || 465;

const socket = new Socket();
// const socket = TLS.connect({ host, port, servername: host }, () => {});
socket.connect({ host, port }, () => {});

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

    if(args[0] === "221") {
        socket.destroy();
    }

    console.log(message);
}) */






