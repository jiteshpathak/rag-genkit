import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fetch from "node-fetch";
import { chunk } from "llm-chunk";
import { z, genkit, Document } from "genkit";
import { textEmbedding004, googleAI, gemini20Flash } from "@genkit-ai/googleai";
import {
  astraDBIndexerRef,
  astraDBRetrieverRef,
  astraDB,
} from "genkitx-astra-db";
import pdfParse from 'pdf-parse';



const collectionName = process.env.ASTRA_DB_COLLECTION_NAME!

const ai = genkit({
  plugins: [
    googleAI(),
    astraDB([
      {
        clientParams: {
          applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN!,
          apiEndpoint: process.env.ASTRA_DB_API_ENDPOINT!,
        },
        collectionName: collectionName,
        embedder: textEmbedding004,
      },
    ]),
  ],
  model: googleAI.model("gemini-2.0-flash"),
});

export const astraDBIndexer = astraDBIndexerRef({ collectionName });
export const astraDBRetriever = astraDBRetrieverRef({ collectionName });



async function extractTextFromPDF(url: string): Promise<string> {
  try {
    // 1. Fetch the PDF
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    // 2. Get the PDF as ArrayBuffer
    const pdfBuffer = await response.arrayBuffer();
    
    // 3. Parse the PDF
    const data = await pdfParse(Buffer.from(pdfBuffer));
    
    // 4. Return the extracted text
    return data.text;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
}


async function fetchTextFromWeb(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const doc = new JSDOM(html, { url });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  return article?.textContent || "";
}

export const ragFlow = ai.defineFlow(
  {
    name: "generate",
    inputSchema: z.string(),
    outputSchema: z.string()
  },
  async (prompt) => {
    const { text } = await ai.generate({
      prompt,
    });
    return text;
  }
);

export const ingest = ai.defineFlow(
  {
    name: "ingest",
    inputSchema: z.string().url().describe("URL"),
    outputSchema: z.void(),
  },
  async (url) => {
    let text: string;
    
    if (url.toLowerCase().endsWith('.pdf')) {
      text = await extractTextFromPDF(url);
    } else {
      text = await ai.run("extractText", async () => {
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html);
        const article = new Readability(dom.window.document).parse();
        return article?.textContent || "";
      });
    }

    const chunks = await ai.run("chunkText", async () => {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
      });
      return await textSplitter.splitText(text);
    });
    
    const documents = chunks.map(chunk => Document.fromText(chunk, { url }));
    await ai.index({
      indexer: astraDBIndexer,
      documents: chunks.map(chunk => Document.fromText(chunk, { url })),
    });
  }
);


export const rag = ai.defineFlow(
  { name: "rag", inputSchema: z.string(), outputSchema: z.string() },
  async (query) => {
    const docs = await ai.retrieve({
      retriever: astraDBRetriever,
      query, 
      options: {
        k: 5,
      }
    });
        const { text } = await ai.generate({
      prompt:` You are a helpful assistant. Use the following context to answer the question. If you don't know the answer, just say that you don't know. Don't try to make up an answer. Rethink the question if you don't have enough information to answer it. Ensure that your answer is concise and relevant to the question asked. Refuse to answer if the question is not related to the context provided.
      Question: ${query}`,
      docs,
    });
    return text;
  }
);


