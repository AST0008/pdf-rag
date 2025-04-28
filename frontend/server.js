const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// Enable CORS for all routes
app.use(cors());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Chat endpoint
app.get('/chat', (req, res) => {
  const message = req.query.message;
  console.log('Received message:', message);

  // Here you would typically process the message and generate a response
  // For now, we'll just echo the message back
  res.json({
    answer: `You said: ${message}`,
    source: [
      {
        pageContent: "Sample content",
        metadata: {
          loc: {
            pageNumber: 1
          },
          source: "sample.pdf"
        }
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 