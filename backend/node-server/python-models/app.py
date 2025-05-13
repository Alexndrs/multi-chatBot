from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()
generator = pipeline("text-generation", model="gpt2")

class ChatInput(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatInput):
    result = generator(req.message, max_length=100)[0]['generated_text']
    return {"response": result}
