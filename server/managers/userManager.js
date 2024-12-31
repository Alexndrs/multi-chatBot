const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");

/**
 * 
 * Méthadonnées d'une conv
 * @typedef {Object} ConvInfo
 * @property {string} id 
 * @property {string} title
 * @property {Date} lastMessageDate
 * @property {int} numberOfMessages
 *  
 * Metadonnées d'un user
 * @typedef {Object} userData
 * @property {string} id    //Servira de token X-auth pour les requêtes
 * @property {string} mail
 * @property {string} hashedPassword 
 * @property {List[ConvInfo]} convInfos
 * 
 */


class UserManager {
    constructor(path) {
        this.path = path;
    }


    async getDatas() {

        const fileContent = await fs.readFile(this.path, { encoding: "utf-8" });
        const datas = JSON.parse(fileContent);
        return datas;

    }

    async getDataById(id) {
        const datas = await this.getDatas();
        return datas[id];
    }

    async addUser(mail, hashedPassword) {
        try {
            // Verifier si l'utilisateur existe déjà

            const datas = await this.getDatas(); // Charger les données existantes
            const user = Object.values(datas).find(x => x.mail === mail);
            if (user) {
                // L'utilisateur existe déjà
                return undefined;
            }

            const id = uuidv4();
            const newUser = {
                "id": id,
                "mail": mail,
                "hashedPassword": hashedPassword,
                "convInfos": []
            }
            datas[id] = newUser;
            await fs.writeFile(this.path, JSON.stringify(datas, null, 4), { encoding: "utf-8" });
            return id;
        } catch (err) {
            console.error("Erreur dans addUser :", err);
            throw err;
        }
    }

    async loginUser(mail, password) {
        try {
            const datas = await this.getDatas();
            const user = Object.values(datas).find(x => x.mail === mail);
            if (!user) {
                return undefined;
            }
            const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
            if (!isPasswordValid) {
                console.log("Mot de passe invalide");
                return undefined;
            }
            return this.getDataById(user.id);
        } catch (err) {
            console.error("Erreur dans loginUser :", err);
            throw err;
        }
    }

    async addConv(userId, convId, title) {
        try {
            const datas = await this.getDatas();
            const user = datas[userId];
            if (user) {
                user.convInfos.push({ "id": convId, "title": title, "lastMessageDate": new Date() });
                await fs.writeFile(this.path, JSON.stringify(datas, null, 4), { encoding: "utf-8" });
                return true;
            }
            return false;
        } catch (err) {
            console.error("Erreur dans addConv :", err);
            throw err;
        }
    }

    async updateConv(userId, convId, title) {
        try {
            const datas = await this.getDatas();
            const user = datas[userId];
            if (user) {
                const conv = user.convInfos.find(x => x.id === convId);
                if (conv) {
                    conv.title = title;
                    conv.lastMessageDate = new Date();
                    await fs.writeFile(this.path, JSON.stringify(datas, null, 4), { encoding: "utf-8" });
                    return true;
                }
            }
            return false;
        } catch (err) {
            console.error("Erreur dans updateConv :", err);
            throw err;
        }
    }
}

module.exports = { UserManager };