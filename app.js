const FS = require("fs");
const Client = require("./libs/client");
const parseEmail = require('mailparser').simpleParser;

module.exports = class App {
    constructor() {
        this._config = require("./app_config.json");

        this.client = new Client(this._config.connection);
    }

    async _connect() {
        this._handleResponse(await this.client.connect());

        console.log(
            `Client connected to ${this._config.connection.host}` +
            ` on port ${this._config.connection.port}`
        );

        this._handleResponse(await this.client.ehlo());
    }

    async _auth() {
        this._handleResponse(await this.client.auth());
        this._handleResponse(await this.client.login(this._config.auth.login));
        this._handleResponse(await this.client.password(this._config.auth.password));
    }

    async _sendEmail(data) {
        const parsedEmail = await parseEmail(data);

        this._handleResponse(await this.client.mailFrom(parsedEmail.from.value[0].address));
        this._handleResponse(await this.client.rcptTo(parsedEmail.to.value[0].address));

        for (const value of parsedEmail.cc.value) {
            this._handleResponse(await this.client.rcptTo(value.address));
        }

        this._handleResponse(await this.client.data());
        this._handleResponse(await this.client.send(data));
    }

    async run() {
        await this._connect();
        await this._auth();
        await this._sendEmail(FS.readFileSync(this._config.emailPath, {encoding: "utf-8"}));

        this._handleResponse(await this.client.quit());
        this.stop();
        console.log("Email sent successfully!");
    }

    stop() {
        this.client.disconnect()
    }

    _handleResponse(response) {
        if (!response.ok) {
            throw response.info;
        }
    }
}
