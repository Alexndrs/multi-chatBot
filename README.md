# A Multi-Model Chat Platform with Real-Time Token Streaming

A fullstack AI-powered chat platform supporting **multiple LLM providers** (OpenAI, Mistral, Anthropic, Gemini, Groq...) with **token-by-token streaming**, auth, dynamic prompt budgeting and a custom refined UI/UX.

---
## 🌐   Live Demo [chatbothub.org/](https://chatbothub.org)

> * App deployed on an AWS EC2 Ubuntu instance (fullstack deployment on a single machine).
> * Using Nginx as reverse proxy and PM2 for process management.
> * Using webhook for CI/CD

<p align="center">
  <img src="./demo.gif" width="100%" alt="Chat demo" />
</p>



## 🚀 Features

 **Backend**
>- Auth system with **email verification** and **secure password hashing**.
>-  SQLite relational DB with 4 tables: `users`, `conversations`, `messages`, `api_keys`.
>- **Token-by-token streaming** over HTTP (chunked response)
>- Dynamic **windowed context** management: adapts to each provider’s token budget.
>- Add/manage/encrypt **multiple API keys** per user (OpenAI, Mistral, Groq...)

**Frontend**
>- Built with **React + Vite + TypeScript + TailwindCSS**.
>- Elegant skeuomorphic dark UI, custom-built primitives (buttons, inputs, sidebar...).
>- Live **token streaming** rendering with markdown support.
>- Switch between **models in real-time** within the same conversation.
>- Full-featured auth and API key management interface.

---

## ⚙️ Tech Stack

| Layer       | Tech                                           |
|-------------|------------------------------------------------|
| Frontend    | React, Vite, TypeScript, TailwindCSS           |
| Backend     | Node.js, Express, SQLite                       |
| Auth        | Custom email verification + password hashing   |
| Streaming   | HTTP                       |
| Dev tools   | ESLint, Prettier                      |

---

## 🧠 Notable Engineering Challenges

- **Streaming with HTTP**  

- **Token Budgeting per Provider**  
  Providers like Groq or Mistral have different context limits and pricing per TPM. I implemented a **sliding window mechanism** to dynamically select the right number of recent messages for context.

---

## 🛠️ Getting Started in local

```bash
git clone https://github.com/username/project-name
cd project-name
# Setup backend
cd backend
npm install
npm run dev
```
and create a .env with the follwing structure :
>JWT_SECRET=secret1
>ENCRYPT_SECRET=secret2
>GROQ_API=default_key_for_groq
>GEMINI_API=default_key_for_gemini
>MAIL_APP_PASSWORD=aaaa aaaa aaaa aaa
>MAIL=yourMail@gmail.com
>URL=http://localhost:5173

```bash
# In another terminal, setup frontend
cd ../frontend
npm install
npm run dev
```
and make sure to have the line 
```ts
export const serverUrl = 'http://localhost:8000';
```
instead of
```ts
export const serverUrl = '/api';
```
