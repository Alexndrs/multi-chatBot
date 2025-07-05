import { Mistral } from '@mistralai/mistral-sdk';
import 'dotenv/config';

const client = new Mistral({ apiKey: process.env.MISTRAL_API });
const main = async () => {
    const chatResponse = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: 'What is the best French cheese?' }],
    });
    return chatResponse;
}

main().then(chatResponse => {
    console.log('Chat response:', chatResponse);
}).catch(err => {
    console.error('Error:', err);
});