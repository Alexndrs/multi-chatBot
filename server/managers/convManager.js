const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

/**
 * 
 * données d'une conv
 * @typedef {Object} convContent
 * @property {string} convId 
 * @property {string} convTitle
 * @property {Date} lastMessageDate
 * @property {List[message]} messageList
 *  
 * Metadonnées d'un message
 * @typedef {Object} message
 * @property {string} messageID
 * @property {string} messageSender //"user"|"chatbot"
 * @property {string} messageContent 
 * @property {Date} messageDate 
 * 
 */


class ConvManager {
    constructor(path) {
        this.path = path;
    }

    /**
     * Récupère la liste des users
     * @returns {Promise<Object>} la bd
     */
    async getDatas() {
        const fileContent = await fs.readFile(this.path, { encoding: "utf-8" });
        const datas = JSON.parse(fileContent);
        return datas;
    }

    async getDataById(id) {
        const datas = await this.getDatas();
        return datas[id];
    }

    async getDataByIdList(idList) {
        const datas = await this.getDatas();
        const result = idList.map(id => datas[id]);
        return result;
    }

    async generateTitle(messageContent) {
        return messageContent.slice(0, 20);
    }

    async addConv(firstMessage) {
        try {
            const datas = await this.getDatas();
            const id = uuidv4();
            const newConv = {
                "convId": id,
                "convTitle": await this.generateTitle(firstMessage.messageContent),
                "lastMessageDate": firstMessage.messageDate,
                "messageList": [firstMessage]
            };
            datas[id] = newConv;
            await fs.writeFile(this.path, JSON.stringify(datas, null, 4), { encoding: "utf-8" });
            return newConv;
        }
        catch (err) {
            console.error("Erreur dans addConv :", err);
            throw err;
        }
    }

    async addMessage(convId, message) {
        try {
            const datas = await this.getDatas();
            const conv = datas[convId];
            if (conv) {
                conv.messageList.push(message);
                conv.lastMessageDate = message.messageDate;
                await fs.writeFile(this.path, JSON.stringify(datas, null, 4), { encoding: "utf-8" });
                return true;
            }
            return false;
        } catch (err) {
            console.error("Erreur dans addMessage :", err);
            throw err;
        }
    }
}

module.exports = { ConvManager };