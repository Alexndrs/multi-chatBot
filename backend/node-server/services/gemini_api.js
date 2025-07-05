require('dotenv').config({ path: './../.env' });
const { GoogleGenAI, createUserContent, createPartFromUri } = require("@google/genai");
const { LlamaTokenizer } = require("llama-tokenizer-js");
const tokenizer = new LlamaTokenizer();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

async function chatWithGemini(messages, onToken, model_name = 'gemini-2.5-flash') {
    console.log('Appel de chatWithGemini avec le(s) message(s):', messages);


    const promptText = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const promptTokens = tokenizer.encode(promptText).length
    console.log(`\n[Prompt token estimation] for prompt : [${promptText}] ≈ ${promptTokens} tokens\n`);

    // const image = await ai.files.upload({
    // file: "./test_img.png",
    // });
    // const contents = createUserContent([promptText, createPartFromUri(image.uri, image.mimeType)]);
    const contents = createUserContent([promptText]);

    const { totalTokens } = await ai.models.countTokens({
        model: model_name,
        contents: contents,
    });
    console.log(`Total tokens for the request: ${totalTokens} tokens`);


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

if (require.main === module) {
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


module.exports = { chatWithGemini };