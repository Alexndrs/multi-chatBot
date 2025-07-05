import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import 'dotenv/config';
import { LlamaTokenizer } from "llama-tokenizer-js";
const tokenizer = new LlamaTokenizer();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

export async function chatWithGemini(messages, onToken, model_name = 'gemini-2.5-flash') {
    console.log('Appel de chatWithGemini avec le(s) message(s):', messages);

    // const image = await ai.files.upload({
    // file: "./test_img.png",
    // });
    // const contents = createUserContent([promptText, createPartFromUri(image.uri, image.mimeType)]);
    const promptText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const contents = createUserContent([promptText]);

    const { promptTokens } = await ai.models.countTokens({
        model: model_name,
        contents: contents,
    });
    console.log(`Total tokens for the request: ${promptTokens} tokens`);


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
        promptTokens,
        completionTokens,
    };
}

if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const messages = [
            { role: "user", content: "Explain AI in a short phrase" }
        ];

        const result = await chatWithGemini(messages, (token) => {
            process.stdout.write(token);
        });

        console.log("\n\n--- Résumé ---");
        console.log("Texte généré :", result.generatedText);
        console.log("Prompt tokens :", result.promptTokens);
        console.log("Completion tokens :", result.completionTokens);
    })();
}