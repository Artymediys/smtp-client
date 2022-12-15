const readlinePromises = require("readline/promises");
const Client = require("./client.js");

module.exports = class CLI {
	constructor() {
		this._ReadLine = readlinePromises.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	start () {
		this._ReadLine.question("Input a hostname:port: ")
			.then(answer => {
				const [host, port] = answer.split(':');
				this._host = host;
				this._port = port;

				console.log(`Host ${this._host} and port ${this._port} are saved\n`)
			})
			.catch(error => { console.log("incorrect data inputted:", error) });

		this._ReadLine.question("Do you wanna use TLS/SSL? (y/n): ")
			.then(answer => { this._isTLS = answer === 'y'; })
			.catch(error => { console.log("incorrect data inputted:", error) });

		return new Client(this._host, this._port, this._isTLS);
	}
}
