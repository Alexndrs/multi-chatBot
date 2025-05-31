from fastapi import FastAPI
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
    print("Received chat request :", req)


    hist = [{"role": msg["role"], "content": msg["content"]} for msg in req.message]
    chatbot = QwenChatbot(history=hist[:-1])
    lastMessage = hist[-1]["content"]
    result = chatbot.generate_response(lastMessage)
    print(lastMessage, result)
    return {"response": result}
