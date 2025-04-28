import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set in environment variables");
  process.exit(1);
}

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      const { filename, source, destination } = JSON.parse(job.data);
      console.log("Processing file:", filename);

      const loader = new PDFLoader(source);
      const docs = await loader.load();
      console.log(`Loaded ${docs.length} documents from PDF`);

      // Configure Gemini embeddings
      const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
        maxRetries: 5,
        maxConcurrency: 1,
        batchSize: 10,
      });

      console.log("Initializing vector store...");
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: "http://localhost:6333",
          collectionName: "pdf-docs",
        }
      );

      console.log("Adding documents to vector store...");
      // Process documents in smaller batches
      const batchSize = 5;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        console.log(
          `Processing batch ${i / batchSize + 1} of ${Math.ceil(
            docs.length / batchSize
          )}`
        );
        await vectorStore.addDocuments(batch);
        // Add a small delay between batches to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log("Documents successfully added to vector store");
    } catch (error) {
      console.error("Error processing job:", error);
      if (error.message.includes("quota")) {
        console.error(
          "Google API quota exceeded. Please check your billing details."
        );
      }
      throw error;
    }
  },
  {
    concurrency: 1,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
  if (err.message.includes("quota")) {
    console.error("Please check your Google API billing and quota status.");
  }
});
