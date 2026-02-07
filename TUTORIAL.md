# Building Your First LLM Chatbot

A step-by-step guide for new programmers. By the end, you'll have a working chatbot that streams responses from Claude in a clean chat interface — built on top of the React + FastAPI monorepo you already have running.

**This tutorial uses a "build it yourself" approach.** At key moments, you'll be asked to write code before seeing the solution. This is the fastest way to actually learn — copying and pasting teaches you very little.

---

## What We're Building

A chat application where you type a message, send it to your FastAPI backend, which calls the Anthropic API, and streams the response back to your React frontend in real time — just like you see on claude.ai.

```
You type "Hello" → React frontend → FastAPI backend → Anthropic API → streamed response → React renders it
```

---

## Prerequisites

Before starting, make sure you have:

1. This monorepo already set up and running (`make dev` works and you can see the health check at http://localhost:5173)
2. An Anthropic API key (sign up at https://console.anthropic.com)
3. Basic familiarity with Python and JavaScript/TypeScript

---

## Step 1: Get Your API Key

Go to https://console.anthropic.com and create an API key. Then add it to your environment.

Your project already has an `.env.example` file in the project root. If you haven't already, copy it:

```bash
cp .env.example .env
```

Now open `.env` and add this line at the bottom:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Your `.gitignore` already excludes `.env` files, so this is safe.

---

## Step 2: Install the Anthropic SDK

From the project root, add the Anthropic Python package to your backend:

```bash
cd backend
uv add anthropic
```

This installs the official Anthropic Python SDK which handles authentication, request formatting, and streaming for you.

---

## Step 3: Update Your Backend Config

Open `backend/app/config.py`. Right now it looks like this:

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "My App"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

You need to make two changes:

**First**, add a field for the API key. Pydantic Settings automatically reads environment variables — when you set `ANTHROPIC_API_KEY` in your `.env` file, it loads into a matching field automatically (case-insensitive).

**Second**, fix the `.env` file path. Since the backend server runs from the `backend/` directory (look at the Makefile — `cd backend && uv run uvicorn ...`), a relative path of `".env"` would look for `backend/.env`. But our `.env` file is in the project root, one level up. Change it to `"../.env"`.

Here's the updated file:

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "My App"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173"]
    anthropic_api_key: str = ""

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8"}


settings = Settings()
```

---

## Step 4: Create the Chat Router (Backend)

This is the core of your chatbot. Create a new file at `backend/app/routers/chat.py`.

Before you write anything, look at the existing router in `backend/app/routers/health.py` to see the pattern this project uses:

```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
```

Notice: the router is created with `APIRouter()` (no prefix). The `/api` prefix is added later in `main.py` when the router is registered. Your chat router should follow this same pattern.

### Your turn: Define the data models

Your chat endpoint needs to accept a JSON body containing a list of messages. Each message has a `role` (either `"user"` or `"assistant"`) and `content` (the message text).

Using Pydantic's `BaseModel`, define two models:
1. `Message` — with `role: str` and `content: str`
2. `ChatRequest` — with `messages: list[Message]`

Try writing these yourself before looking at the solution.

<details>
<summary>Check your work</summary>

```python
from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
```

</details>

### Your turn: Write the streaming endpoint

Now for the main event. Your endpoint needs to:

1. Check that `settings.anthropic_api_key` is set (raise an `HTTPException` with status 500 if not)
2. Create an `anthropic.Anthropic` client with the API key
3. Convert the request messages to the format the API expects (list of dicts with `"role"` and `"content"` keys)
4. Define a generator function that uses `client.messages.stream()` to stream the response and `yield` each text chunk
5. Return a `StreamingResponse` wrapping that generator

Here are the key imports and tools you'll need:
- `from fastapi import APIRouter, HTTPException`
- `from fastapi.responses import StreamingResponse`
- `import anthropic`
- `from app.config import settings`
- The streaming API: `client.messages.stream(model="claude-sonnet-4-20250514", max_tokens=1024, system="...", messages=...)`
- Inside the stream context manager: `stream.text_stream` gives you an iterator of text chunks

Give it a shot. The endpoint should be `@router.post("/chat")`.

<details>
<summary>Check your work</summary>

Here's the complete `backend/app/routers/chat.py`:

```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import anthropic

from app.config import settings

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@router.post("/chat")
async def chat(request: ChatRequest):
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not set",
        )

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    api_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    def generate():
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="You are a helpful assistant. Keep responses concise.",
            messages=api_messages,
        ) as stream:
            for text in stream.text_stream:
                yield text

    return StreamingResponse(generate(), media_type="text/plain")
