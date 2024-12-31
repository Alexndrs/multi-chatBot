const express = require("express");
const { HTTP_STATUS } = require("../utils/http");

class ConvRouter {

    constructor(convManager) {
        this.convManager = convManager;
        this.router = express.Router();
        this.configureRoutes();
    }

    configureRoutes() {

        // Cette route devra être sécurisée avec un token admin
        this.router.get('/', async (req, res) => {
            const allDatas = await this.convManager.getDatas();
            return res.send(allDatas);
        });


        this.router.get('/:convId', async (req, res) => {
            console.log("load conv :", req.params.convId);
            const datas = await this.convManager.getDataById(req.params.convId);
            if (!datas) {
                return res.status(HTTP_STATUS.NOT_FOUND).send({ message: "Conv not found." });
            }
            return res.send(datas);
        });

        this.router.post('/', async (req, res) => {
            const newConv = await this.convManager.addConv(req.body);
            return res.send(newConv);
        });

        this.router.post('/:convId', async (req, res) => {
            const newMessage = await this.convManager.addMessage(req.params.convId, req.body);
            return res.send(newMessage);
        });
    }
}


module.exports = { ConvRouter };