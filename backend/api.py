from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama

# ✅ FastAPI app
app = FastAPI()

# ✅ CORS for frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ✅ Load vector database
db = Chroma(
    persist_directory="./policy_db",
    embedding_function=embeddings
)

# ✅ Retriever
retriever = db.as_retriever()

# ✅ LLM (OpenAI or fallback later)
llm = ChatOllama(
    model="llama3.2:1b",
    temperature=0.3
)

# ✅ Request body model
class AskBody(BaseModel):
    question: str

# ✅ Main ASK endpoint
@app.post("/ask")
def ask(body: AskBody):
    # Retrieve relevant chunks
    docs = retriever.invoke(body.question)
    context = "\n\n".join([d.page_content for d in docs])

    # Build prompt
    prompt = f"""
You are a helpful assistant for parents.
Use ONLY the context below to answer accurately.

Context:
{context}

Question:
{body.question}

Answer:
"""

    # LLM response
    answer = llm.invoke(prompt).content

    # Collect sources
    sources = []
    for d in docs:
        metadata = d.metadata or {}
        sources.append({
            "source": metadata.get("source", "document"),
            "page": metadata.get("page")
        })

    return {"answer": answer, "sources": sources}

# ✅ Health check
@app.get("/")
def root():
    return {"status": "Parent Policy Agent Running ✅"}