```

</details>

### Key concepts

- **Pydantic Models** (`Message`, `ChatRequest`): These validate incoming data automatically. If the frontend sends malformed data, FastAPI returns a helpful error instead of crashing.
- **Streaming**: Instead of waiting for Claude to finish its entire response (which can take several seconds), we send each word/chunk as soon as it's generated. This is what makes chatbots feel responsive.
- **Generator function** (`generate()`): The `yield` keyword makes this a generator. Think of it like a conveyor belt — it produces items one at a time instead of all at once.
- **`StreamingResponse`**: FastAPI sends each yielded chunk to the client immediately, keeping the HTTP connection open until the generator is exhausted.

---

## Step 5: Register the Router

Open `backend/app/main.py`. It currently looks like this:

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic goes here
    yield
    # Shutdown logic goes here


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
```

### Your turn: Register the chat router

Following the same pattern as the health router, add the chat router. You need:
1. An import for your new `chat` module
2. A call to `app.include_router` with the `/api` prefix

This is a two-line change. Try it yourself.

<details>
<summary>Check your work</summary>

Add `chat` to the import:

```python
from app.routers import health, chat
```

And add this line after the health router registration:

```python
app.include_router(chat.router, prefix="/api")
```

</details>

---

## Step 6: Test the Backend

Before building the frontend, let's make sure the backend works. Start it up:

```bash
make dev-backend
```

Then test with curl in another terminal:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Say hello in 3 words"}]}'
```

You should see a streamed text response appear. If you get an error about the API key, double-check that:
- Your `.env` file is in the **project root** (not inside `backend/`)
- The variable name is exactly `ANTHROPIC_API_KEY`
- You updated the `env_file` path in `config.py` to `"../.env"`

---

## Step 7: Build the Chat Interface (Frontend)

Now for the frontend. You'll be replacing the health-check display in `frontend/src/App.tsx` with a full chat interface.

### Your turn: Set up the component state

A chat interface needs to track three pieces of state:
1. The list of messages (each with `role` and `content`)
2. The current text in the input box
3. Whether a request is currently in-flight (loading state)

Plus a ref for auto-scrolling to the bottom of the chat.

Using React's `useState` and `useRef`, define the state for the component. Think about what TypeScript type you'd need for a message.

<details>
<summary>Check your work</summary>

```tsx
type Message = {
  role: "user" | "assistant";
  content: string;
};

