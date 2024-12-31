const path = require("path");
const express = require("express");
const cors = require("cors");

const { UserManager } = require("./managers/userManager");
const { UserRouter } = require("./routes/user");
// const { ConvManager } = require("./managers/convManager");
// const { ConvRouter } = require("./routes/conv");




class Server {
    constructor() {
        this.userManager = new UserManager(path.resolve(__dirname, "data/userDB.json"));
        this.userRouter = new UserRouter(this.userManager);
        // this.convManager = new ConvManager(path.resolve(__dirname, "data/userDB.json"));
        // this.convRouter = new ConvRouter(this.convManager);

        this.configureRoutes();
    }

    configureRoutes() {
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json());

        // Routeur de gallerie
        // this.app.use("/conv", this.convRouter.router);
        this.app.use("/user", this.userRouter.router);

        this.app.use("/test", async () => {
            console.log("test");
        });
    }

    launch() {
        const PORT = 5020;
        this.server = this.app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    }
}

const server = new Server();
server.launch()