import 'dotenv/config';
import app from './app.js';
import { initScheduler } from './services/scheduler.js';
import notificationRoutes from './routes/notificationRoutes.js';
// Get the port number from your .env file, or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and make it listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
  //Start the clock!
  initScheduler();
});