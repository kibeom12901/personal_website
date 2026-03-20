# Personal Website

Personal portfolio website focused on embedded systems, hardware, and engineering projects.

## Overview

This repository contains the frontend for my personal website. It includes:

- a landing page
- project highlights
- skills and experience
- fun / life section
- contact page
- chat-style UI for exploring the portfolio

## Tech Stack

- HTML
- CSS
- JavaScript

## Local Development

Run the site locally with:

```bash
cd "/Users/bk/Documents/Personal Website"
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Live Website

This frontend is intended to be deployed on GitHub Pages.

## Backend / GPT Chat

The chat feature uses a separate backend server.

Server repository:

- `Add your server repo link here`

Example format:

- `https://github.com/kibeom12901/personal-website-server`

The frontend currently expects a chat API endpoint at:

```text
/api/chat
```

For local development, the frontend can call a local server running on port `3001`.

## Deployment Notes

- GitHub Pages can host the frontend only
- the GPT/chat backend must be deployed separately
- API keys should stay in the backend, never in frontend JavaScript

## Structure

- `/index.html` - landing page
- `/me.html` - about page
- `/projects.html` - project highlights
- `/skills.html` - skills page
- `/fun.html` - fun and life page
- `/contact.html` - contact page
- `/chat.html` - chat interface
- `/styles.css` - site styling
- `/script.js` - interactivity and chat logic

