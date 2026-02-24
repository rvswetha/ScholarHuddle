import cors from 'cors';

// ... other imports ...

app.use(cors({
  // Use the variable from Render's environment settings, 
  // or fallback to localhost for your own testing
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173', 
  credentials: true
}));