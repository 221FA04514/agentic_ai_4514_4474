from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests
import faiss
import numpy as np
import json
import os

DATA_DIR = Path("data")
STORE_DIR = Path("vector_store")
STORE_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------
# Jina Embeddings (Free API)
# ---------------------------------------------------
def embed(text):
    r = requests.post(
        "https://api.jina.ai/v1/embeddings",
        headers={"Authorization": f"Bearer {os.getenv('JINA_API_KEY')}"},
        json={"model": "jina-embeddings-v2-base-en", "input": text},
    )
    return np.array(r.json()["data"][0]["embedding"]).astype("float32")

# ---------------------------------------------------
# Load PDFs + Chunk
# ---------------------------------------------------
def load_docs():
    docs = []
    for pdf in DATA_DIR.glob("*.pdf"):
        loader = PyPDFLoader(str(pdf))
        pdf_docs = loader.load()
        docs.extend(pdf_docs)
    return docs

def main():
    docs = load_docs()

    splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=150)
    chunks = splitter.split_documents(docs)

    meta = {}
    vectors = []

    for i, chunk in enumerate(chunks):
        vec = embed(chunk.page_content)
        vectors.append(vec)

        meta[i] = {
            "text": chunk.page_content,
            "source": chunk.metadata.get("source", "pdf"),
            "page": chunk.metadata.get("page", None),
        }

    # Build FAISS index
    dim = len(vectors[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors))

    # Save
    faiss.write_index(index, str(STORE_DIR / "index.faiss"))

    with open(STORE_DIR / "meta.json", "w") as f:
        json.dump(meta, f)

    print(f"✅ Ingested {len(chunks)} chunks successfully!")

if __name__ == "__main__":
    main()
