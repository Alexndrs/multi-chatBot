const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

/**
 * 
 * Méthadonnées d'une conv
 * @typedef {Object} ConvInfo
 * @property {string} id 
 * @property {string} title
 * @property {Date} lastMessageDate
 *  
 * Metadonnées d'un user
 * @typedef {Object} userData
 * @property {string} id    //Servira de token X-auth pour les requêtes
 * @property {string} mail
 * @property {string} hashedPassword 
 * @property {List[ConvInfo]} convInfos
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

    // async updateConv(convId, title) {
    //     try {
    //         const datas = await this.getDatas(); // Charger les données existantes
    //         const user = datas[userId];
    //         if (user) {
    //             const conv = user.convInfos.find(x => x.id === convId);
    //             if (conv) {
    //                 conv.title = title;
    //                 conv.lastMessageDate = new Date();
    //                 await fs.writeFile(this.path, JSON.stringify(datas, null, 4), { encoding: "utf-8" });
    //                 return true;
    //             }
    //         }
    //         return false;
    //     } catch (err) {
    //         console.error("Erreur dans updateConv :", err);
    //         throw err;
    //     }
    // }
}

module.exports = { ConvManager };