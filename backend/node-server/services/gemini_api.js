import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import 'dotenv/config';
import { LlamaTokenizer } from "llama-tokenizer-js";
const tokenizer = new LlamaTokenizer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

export async function chatWithGemini(messages, onToken, model_name = 'gemini-2.5-flash') {
    console.log('Appel de chatWithGemini avec le(s) message(s):', messages);


    let promptTokens = 0;
    let currentMessageTokens = 0;
    let historyTokens = 0;

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        // Simuler un format simple type "role: content"
        const formatted = `${message.role}: ${message.content}`;
        const messageTokenCount = tokenizer.encode(formatted).length;

        if (i === messages.length - 1) {
            currentMessageTokens = messageTokenCount;
        } else {
            historyTokens += messageTokenCount;
        }

        promptTokens += messageTokenCount;
    }

    // console.log(`\n[Token breakdown] Current: ${currentMessageTokens} | History: ${historyTokens} | Total (approx): ${promptTokens} tokens\n`);


    // const image = await ai.files.upload({
    // file: "./test_img.png",
    // });
    // const contents = createUserContent([promptText, createPartFromUri(image.uri, image.mimeType)]);
    const promptText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const contents = createUserContent([promptText]);

    const tokenInfo = await ai.models.countTokens({
        model: model_name,
        contents: contents,
    });
    const actualPromptTokens = tokenInfo.totalTokens;

    const response = await ai.models.generateContentStream({
        model: model_name,
        contents: contents,
        temperature: 0.2,
        maxOutputTokens: 1024
    });

    let generatedText = "";
    for await (const chunk of response) {
        const content = chunk.text || "";
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