const express = require('express');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const cors = require('cors'); // Add this

const app = express();

// Enable CORS for React dev server
app.use(cors({
  origin: 'http://localhost:3000', // Allow React
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true, // If using cookies/auth
}));

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
