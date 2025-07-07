import 'dotenv/config';
import { LlamaTokenizer } from "llama-tokenizer-js";
import { getMaxModelOutput } from './utils.js';

import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import Groq from "groq-sdk";


export const tokenizer = new LlamaTokenizer();
const google = new GoogleGenAI({ apiKey: process.env.GEMINI_API });
const groq = new Groq({ apiKey: process.env.GROQ_API });


/**
 * 
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{promptTokens: number, currentMessageTokens: number, historyTokens: number}>}
 */
function computeTokenStats(messages) {
    let promptTokens = 0;
    let currentMessageTokens = 0;
    let historyTokens = 0;
    let fullPrompt = "";

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const formatted = `<|start_header_id|>${msg.role}<|end_header_id|>\n${msg.content}<|eot_id|>`;

        const tokenCount = tokenizer.encode(formatted).length;
        fullPrompt += "\n" + formatted;

        if (i === messages.length - 1) {
            currentMessageTokens = tokenCount;
        } else {
            historyTokens += tokenCount;
        }

        promptTokens += tokenCount;
    }

    return { promptTokens, currentMessageTokens, historyTokens, fullPrompt };
}


export async function chatWithGemini(messages, onToken, model_name = 'gemini-2.5-flash') {
    const { promptTokens, currentMessageTokens, historyTokens, fullPrompt: promptText } = computeTokenStats(messages);

    // Gemini can use images but we will implement it later
    // const image = await google.files.upload({
    // file: "./test_img.png",
    // });
    // const contents = createUserContent([promptText, createPartFromUri(image.uri, image.mimeType)]);
    const contents = createUserContent([promptText]);

    const { totalTokens: actualPromptTokens } = await google.models.countTokens({
        model: model_name,
        contents: contents,
    });

    const response = await google.models.generateContentStream({
        model: model_name,
        contents: contents,
        temperature: 0.2,
        maxOutputTokens: getMaxModelOutput(model_name),
    });

    let generatedText = '';
    for await (const chunk of response) {
        const content = chunk.text || '';
        if (onToken) onToken(content);
        generatedText += content;
    }

    const completionTokens = tokenizer.encode(generatedText).length;
    return {
        generatedText,
        promptTokens: actualPromptTokens,
        currentMessageTokens,
        historyTokens,
        completionTokens,
    };
}



export async function chatWithGroq(messages, onToken, model_name = 'llama-3.1-8b-instant') {
    const { promptTokens, currentMessageTokens, historyTokens } = computeTokenStats(messages);

    const stream = await groq.chat.completions.create({
        messages: messages,
        model: model_name,
        temperature: 0.2,
        max_completion_tokens: getMaxModelOutput(model_name),
        stream: true,
    });

    let generatedText = '';
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (onToken) onToken(content);
        generatedText += content;
    }

    const completionTokens = tokenizer.encode(generatedText).length;

    return {
        generatedText,
        promptTokens,
        currentMessageTokens,
        historyTokens,
        completionTokens,
    };
}


// (async () => {
//     const messages = [
//         { role: "user", content: "Explain AI in a short phrase" }
//     ];

//     const result = await chatWithGemini(messages, (token) => {
//         process.stdout.write(token);
//     });

//     console.log("\n\n--- Résumé ---");
//     console.log("Texte généré :", result.generatedText);
//     console.log("Prompt tokens :", result.promptTokens);
//     console.log("Completion tokens :", result.completionTokens);
// })();



// (async () => {
//     const messages = [
//         { role: "user", content: "Explique-moi le concept de gravité en termes simples." }
//     ];

//     const result = await chatWithGroq(messages, (token) => {
//         process.stdout.write(token);
//     });

//     console.log("\n\n--- Résumé ---");
//     console.log("Texte généré :", result.generatedText);
//     console.log("Prompt tokens :", result.promptTokens);
//     console.log("Completion tokens :", result.completionTokens);
// })();