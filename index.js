const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5002;

const server = http.createServer(app);
const io = socketIo(server); 

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb+srv://dilbekshermatov:dilbek1233@cluster0.14dvh.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // If the connection fails, the app will stop
    });

// Define schemas
const accountSchema = new mongoose.Schema({
    id: Number,
    name: String,
    username: String
});

const userSchema = new mongoose.Schema({
    id: String,
    follows: [{ id: String, email: String }],
    followers: [{ id: String, email: String }],
    nickName: String,
    email: String,
    zametka: String,
    password: String, // Store password as text
    description: String,
    note: String,
    current: [{ email: String }],
    avatar: String,
    stories: [{ id: Number, text: String, image: String }],
    likeItems: [String],
    saved: [{ id: String, userId: Number }]
});

const postSchema = new mongoose.Schema({
    id: String,
    userId: Number,
    email: String,
    username: String,
    userImg: String,
    post: String,
    likeCount: Number,
    comments: Array,
    description: String
});

const liveSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    startTime: { type: String, required: true },
    videoTitle: { type: String, required: true },
    status: { type: String, required: true },
    roomId: { type: String, required: true }
});

const realsSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    videoUrl: { type: String, required: true },
    description: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: [String], default: [] },
    sharedWith: { type: [String], default: [] }
});

const commentSchema = new mongoose.Schema({
    id: Number,
    productId: Number,
    comment: String,
    author: String,
    timestamp: String
});

// New message schema
const messageSchema = new mongoose.Schema({
    id: String,
    sender: String,
    receiver: String,
    text: String,
    time: String,
    status: String,
    audio: String, // Optional field
    video: String  // Optional field
});

// Helper function to create CRUD routes
const createCRUDRoutes = (model, modelName) => {
    const router = express.Router();

    // GET All items
    router.get('/', async (req, res) => {
        try {
            const items = await model.find();
            res.json(items);
        } catch (err) {
            console.error(`GET /${modelName.toLowerCase()} error:`, err.message);
            res.status(500).json({ message: err.message });
        }
    });

    // GET Single item by id
    router.get('/:id', getItem(model, modelName), (req, res) => {
        res.json(res.item);
    });

    // POST New item
    router.post('/', async (req, res) => {
        const item = new model(req.body);
        try {
            const newItem = await item.save();
            res.status(201).json(newItem);
        } catch (err) {
            console.error(`POST /${modelName.toLowerCase()} error:`, err.message);
            res.status(400).json({ message: err.message });
        }
    });

    // PUT Update item by id
    router.put('/:id', getItem(model, modelName), async (req, res) => {
        Object.assign(res.item, req.body);
        try {
            const updatedItem = await res.item.save();
            res.json(updatedItem);
        } catch (err) {
            console.error(`PUT /${modelName.toLowerCase()}/${req.params.id} error:`, err.message);
            res.status(400).json({ message: err.message });
        }
    });

    // DELETE item by id
    router.delete('/:id', getItem(model, modelName), async (req, res) => {
        try {
            await res.item.remove();
            res.json({ message: `${modelName} deleted` });
        } catch (err) {
            console.error(`DELETE /${modelName.toLowerCase()}/${req.params.id} error:`, err.message);
            res.status(500).json({ message: err.message });
        }
    });

    return router;
};

// Middleware to fetch a single item by id
function getItem(model, modelName) {
    return async (req, res, next) => {
        let item;
        try {
            item = await model.findOne({ id: req.params.id });
            if (!item) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
        } catch (err) {
            console.error(`GET_ITEM /${modelName.toLowerCase()}/${req.params.id} error:`, err.message);
            return res.status(500).json({ message: err.message });
        }

        res.item = item;
        next();
    };
}

// Create models from schemas
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Reels = mongoose.model('Reels', realsSchema);
const Live = mongoose.model('Live', liveSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Message = mongoose.model('Message', messageSchema);

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose: Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose: Connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose: Disconnected from MongoDB');
});

// Start the server and connect to MongoDB
const startServer = async () => {
    try {
        await mongoose.connect(uri, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000  // 45 seconds socket timeout
        });
        console.log('MongoDB connected');

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please choose another port.`);
                process.exit(1);
            } else {
                console.error('Server error:', err);
            }
        });
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit if MongoDB connection fails
    }
};

// Start the server
startServer();
