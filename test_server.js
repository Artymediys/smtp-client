const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
    secure: false,
    banner: "Halo ma bruda"
});

server.on("error", err => {
    console.log("Error %s", err.message);
});

server.listen(25);
console.log("started");
