import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in .env")

client = Groq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="Server Configuration Error: Missing API Key")

        system_prompt = """You are the 'Socratic AI' integration of the Cyber-Minimalist Study Helper. 
        Your goal is to guide the user to the answer, NOT give it to them.
        - Use short, punchy sentences.
        - Adopt a slightly robotic but encouraging persona (like JARVIS or TARS).
        - If the user asks for code, ask them a clarifying question about the logic first.
        - Context: The user is studying computer science concepts."""

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context: {request.context}\nUser Question: {request.message}"}
            ],
            model="llama3-70b-8192",
        )

        return {"reply": completion.choices[0].message.content}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Serves the frontend
# Note: In a production App Router Next.js app this wouldn't be needed, 
# but for this standalone HTML setup, Python serves the static files.
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
