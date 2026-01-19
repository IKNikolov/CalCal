# AI-Powered Calorie Calculator

A full-stack web application that uses AI to help users track their daily calorie intake through text descriptions or food photos.

## Features

- 🔐 **User Authentication** - Secure JWT-based registration and login
- 🎯 **Daily Calorie Goals** - Set and track personalized calorie targets
- 🤖 **AI-Powered Analysis** - Get calorie estimates from text descriptions or food images using OpenAI
- 📊 **Daily Dashboard** - Real-time tracking of today's calorie intake
- ✏️ **Entry Management** - Edit or delete calorie entries
- 📈 **Historical Progress** - View and analyze past calorie data
- 📱 **Responsive Design** - Mobile-friendly interface built with Vuetify

## Tech Stack

**Frontend:**
- Vue 3 + TypeScript + Composition API
- Vuetify 3 (Material Design)
- Pinia (State Management)
- Axios (HTTP Client)

**Backend:**
- Node.js + Express.js
- PostgreSQL (Database)
- JWT Authentication
- Multer (File Uploads)

**AI:**
- OpenAI API (GPT-4o for vision, GPT-4o-mini for text)

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- An OpenAI API key ([platform.openai.com](https://platform.openai.com))

## Quick Start

### 1. Clone and Install

```bash
cd calcal
npm install
cd backend
npm install
cd ..
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb calorie_calculator

# Run schema
psql -d calorie_calculator -f backend/schema.sql
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calorie_calculator
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:3000/api
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Open Browser

Navigate to http://localhost:5173 and create an account!

## Detailed Setup

See [SETUP.md](SETUP.md) for comprehensive setup instructions.

## Backend API Documentation

See [backend/README.md](backend/README.md) for API documentation.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
