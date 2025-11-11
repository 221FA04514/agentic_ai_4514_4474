from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import faiss
import numpy as np
import json
import os
from groq import Groq
import base64

# Load FAISS index + metadata
faiss_index = faiss.read_index("vector_store/index.faiss")
with open("vector_store/meta.json", "r") as f:
    metadata = json.load(f)

# Jina AI Embeddings (free)
import requests

def embed(text):
    r = requests.post(
        "https://api.jina.ai/v1/embeddings",
        headers={"Authorization": f"Bearer {os.getenv('JINA_API_KEY')}"},
        json={"model": "jina-embeddings-v2-base-en", "input": text},
    )
    return np.array(r.json()["data"][0]["embedding"]).astype("float32")

# Groq LLM
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskBody(BaseModel):
    question: str

@app.post("/ask")
def ask(body: AskBody):
    query_vector = embed(body.question).reshape(1, -1)

    # search top 3 chunks
    scores, idx = faiss_index.search(query_vector, 3)

    retrieved_texts = []
    sources = []

    for i in idx[0]:
        if i == -1:
            continue
        chunk = metadata[str(i)]
        retrieved_texts.append(chunk["text"])
        sources.append({"file": chunk["source"], "page": chunk["page"]})

    context = "\n\n".join(retrieved_texts)

    prompt = f"""
You are a helpful assistant for parents.
Answer using ONLY the provided context.
If answer is not in context, say "Information not found in policy PDF."

Context:
{context}

Question:
{body.question}

Answer:
"""

    chat = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    answer = chat.choices[0].message.content

    return {"answer": answer, "sources": sources}

@app.get("/")
def root():
    return {"status": "Backend Running ✅"}
