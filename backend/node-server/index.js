import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import messageRouter from './routes/message.js';
import userRouter from './routes/auth.js';
import conversationRouter from './routes/conversation.js';
import apiKeyRouter from './routes/keys.js';
import { initDB } from './db/sqlite_interface.js';
import { createUser } from './core/auth.js';



const app = express();
app.use(cors());
app.use(express.json());

app.use('/message', messageRouter);
app.use('/user', userRouter);
app.use('/conversation', conversationRouter);
app.use('/apiKeys', apiKeyRouter);

const PORT = process.env.PORT || 8000;
async function startServer() {
    try {
        await initDB();
        // createUser("alex@example.com", "Alex", "password123");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Erreur lors de l'initialisation de la base de données :", err);
        process.exit(1);
    }
}

startServer();
