// No free token with the openai api.


import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API,
});

const completion = openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
        { "role": "user", "content": "write a haiku about ai" },
    ],
});

completion.then((result) => console.log(result.choices[0].message));