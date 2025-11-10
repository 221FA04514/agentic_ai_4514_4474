from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load env vars
load_dotenv()

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.llms import Ollama

# ✅ FastAPI App
app = FastAPI()

# ✅ CORS for frontend (Render / Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ✅ Load Vector Store
db = Chroma(
    persist_directory="./policy_db",
    embedding_function=embeddings
)

retriever = db.as_retriever()

# ✅ LLM (changes automatically depending on Render env)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

llm = Ollama(
    model="llama3.1:8b",
    base_url=OLLAMA_URL,
    temperature=0.2,
)

# ✅ Request Body
class AskBody(BaseModel):
    question: str

# ✅ Main Route
@app.post("/ask")
def ask_question(body: AskBody):
    question = body.question

    # Retrieve docs
    docs = retriever.invoke(question)
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""
You are a helpful assistant for parents.

Use ONLY the context below.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""

    # Call LLM
    response = llm.invoke(prompt)

    # Collect sources
    sources = []
    for d in docs:
        m = d.metadata or {}
        sources.append({
            "source": m.get("source", "document"),
            "page": m.get("page")
        })

    return {
        "answer": response,
        "sources": sources
    }

@app.get("/")
def health():
    return {"message": "Backend running ✅"}
