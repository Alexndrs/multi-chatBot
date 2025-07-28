# Multi-Model AI Chatbot with Real-Time Streaming (OpenAI, Mistral, Groq...)

[![Live](https://img.shields.io/badge/Site-Live-green?style=flat-square&logo=rocket)](https://chatbothub.org)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js&style=flat-square)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/DB-SQLite-lightgrey?logo=sqlite&style=flat-square)](https://www.sqlite.org/index.html)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Hosted on AWS](https://img.shields.io/badge/Hosted_on-AWS-232F3E?logo=amazon-aws&logoColor=white&style=flat-square)](https://aws.amazon.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Webhook-blue?logo=github&style=flat-square)](https://github.com)


A fullstack AI-powered chat platform supporting **multiple LLM providers** (OpenAI, Mistral, Anthropic, Gemini, Groq...) with **token-by-token streaming**, auth, dynamic prompt budgeting and a custom refined UI/UX.

---
## 🌐   Deployed @ [chatbothub.org](https://chatbothub.org)

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

- **Real-Time Token Streaming over HTTP**
Had to manage manual flushing of token chunks and ensure frontend re-rendering with backpressure.

- Prompt Budgeting & Sliding Context Window
Each LLM has its own context/token limit. I implemented a dynamic sliding window to truncate message history while maximizing relevance for the current query.

- **Built without any chatbot libraries or boilerplates**
  all components handcrafted.

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
