require('dotenv').config();
const Groq = require("groq-sdk");
const { LlamaTokenizer } = require("llama-tokenizer-js");
const groq = new Groq({ apiKey: process.env.GROQ_API });
const tokenizer = new LlamaTokenizer();


async function chatWithGroq(messages, onToken, model_name = 'llama-3.1-8b-instant') {
    console.log('Appel de chatWithGroq avec le(s) message(s):', messages);

    let promptTokens = 0;
    for (const message of messages) {
        // Simulating chat format of groq
        const simulated = `<|start_header_id|>${message.role}<|end_header_id|>\n${message.content}<|eot_id|>`;
        // Count token of the prompt with llama tokenizer
        promptTokens += tokenizer.encode(simulated).length;
    }
    console.log(`\n[Prompt token estimation] ≈ ${promptTokens} tokens\n`);



    const stream = await groq.chat.completions.create({
        messages: messages,
        model: model_name,
        temperature: 0.2,
        max_completion_tokens: 1024,
        stream: true,
    });

    let generatedText = "";
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (onToken) onToken(content);
        generatedText += content;
    }

    const completionTokens = tokenizer.encode(generatedText).length;
    return {
        generatedText,
        promptTokens,
        completionTokens,
    };
}

module.exports = { chatWithGroq };