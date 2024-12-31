const express = require("express");
const { HTTP_STATUS } = require("../utils/http");

class UserRouter {

    constructor(userManager) {
        this.userManager = userManager;
        this.router = express.Router();
        this.configureRoutes();
    }

    configureRoutes() {

        // Cette route devra être sécurisée avec un token admin
        this.router.get('/', async (req, res) => {
            const allDatas = await this.userManager.getDatas();
            return res.send(allDatas);
        });


        this.router.get('/:userId', async (req, res) => {
            const datas = await this.userManager.getDataById(req.params.userId);
            if (!datas) {
                return res.status(HTTP_STATUS.NOT_FOUND).send({ message: "User not found." });
            }
            return res.send(datas);
        });

        this.router.post('/login', async (req, res) => {
            console.log("try login with :", req.body.mail, req.body.hashedPassword);
            const userInfo = await this.userManager.loginUser(req.body.mail, req.body.password);
            if (!userInfo) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send({ message: "Invalid credentials." });
            }
            const { hashedPassword, ...userWithoutPassword } = userInfo;
            return res.send(userWithoutPassword);
        });

        this.router.post('/add', async (req, res) => {
            const userId = await this.userManager.addUser(req.body.mail, req.body.hashedPassword);
            if (!userId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: "User already exists." });
            }
            return res.send({ userId });
        });
    }
}


module.exports = { UserRouter };