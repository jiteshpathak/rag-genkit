# RAG Genkit

This project demonstrates a modern Retrieval-Augmented Generation (RAG) pipeline using [Genkit](https://github.com/genkit-dev/genkit), Google AI, LangChain, and Astra DB. It extracts text from web pages, chunks and embeds the content, indexes it in a vector database, and enables advanced question-answering over the ingested data.

## Features

- **Extracts readable text from web URLs** using Mozilla's Readability and JSDOM.
- **Chunks text** with LangChain's RecursiveCharacterTextSplitter for efficient processing.
- **Embeds and indexes content** in Astra DB (a vector database) using Genkit's Astra DB plugin and Google AI's text embedding.
- **Retrieves relevant documents** for user queries and generates answers using Gemini 2.0 Flash.
- **Three main flows:** ingestion, RAG (retrieval-augmented generation), and simple Gemini-based text generation.

---

## How It Works

### 1. Extracting Text from Web URLs

The ingestion flow fetches a web page and extracts its main content using:

- **JSDOM:** Creates a virtual DOM from the HTML, simulating a browser environment in Node.js.
- **Mozilla Readability:** Parses the virtual DOM to extract the main article text, filtering out navigation, ads, and other non-essential elements.

*Why a virtual DOM?*  
Readability requires DOM APIs (like `document`), which are only available in browsers. JSDOM provides these APIs in Node.js, enabling Readability to work server-side.

### 2. Chunking with LangChain

Long texts are split into manageable, overlapping chunks using LangChain's `RecursiveCharacterTextSplitter`. This ensures that each chunk fits within model and embedding limits, and that context is preserved across chunk boundaries.

### 3. Embedding and Indexing with Genkit & Astra DB

- **Genkit:** Orchestrates flows, plugins, and model calls.
- **Google AI's text embedding:** Converts each text chunk into a high-dimensional vector (embedding) that captures its semantic meaning.
- **Astra DB:** Stores these embeddings for efficient similarity search.

*What is text embedding?*  
Text embedding is the process of converting text into a vector of numbers that represents its meaning. Similar texts have similar vectors, enabling semantic search and retrieval.

### 4. Retrieval and Generation

- **RAG Flow:** For a user query, retrieves the top-k most relevant chunks from Astra DB using vector similarity, then passes them (as context) to Gemini 2.0 Flash to generate an answer.
- **Simple Generation Flow:** Uses Gemini 2.0 Flash to generate text from a prompt, without retrieval.

---

## Flows

- **`ingest`**: Ingests a web page by URL, extracts and chunks text, embeds and indexes it in Astra DB.
- **`rag`**: Answers a question using retrieved context from Astra DB and Gemini 2.0 Flash.
- **`generate`**: Generates text from a prompt using Gemini 2.0 Flash.

---

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Set up your `.env` file** with Astra DB and Google AI credentials:
   ```
   ASTRA_DB_COLLECTION_NAME=your_collection
   ASTRA_DB_APPLICATION_TOKEN=your_token
   ASTRA_DB_API_ENDPOINT=your_endpoint
   ```

3. **Run the project:**
   ```sh
   npm run start
   ```

---

## File Overview

- [`index.ts`](index.ts): Main pipeline and flow definitions.
- [`package.json`](package.json): Dependencies and scripts.
- [`.gitignore`](.gitignore): Ignores `node_modules` and `.env`.

---

## License