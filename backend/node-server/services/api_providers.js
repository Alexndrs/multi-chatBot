import 'dotenv/config';
import { LlamaTokenizer } from "llama-tokenizer-js";
import { getMaxModelOutput } from './utils.js';

import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { Mistral } from "@mistralai/mistralai";
import Anthropic from "@anthropic-ai/sdk";


export const tokenizer = new LlamaTokenizer();


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



export async function chatWithGemini(messages, onToken, model_name = 'gemini-2.5-flash', apiKey = null) {
    const { promptTokens, currentMessageTokens, historyTokens, fullPrompt: promptText } = computeTokenStats(messages);

    // Gemini can use images but we will implement it later
    // const image = await google.files.upload({
    // file: "./test_img.png",
    // });
    // const contents = createUserContent([promptText, createPartFromUri(image.uri, image.mimeType)]);
    const contents = createUserContent([promptText]);
    if (!apiKey) {

        apiKey = process.env.GEMINI_API;
    }
    const google = new GoogleGenAI({ apiKey });
    let actualPromptTokens, response;
    try {
        const tokenResponse = await google.models.countTokens({
            model: model_name,
            contents: contents,
        });
        actualPromptTokens = tokenResponse.totalTokens;

        response = await google.models.generateContentStream({
            model: model_name,
            contents: contents,
            temperature: 0.2,
            maxOutputTokens: getMaxModelOutput(model_name),
        });
    } catch (error) {
        throw new Error(`Error creating Gemini chat completion: ${error.message}`);
    }

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



export async function chatWithGroq(messages, onToken, model_name = 'llama-3.1-8b-instant', apiKey = null) {
    const { promptTokens, currentMessageTokens, historyTokens } = computeTokenStats(messages);

    if (!apiKey) {
        apiKey = process.env.GROQ_API;
    }
    const groq = new Groq({ apiKey });

    let stream;
    // try {
    stream = await groq.chat.completions.create({
        messages: messages,
        model: model_name,
        temperature: 0.2,
        max_completion_tokens: getMaxModelOutput(model_name),
        stream: true,
    });

    // } catch (error) {
    //     throw new Error(`Error creating Groq chat completion: ${error.message}, messages : ${JSON.stringify(messages)}`);
    // }

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



export async function chatWithOpenAI(messages, onToken, model_name = "gpt-3.5-turbo", apiKey = null) {
    if (!apiKey) throw new Error("API key for OpenAI is required");
    const openai = new OpenAI({ apiKey });
    const { promptTokens, currentMessageTokens, historyTokens, fullPrompt } = computeTokenStats(messages);

    let stream;
    try {
        stream = await openai.responses.create({
            model: model_name,
            messages,
            stream: true
        });
    } catch (error) {
        throw new Error(`Error creating OpenAI chat completion: ${error.message}`);
    }
    let generatedText = "";
    for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
            const delta = event.delta || "";
            if (onToken) onToken(delta);
            generatedText += delta;
        }
    }
    const completionTokens = tokenizer.encode(generatedText).length;
    return { generatedText, promptTokens, currentMessageTokens, historyTokens, completionTokens };
}



export async function chatWithMistral(messages, onToken, model_name = "mistral-large-latest", apiKey = null) {
    if (!apiKey) throw new Error("API key for Mistral is required");
    const mistral = new Mistral({ apiKey });
    const { promptTokens, currentMessageTokens, historyTokens } = computeTokenStats(messages);
    let stream;
    try {

        stream = await mistral.chat.stream({
            model: model_name,
            messages
        });
    } catch (error) {
        throw new Error(`Error creating Mistral chat completion: ${error.message}`);
    }

    let generatedText = "";
    for await (const chunk of stream) {
        const delta = chunk.data.choices?.[0]?.delta?.content;
        if (typeof delta === "string") {
            if (onToken) onToken(delta);
            generatedText += delta;
        }
    }
    const completionTokens = tokenizer.encode(generatedText).length;
    return { generatedText, promptTokens, currentMessageTokens, historyTokens, completionTokens };
}



export async function chatWithClaude(messages, onToken, model_name = "claude-3.5-sonnet-20240620", apiKey = null) {
    if (!apiKey) throw new Error("API key for Anthropic is required");
    const { promptTokens, currentMessageTokens, historyTokens } = computeTokenStats(messages);
    const anthropic = new Anthropic({ apiKey });
    let stream;
    try {
        stream = await anthropic.messages.create({
            model: model_name,
            messages,
            max_tokens: getMaxModelOutput(model_name),
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
                if (onToken) onToken(text);
                generatedText += text;
            }
        }
    }
    const completionTokens = tokenizer.encode(generatedText).length;
    return { generatedText, promptTokens, currentMessageTokens, historyTokens, completionTokens };
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