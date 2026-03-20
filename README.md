# Brian Kim — Personal Portfolio

<div align="center">

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)

**A mobile-first portfolio with a GPT-powered chat interface, liquid canvas animations, and a multi-page layout.**

<!-- PUT HERO SCREENSHOT HERE
  ![Landing page](./assets/images/readme/hero.png)
-->

[Live Site](https://kibeom12901.github.io) · [Frontend Repo](https://github.com/kibeom12901/personal_website) · [Backend Repo](https://github.com/kibeom12901/personal_website_server)

</div>

---

## Overview
<img width="1322" height="754" alt="Screenshot 2026-03-20 at 1 56 24 PM" src="https://github.com/user-attachments/assets/0efa3da4-5837-4f34-b226-bb26f7ba3e5f" />

This is the **frontend** of Brian Kim's personal portfolio — a multi-page static site with a chat-style UI backed by a separate Node.js/Express server that calls the OpenAI API to answer questions about Brian in real time.

The site is optimised for mobile and deployed on GitHub Pages. The chat backend lives in a separate repository and is deployed independently.

---

## Architecture

<img width="1440" height="1016" alt="image" src="https://github.com/user-attachments/assets/26e68dea-fa4b-4a2b-979a-f0119af7d0c1" />

### How the chat works

1. User types into the chat bar (visible on every page).
2. `script.js` sends `POST /api/chat` with the message.
3. The backend prepends a system prompt containing Brian's bio, projects, skills, and experience, then calls OpenAI.
4. The response returns to the frontend and renders with a typewriter effect.
5. Relevant page links are optionally surfaced as resource cards.

<!-- PUT CHAT UI SCREENSHOT HERE
  ![Chat UI](./assets/images/readme/chat.png)
-->

---

## Site map

<img width="1440" height="1016" alt="image" src="https://github.com/user-attachments/assets/7ef6379c-91d8-4f62-b1a1-f31cbffe83b2" />


| Page | File | Description |
|------|------|-------------|
| Landing | `index.html` | Hero with liquid canvas, animated title, chat bar |
| About | `me.html` | Bio, experience timeline, education, languages |
| Projects | `projects.html` | Horizontal carousel of hardware/software builds |
| Skills | `skills.html` | Animated chip groups by category |
| Fun | `fun.html` | Life outside engineering — skiing, golf, travel |
| Contact | `contact.html` | Email, LinkedIn, GitHub, CV download |
| Chat | `chat.html` | Dedicated full-screen chat view |

---

## Tech stack

### Frontend (this repo)
- **HTML5 / CSS3 / Vanilla JS** — no framework, no build step
- **Canvas API** — liquid rainbow animation on the landing page
- **Google Fonts** — Inter (body), Syne (contact headings)
- **CSS animations** — fade-up, chip-pop, shimmer sweeps, typing indicator

### Backend ([personal_website_server](https://github.com/kibeom12901/personal_website_server))
- **Node.js + Express** — lightweight REST server
- **OpenAI API** — GPT-4o-mini with a Brian-specific system prompt
- **CORS** — configured for the GitHub Pages origin

---

## Local development

### 1 — Frontend
```bash
cd "/Users/bk/Documents/Personal Website"
python3 -m http.server 8000
# → http://localhost:8000
```

### 2 — Backend
```bash
git clone https://github.com/kibeom12901/personal_website_server
cd personal_website_server
npm install
cp .env.example .env   # paste your OPENAI_API_KEY
npm start              # listens on :3001
```

> `script.js` targets `http://localhost:3001/api/chat` in development and the deployed URL in production.

---

## Deployment

| Layer | Platform | Notes |
|-------|----------|-------|
| Frontend | GitHub Pages | Push to `main` → auto-deploys |
| Backend | Render / Railway / Fly.io | Set `OPENAI_API_KEY` as an env var |

**Rule:** API keys live only in the backend's environment. Never commit them to the frontend.

---

## Project structure
```
personal_website/
├── index.html
├── me.html
├── projects.html
├── skills.html
├── fun.html
├── contact.html
├── chat.html
└── assets/
    ├── css/
    │   └── styles.css       ← all shared styles
    ├── js/
    │   └── script.js        ← canvas, chat, carousel logic
    └── images/
        ├── projects/
        └── fun/
```

---

## Backend API

**[github.com/kibeom12901/personal_website_server](https://github.com/kibeom12901/personal_website_server)**
```
POST /api/chat
Content-Type: application/json

{ "message": "What projects has Brian built?" }
```
```json
{
  "answer": "Brian has built a VS1003B MP3 Player using STM32...",
  "resources": [
    { "label": "Projects", "href": "/projects.html" }
  ]
}
```

---

## About Brian

EE student at Tufts University. Interned at KETI (autonomous driving) and Stochastic (full-stack React). Currently serving in the Republic of Korea Army — open to roles from July 2026.

[LinkedIn](https://www.linkedin.com/in/brian-kim-2b3b40262/) · [GitHub](https://github.com/kibeom12901) · [Email](mailto:Kimkibeom1290@gmail.com)
