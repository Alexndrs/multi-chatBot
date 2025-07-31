import 'dotenv/config';
import { LlamaTokenizer } from "llama-tokenizer-js";
import { getMaxModelOutput } from './utils.js';

import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { Mistral } from "@mistralai/mistralai";
import Anthropic from "@anthropic-ai/sdk";


export const tokenizer = new LlamaTokenizer();
export const systemPrompt = (modelName) => `
You are part of a multi-chatbot system designed to meet the diverse needs of our users.
Your specific role is to assist as a representative of the ${modelName} model.
Always keep in mind that you are ${modelName} and provide responses that reflect the strengths and characteristics of this model.
Collaborate seamlessly with other chatbots to ensure the user receives comprehensive and accurate assistance.
Your primary goal is to provide helpful, respectful, and concise information.
If a question or request is outside your capabilities, acknowledge it and suggest seeking assistance from another chatbot in the system.
`;


/**
 * 
 * @param {Array<{role: string, content: string}>} linearHistory
 * @returns {Promise<{lastMessageToken: number, fullHistoryToken: number, fullPrompt: string}>}
 */
export function computeTokenStats(linearHistory) {
    let lastMessageToken = 0;
    let fullHistoryToken = 0;
    let fullPrompt = "";

    for (let i = 0; i < linearHistory.length; i++) {
        const msg = linearHistory[i];
        const formatted = `<|start_header_id|>${msg.role}<|end_header_id|>\n${msg.content}<|eot_id|>`;

        const msgTokenCount = tokenizer.encode(formatted).length;
        fullPrompt += "\n" + formatted;

        if (i === linearHistory.length - 1) {
            lastMessageToken = msgTokenCount;
        } else {
            fullHistoryToken += msgTokenCount;
        }
    }

    return { lastMessageToken, fullHistoryToken, fullPrompt };
}



export async function chatWithGemini(linearHistory, onToken, modelName = 'gemini-2.5-flash', apiKey = null) {
    linearHistory.unshift({ role: 'system', content: systemPrompt(modelName) });
    const { lastMessageToken, fullHistoryToken, fullPrompt } = computeTokenStats(linearHistory);

    // Gemini can use images but we will implement it later
    // const image = await google.files.upload({
    // file: "./test_img.png",
    // });
    // const contents = createUserContent([fullPrompt, createPartFromUri(image.uri, image.mimeType)]);
    const contents = createUserContent([fullPrompt]);
    if (!apiKey) {
        apiKey = process.env.GEMINI_API;
    }
    const google = new GoogleGenAI({ apiKey });
    let response;
    try {
        response = await google.models.generateContentStream({
            model: modelName,
            contents: contents,
            temperature: 0.2,
            maxOutputTokens: getMaxModelOutput(modelName),
        });
    } catch (error) {
        throw new Error(`Error creating Gemini chat completion: ${error.message}`);
    }

    let generatedText = '';
    for await (const chunk of response) {
        const content = chunk.text || '';
        if (onToken) onToken(content, modelName);
        generatedText += content;
    }

    const completionTokens = tokenizer.encode(generatedText).length;
    return {
        generatedText,
        fullHistoryToken,
        lastMessageToken,
        completionTokens,
    };
}

export async function testGemini(key, modelName = 'gemini-2.5-flash') {
    try {
        const google = new GoogleGenAI({ apiKey: key });
        const message = await google.models.generateContent({
            model: modelName,
            contents: "Say hello originaly and in less than 8 words!",
        });
        return { message: message.text, error: false };
    } catch (error) {
        return { message: error.message, error: true };
    }
}


export async function chatWithGroq(linearHistory, onToken, modelName = 'llama-3.1-8b-instant', apiKey = null) {
    linearHistory.unshift({ role: 'user', content: systemPrompt(modelName) });
    const { lastMessageToken, fullHistoryToken } = computeTokenStats(linearHistory);

    if (!apiKey) {
        apiKey = process.env.GROQ_API;
    }
    const groq = new Groq({ apiKey });

    const stream = await groq.chat.completions.create({
        messages: linearHistory,
        model: modelName,
        temperature: 0.2,
        max_completion_tokens: getMaxModelOutput(modelName),
        stream: true,
    });

    let generatedText = '';
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (onToken) onToken(content, modelName);
        generatedText += content;
    }

    const completionTokens = tokenizer.encode(generatedText).length;

    return {
        generatedText,
        fullHistoryToken,
        lastMessageToken,
        completionTokens,
    };
}

export async function testGroq(key, modelName = 'llama-3.1-8b-instant') {
    try {
        const groq = new Groq({ apiKey: key });
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Say hello originaly and in less than 8 words!",
                },
            ],
            model: modelName,
        });
        const message = response.choices[0].message.content;
        return { message, error: false };
    } catch (error) {
        return { message: error.message, error: true };
    }
}



export async function chatWithOpenAI(linearHistory, onToken, modelName = "gpt-3.5-turbo", apiKey = null) {
    linearHistory.unshift({ role: 'system', content: systemPrompt(modelName) });
    if (!apiKey) throw new Error("API key for OpenAI is required");
    const openai = new OpenAI({ apiKey });
    const { lastMessageToken, fullHistoryToken } = computeTokenStats(linearHistory);

    let stream;
    try {
        stream = await openai.responses.create({
            model: modelName,
            messages: linearHistory,
            stream: true
        });
    } catch (error) {
        throw new Error(`Error creating OpenAI chat completion: ${error.message}`);
    }
    let generatedText = "";
    for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
            const delta = event.delta || "";
            if (onToken) onToken(delta, modelName);
            generatedText += delta;
        }
    }
    const completionTokens = tokenizer.encode(generatedText).length;
    return {
        generatedText,
        fullHistoryToken,
        lastMessageToken,
        completionTokens,
    };
}

