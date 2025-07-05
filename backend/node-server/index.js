import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import messageRouter from './routes/message.js';
import authRouter from './routes/auth.js';
import conversationRouter from './routes/conversation.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/message', messageRouter);
app.use('/auth', authRouter);
app.use('/conversation', conversationRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
