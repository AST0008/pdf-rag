import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });



const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is running",
  });
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      source: req.file.path,
      destination: req.file.destination,
    })
  );
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message:
        "No file uploaded or incorrect field name. Please use 'pdf' as the field name.",
    });
  }

  return res.json({
    status: "success",
    message: "File uploaded successfully",
    file: req.file,
  });
});

app.get("/chat", async (req, res) => {
  try {
    const userQuery =
      req.query.message ||
      "What is the difference between supervised and unsupervised learning?";
    console.log("userQuery", userQuery);
    // Get relevant context from vector store
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
      maxRetries: 5,
      maxConcurrency: 1,
      batchSize: 10,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "pdf-docs",
      }
    );

    const retriever = vectorStore.asRetriever({
      k: 3, // Increased number of relevant chunks
    });

    const context = await retriever.invoke(userQuery);
    console.log("context", context);

    // Format context for better readability
    const formattedContext = context.map((doc, index) => ({
      id: index + 1,
      content: doc.pageContent.trim(),
      source: doc.metadata?.source || "Unknown source",
      pageNumber: doc.metadata?.page || "Unknown page",
      documentName: doc.metadata?.filename || "Unknown document",
      documentType: doc.metadata?.type || "Unknown type"
    }));

    // Create a more structured prompt
    const SYSTEM_PROMPT = `
    You are a helpful assistant that answers questions based on the provided context.
    Please provide clear, concise, and accurate answers.
    
    Context:
    ${formattedContext.map((doc) => `[${doc.id}] ${doc.content}`).join("\n\n")}
    
    Guidelines:
    1. Base your answer strictly on the provided context
    2. If the context doesn't contain enough information, say so
    3. Be specific and cite relevant parts of the context
    4. Format your response in a clear, readable way
    `;

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: [
        {
          role: "user",
          parts: [{ text: userQuery }],
        },
        {
          role: "model",
          parts: [{ text: SYSTEM_PROMPT }],
        },
      ],
    });

    const response = await chat.sendMessage({
      message: userQuery,
    });
    console.log("response", response.text);

    res.json({
      status: "success",
      data: {
        query: userQuery,
        answer: response.text,
        context: formattedContext,
        metadata: response.metadata,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process chat request",
      error: error.message,
    });
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "error",
      message: `Multer error: ${err.message}`,
      field: err.field,
    });
  }
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