export async function testOpenAI(key, modelName = "gpt-3.5-turbo") {
    try {
        const openai = new OpenAI({ apiKey: key });
        const response = await openai.responses.create({
            model: modelName,
            input: "Say hello originaly and in less than 8 words!",
        });
        const message = response.output_text;
        return { message, error: false };
    }
    catch (error) {
        return { message: error.message, error: true };
    }
}


export async function chatWithMistral(linearHistory, onToken, modelName = "mistral-small-latest", apiKey = null) {
    linearHistory.unshift({ role: 'system', content: systemPrompt(modelName) });
    if (!apiKey) throw new Error("API key for Mistral is required");
    const mistral = new Mistral({ apiKey });
    const { lastMessageToken, fullHistoryToken } = computeTokenStats(linearHistory);
    let stream;
    try {
        stream = await mistral.chat.stream({
            model: modelName,
            messages: linearHistory
        });
    } catch (error) {
        throw new Error(`Error creating Mistral chat completion: ${error.message}`);
    }

    let generatedText = "";
    for await (const chunk of stream) {
        const delta = chunk.data.choices?.[0]?.delta?.content;
        if (typeof delta === "string") {
            if (onToken) onToken(delta, modelName);
            generatedText += delta;
        }
    }
    const completionTokens = tokenizer.encode(generatedText).length;
    return {
        generatedText,
        fullHistoryToken,
        lastMessageToken,
        completionTokens
    };
}

export async function testMistral(key, modelName = "mistral-small-latest") {
    try {
        const mistral = new Mistral({ apiKey: key });
        const response = await mistral.chat.complete({
            model: modelName,
            messages: [{ role: 'user', content: 'Say hello originaly and in less than 8 words!' }],
        });

        const message = response.choices[0].message.content;
        return { message, error: false };
    } catch (error) {
        return { message: error.message, error: true };
    }
}


export async function chatWithClaude(linearHistory, onToken, modelName = "claude-3.5-sonnet-20240620", apiKey = null) {
    linearHistory.unshift({ role: 'system', content: systemPrompt(modelName) });
    if (!apiKey) throw new Error("API key for Anthropic is required");
    const { lastMessageToken, fullHistoryToken } = computeTokenStats(linearHistory);
    const anthropic = new Anthropic({ apiKey });
    let stream;
    try {
        stream = await anthropic.messages.create({
            model: modelName,
            messages: linearHistory,
            max_tokens: getMaxModelOutput(modelName),
            stream: true
        });
    } catch (error) {
        throw new Error(`Error creating Claude chat completion: ${error.message}`);
    }

    let generatedText = "";
    for await (const evt of stream) {
        if (evt.type === "content_block_delta") {
            const text = evt.delta?.text;
            if (text) {
                if (onToken) onToken(text, modelName);
                generatedText += text;
            }
        }
    }
    const completionTokens = tokenizer.encode(generatedText).length;
    return {
        generatedText,
        fullHistoryToken,
        lastMessageToken,
        completionTokens
    };
}

export async function testClaude(key, modelName = "claude-3.5-sonnet-20240620") {
    try {
        const anthropic = new Anthropic({ apiKey: key });
        const response = await anthropic.messages.create({
            model: modelName,
            messages: [{ role: 'user', content: [{ type: "text", "text": 'Say hello originaly and in less than 8 words!' }] }],
        });

        const message = response.choices[0].message.text;
        return { message, error: false };
    } catch (error) {
        return { message: error.message, error: true };
    }
}


// (async () => {
//     const messages = [
//         { role: "user", content: "Explain AI in a short phrase" }
//     ];
//     const resultGemini = await chatWithGemini(messages, (token) => {
//         process.stdout.write(token);
//     });
//     console.log("\nGemini Tokens:", resultGemini.promptTokens, resultGemini.currentMessageTokens, resultGemini.historyTokens, resultGemini.completionTokens);

//     const resultGroq = await chatWithGroq(messages, (token) => {
//         process.stdout.write(token);
//     });
//     console.log("\nGroq Tokens:", resultGroq.promptTokens, resultGroq.currentMessageTokens, resultGroq.historyTokens, resultGroq.completionTokens);

//     const resultOpenAI = await chatWithOpenAI(messages, (token) => {
//         process.stdout.write(token);
//     });
//     console.log("\nOpenAI Tokens:", resultOpenAI.promptTokens, resultOpenAI.currentMessageTokens, resultOpenAI.historyTokens, resultOpenAI.completionTokens);

//     const resultMistral = await chatWithMistral(messages, (token) => {
//         process.stdout.write(token);
//     });
//     console.log("\nMistral Tokens:", resultMistral.promptTokens, resultMistral.currentMessageTokens, resultMistral.historyTokens, resultMistral.completionTokens);

//     const resultClaude = await chatWithClaude(messages, (token) => {
//         process.stdout.write(token);
//     });
//     console.log("\nClaude Tokens:", resultClaude.promptTokens, resultClaude.currentMessageTokens, resultClaude.historyTokens, resultClaude.completionTokens);

// })();