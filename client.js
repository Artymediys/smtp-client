const OS = require("os");
const TLS = require("tls");
const Net = require("net");
const MessageReader = require("./message_reader.js");

module.exports = class Client {
    constructor(host = "smtp.yandex.ru", port = 465, isTLS = true) {
        this._host = host;
        this._port = port;
        this._isTLS = isTLS;
        this._localHost = OS.hostname();

        this._handlerQueue = [];
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

        this._messageParser.on("message", data => {
           const handler = this._handlerQueue.shift();
           if (handler) { handler(this._parseMessage(data)); }
        });

        return new Promise((resolve, reject) => {
            this._handlerQueue.push(message => resolve(message));
        });
    }

    ehlo() {
        return this._command(`EHLO ${this._localHost}`);
    }

    auth() {
        return this._command("AUTH LOGIN");
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

    login(login) {
        return this._command(login);
    }

    password(password) {
        return this._command(password);
    }

    _command(cmd) {
        return new Promise((resolve, reject) => {
            this._socket.write(cmd + "\r\n");

            this._handlerQueue.push(message => resolve(message));
        });
    }

    _parseMessage(data) {
        const statusCode = data.substring(0, 3);
        return {
            ok: Number(statusCode.charAt(0)) <= 3,
            statusCode,
            info: data.substring(4)
        };
    }
}





