# PaperMind

A modern web application that enables intelligent PDF document processing and question-answering using RAG (Retrieval-Augmented Generation) technology.

## Features

- **PDF Document Processing**: Upload and process PDF documents
- **Intelligent Search**: Advanced semantic search capabilities using vector embeddings
- **Question Answering**: Get accurate answers to questions about your PDF documents using AI
- **Modern UI**: Clean and intuitive user interface built with Next.js and Tailwind CSS

## Tech Stack

### Backend

- **Node.js & Express**: Server framework
- **Vector Database**: Qdrant for efficient vector storage and retrieval
- **Queue System**: BullMQ for background processing
- **Document Processing**:
  - PDF parsing with @langchain/community PDFLoader
- **AI Integration**:
  - LangChain for RAG implementation
  - Google Generative AI (Gemini)
  - Vector embeddings for semantic search

### Frontend

- **Next.js 15**: React framework with server-side rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible UI components
- **Framer Motion**: Smooth animations

### Infrastructure

- **Docker**: Containerization for easy deployment
- **Redis**: Caching and queue management (via Valkey)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pdf-rag.git
   cd pdf-rag
   ```

2. Start the required services:

   ```bash
   docker compose up
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

4. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

5. Create a `.env` file in the backend directory with your API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```

### Running the Application

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
pdf-rag/
├── backend/              # Backend server
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded documents
│   ├── index.js         # Main server file
│   └── worker.js        # Background worker
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── public/         # Static assets
└── docker-compose.yml  # Docker configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