// Inside the component:
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const bottomRef = useRef<HTMLDivElement>(null);
```

</details>

### Your turn: Write the `handleSend` function

This is the most important part of the frontend. When the user clicks Send, you need to:

1. Trim the input and bail out if it's empty or we're already loading
2. Add the user's message to the messages array
3. Clear the input box and set loading to true
4. Add an empty assistant message (you'll fill it in as chunks arrive)
5. `fetch("/api/chat", ...)` with the full message history as JSON
6. Read the response as a stream using `response.body.getReader()` and a `TextDecoder`
7. In a `while(true)` loop, read chunks and append each one to the last message in the array
8. Handle errors by replacing the assistant message content with an error string
9. Set loading to false in a `finally` block

**Important note about the existing `apiFetch` helper:** Your project has a helper at `frontend/src/api/client.ts` that calls `.json()` on the response. You can't use it here — streaming responses aren't JSON. Use the raw `fetch` API directly.

**Hints:**
- `response.body?.getReader()` gives you a `ReadableStreamDefaultReader`
- `new TextDecoder()` converts binary chunks to strings
- `reader.read()` returns `{ done: boolean, value: Uint8Array }`
- `decoder.decode(value, { stream: true })` decodes a chunk
- To update the last message in an array immutably: copy the array, replace the last element, return the copy

This is the hardest part of the tutorial. Take your time with it.

<details>
<summary>Check your work</summary>

```tsx
async function handleSend() {
  const trimmed = input.trim();
  if (!trimmed || isLoading) return;

  const userMessage: Message = { role: "user", content: trimmed };
  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  setInput("");
  setIsLoading(true);

  setMessages([...updatedMessages, { role: "assistant", content: "" }]);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No response body");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          content: last.content + chunk,
        };
        return updated;
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "assistant",
        content: "Sorry, something went wrong. Check the console for details.",
      };
      return updated;
    });
  } finally {
    setIsLoading(false);
  }
}
```

</details>

### Key concepts

- **`useState`**: React's way of tracking data that changes. When you call `setMessages(...)`, React re-renders the component with the new data.
- **`useRef`**: A way to reference a DOM element directly — like `document.getElementById` but the React way.
- **ReadableStream / Reader**: The browser's built-in API for reading streaming data. We read chunks in a `while` loop until `done` is true.
- **Why send the full message history?** LLMs don't have memory between requests. To maintain a conversation, we send every previous message each time.
- **Why not use `apiFetch`?** The existing helper in `frontend/src/api/client.ts` calls `response.json()`, which waits for the entire response and parses it as JSON. A streaming response is plain text that arrives in chunks — you need the raw `fetch` API to read it incrementally.

### The complete App.tsx

Once you've worked through the pieces above, put it all together. Replace the contents of `frontend/src/App.tsx`:

```tsx
import { useState, useRef, useEffect } from "react";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Check the console for details.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>LLM Chatbot</h1>
      </header>

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="empty-state">
            Send a message to start chatting.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-label">
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="message-content">
              {msg.content || (isLoading ? "Thinking..." : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={2}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
```

---

## Step 8: Update the Styling

Replace the contents of `frontend/src/App.css`. The current file has styles for the health-check display — you need chat-specific styles instead:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  max-width: 720px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f9fafb;
}

.header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  margin: auto;
  color: #9ca3af;
  font-size: 15px;
}

.message {
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.user .message-content {
  background: #2563eb;
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant .message-content {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.input-area {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: white;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-area textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.15s;
}

.input-area textarea:focus {
  border-color: #2563eb;
}

.input-area button {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.input-area button:hover:not(:disabled) {
  background: #1d4ed8;
}

.input-area button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
```

---

## Step 9: Run It

From your project root:

```bash
make dev
```

This starts both the backend (port 8000) and frontend (port 5173) simultaneously. Open http://localhost:5173 in your browser and start chatting.

---

## How It All Connects

Here's what happens when you click Send:

```
1. React adds your message to the messages array → UI updates instantly
2. React sends a POST to /api/chat with the full message history
3. Vite's dev proxy forwards /api/* to localhost:8000 (configured in frontend/vite.config.ts)
4. FastAPI receives the request, validates it against the ChatRequest model
5. FastAPI creates an Anthropic client and calls the streaming API
6. Claude generates tokens one at a time
7. FastAPI yields each token through StreamingResponse
8. The browser's ReadableStream reader receives each chunk
9. React appends each chunk to the assistant message → UI updates in real time
10. When the stream ends, isLoading is set to false
```

The proxy configuration in `frontend/vite.config.ts` is what makes this seamless — your frontend code can `fetch("/api/chat")` as a relative URL, and Vite forwards it to the backend at `localhost:8000` during development.

---

## Common Issues and Fixes

**"ANTHROPIC_API_KEY is not set"**
Make sure your `.env` file is in the **project root** (not inside `backend/`), and that you updated `config.py` to use `env_file: "../.env"`. The backend runs from the `backend/` directory, so the path is relative to there.

**CORS errors in browser console**
The Vite proxy in `frontend/vite.config.ts` should handle this during development. Make sure you're accessing the app through `http://localhost:5173` (Vite's server), not directly from `localhost:8000`.

**Stream seems to hang**
Check that the Anthropic SDK installed correctly (`cd backend && uv add anthropic`). Try the curl test from Step 6 to isolate whether the problem is in the backend or frontend.

**TypeScript errors in your editor**
If your editor shows errors for `response.body?.getReader()`, that's expected — TypeScript is being cautious about the nullable type. It works correctly at runtime.

---

## Summary of Changes

Here's every file you touched, for reference:

| File | Change |
|---|---|
| `.env` | Added `ANTHROPIC_API_KEY` |
| `backend/pyproject.toml` | `anthropic` added via `uv add` |
| `backend/app/config.py` | Added `anthropic_api_key` field, fixed `env_file` path |
| `backend/app/routers/chat.py` | **New file** — streaming chat endpoint |
| `backend/app/main.py` | Registered the chat router |
| `frontend/src/App.tsx` | Replaced health check with chat interface |
| `frontend/src/App.css` | Replaced with chat-specific styles |

---

## Next Steps

Once you have this working, here are natural things to add:

- **Markdown rendering**: Install `react-markdown` so code blocks and formatting display properly in assistant responses.
- **System prompt UI**: Add a text box that lets the user customize the system prompt (currently hardcoded in `chat.py`).
- **Conversation persistence**: Store chats in a database — the `docker-compose.yml` already has a commented-out PostgreSQL service ready to enable.
- **Multiple conversations**: Add a sidebar to switch between saved chats.
- **Error retry**: Add a "Retry" button on failed messages instead of just showing an error.
- **Token usage display**: The Anthropic API returns usage data — show it in the UI so you can track costs.
