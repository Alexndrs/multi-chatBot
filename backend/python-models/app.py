from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from transformers import TextIteratorStreamer
import threading
from pydantic import BaseModel
from transformers import pipeline
from typing import List, Dict
from testing import QwenChatbot

app = FastAPI()
generator = pipeline("text-generation", model="gpt2")


# Start the FastAPI server on port 8001 : 
# $ uvicorn app:app --reload --port 8001

@app.get("/")
def read_root():
    print("Reading root")
    userInput = "Hello world, who are you ? /no_think"
    print("User input:", userInput)
    chatbot = QwenChatbot()
    response = chatbot.generate_response(userInput)
    print(f"User: {userInput}\n Bot: {response}")


class ChatInput(BaseModel):
    message: List[Dict]

@app.post("/chat")
def chat(req: ChatInput):
    # print("Received chat request :", req)


    hist = [{"role": msg["role"], "content": msg["content"]} for msg in req.message]
    chatbot = QwenChatbot(history=hist[:-1])
    lastMessage = hist[-1]["content"]

    def token_stream():
        # Prépare le prompt
        messages = chatbot.history + [{"role": "user", "content": lastMessage}]
        print("Messages for generation:", messages)
        text = chatbot.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        inputs = chatbot.tokenizer(text, return_tensors="pt")
        inputs = {k: v.to(chatbot.model.device) for k, v in inputs.items()}

        streamer = TextIteratorStreamer(chatbot.tokenizer, skip_prompt=True, skip_special_tokens=True)
        generation_kwargs = dict(**inputs, streamer=streamer, max_new_tokens=1024)

        thread = threading.Thread(target=chatbot.model.generate, kwargs=generation_kwargs)
        thread.start()
        for new_text in streamer:
            print(new_text, end='', flush=True)
            yield new_text

    return StreamingResponse(token_stream(), media_type="text/plain")
