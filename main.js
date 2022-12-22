const App = require("./app.js");

const app = new App();
app.run().catch(error => {
    console.log(error)
    app.stop();
});