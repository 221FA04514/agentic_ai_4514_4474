from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

DATA_DIR = Path("data")
PERSIST_DIR = "policy_db"

def load_docs():
    docs = []
    for pdf in DATA_DIR.glob("*.pdf"):
        loader = PyPDFLoader(str(pdf))
        docs.extend(loader.load())
    return docs

def main():
    docs = load_docs()
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = splitter.split_documents(docs)

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    db = Chroma(
        collection_name="policies",
        embedding_function=embeddings,
        persist_directory=PERSIST_DIR
    )
    db.add_documents(chunks)
    # Chroma auto-persists in 0.4+
    print(f"✅ Ingested {len(chunks)} chunks into {PERSIST_DIR}/")

if __name__ == "__main__":
    main()
