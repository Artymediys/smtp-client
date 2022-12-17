const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
    banner: "Helo ma bruda",
    authOptional: true

});

server.listen(465);