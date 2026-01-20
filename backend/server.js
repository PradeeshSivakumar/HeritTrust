require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/herittrust').then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const projectsRouter = require('./routes/projects');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');

app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);

// Serve uploads statically for demo
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('HeritTrust Backend API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
