const readlinePromises = require("readline/promises");
const Client = require("./client.js");

module.exports = class CLI {
	constructor() {
		this._ReadLine = readlinePromises.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	async newClient () {
		const [host, port] = (await this._ReadLine.question("Input a hostname:port: ")).split(':');
		const isTLS = (await this._ReadLine.question("Do you wanna use TLS/SSL? (y/n): ")) === 'y';

		this.client = new Client(host, port, isTLS);

		const response = await this.client.connect();
		console.log("Response from server", response);

		console.log(`Client connected to ${host} on port ${port}`);

		await this.run();
		this._ReadLine.close();
	}

	async run() {
		while(true) {
			const command = await this._ReadLine.question("Enter command: ");
			switch (command) {
				case "EHLO":
				case "HELO":
					console.log(await this.client.ehlo());
					break;

				case "AUTH":
					console.log(await this.client.auth());
					break;

				case "LOGIN":
					const login = Buffer.from(
						await this._ReadLine.question("Enter your login: ")
					).toString("base64");

					console.log(await this.client.login(login));
					break;

				case "PASSWORD":
					const password = Buffer.from(
						await this._ReadLine.question("Enter your password: ")
					).toString("base64");

					console.log(await this.client.password(password));
					break;

				case "MAIL FROM":
					const emailFrom = await this._ReadLine.question("Enter sender's email address: ");
					console.log(await this.client.mailFrom(emailFrom));
					break;

				case "RCPT TO":
					const emailTO = await this._ReadLine.question("Enter recipient's email address: ");
					console.log(await this.client.rcptTo(emailTO));
					break;

				case "QUIT":
					console.log(await this.client.quit());
					this.client.disconnect();
					return;

				default:
					console.log("Invalid command, try again");
			}
		}
	}
}