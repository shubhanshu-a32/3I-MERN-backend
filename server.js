const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

//For environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

console.log('Environment variables loaded successfully');

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite's default ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

//Import routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

//Use routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

//Root route
app.get('/', (req, res) => {
    res.send('3I API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

//Connect to database
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGO_URI);
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('Full error details:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        console.log('Starting server initialization...');
        await connectDB();
        const PORT = 8000; // Using a higher port number
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log('Press Ctrl+C to stop the server');
        });

        // Add error handling for the server
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please choose a different port.`);
            } else {
                console.error('Server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();