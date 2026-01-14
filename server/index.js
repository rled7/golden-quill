const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

// --- Environment Variable Loading ---
const envPath = path.resolve(__dirname, '.env');
console.log(`Attempting to load .env file from: ${envPath}`);

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(".env file loaded.");
  console.log("GOOGLE_API_KEY loaded:", process.env.GOOGLE_API_KEY ? "Yes" : "No");
} else {
  console.error(".env file not found at the specified path.");
}

const { GoogleGenerativeAI } = require('@google/genai');
const { MemoryVectorStore } = require('@langchain/community/vectorstores/memory');
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const { PromptTemplate } = require('@langchain/core/prompts');
const { Document } = require('langchain/document');


const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- AI Initialization ---
try {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not defined in your .env file.");
  }
} catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error.message);
    process.exit(1); // Exit if AI cannot be initialized
}

app.get('/', (req, res) => {
  res.json({ message: 'Golden Quill Server is running!' });
});

app.post('/api/rag', async (req, res) => {
    console.log("Received request for /api/rag");
    const { query, bankItems } = req.body;
  
    if (!query || !bankItems || !Array.isArray(bankItems)) {
      console.error("Invalid request body:", req.body);
      return res.status(400).json({ error: 'Invalid request body' });
    }
  
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "embedding-001",
        });

        const documents = bankItems.map(item => new Document({ pageContent: item.content, metadata: { id: item.id } }));

        const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

        const retriever = vectorStore.asRetriever();

        const model = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "gemini-pro",
            temperature: 0.7,
        });

        const template = `Answer the question based only on the following context:
        {context}
        
        Question: {question}`;

        const prompt = PromptTemplate.fromTemplate(template);

        const chain = RunnableSequence.from([
            {
                context: retriever.pipe(docs => docs.map(d => d.pageContent).join('\n')),
                question: (input) => input.question,
            },
            prompt,
            model,
            new StringOutputParser(),
        ]);

        const result = await chain.invoke({ question: query });
      
        console.log("LLM Response:", result);
        res.json({ response: result });
  
    } catch (error) {
      console.error("Error in /api/rag endpoint:", error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});