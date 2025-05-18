require('dotenv').config();
const express = require('express');
const cors = require('cors');
const messageRouter = require('./routes/message');
const userRouter = require('./routes/user');
const conversationRouter = require('./routes/conversation');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/message', messageRouter);
app.use('/user', userRouter);
app.use('/conversation', conversationRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
