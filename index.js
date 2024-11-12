// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

// Initialize app and server
const app = express();
const PORT = process.env.PORT || 5002;
const server = http.createServer(app);
const io = socketIo(server); // Initialize socket.io with HTTP server

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb+srv://dilbekshermatov:dilbek1233@cluster0.14dvh.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if connection fails
    });

// Define schemas with required fields for validation
const accountSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    follows: [{ id: String, email: String }],
    followers: [{ id: String, email: String }],
    nickName: String,
    email: { type: String, required: true },
    zametka: String,
    password: { type: String, required: true },
    description: String,
    note: String,
    current: [{ email: String }],
    avatar: String,
    stories: [{ id: Number, text: String, image: String }],
    likeItems: [String],
    saved: [{ id: String, userId: Number }]
});

const postSchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: Number, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    userImg: String,
    post: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    comments: { type: Array, default: [] },
    description: String
});

// Models
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Helper function for setting up CRUD routes
const createCRUDRoutes = (model, modelName) => {
    const router = express.Router();

    // GET all items
    router.get('/', async (req, res) => {
        try {
            const items = await model.find();
            res.json(items);
        } catch (err) {
            console.error(`Error fetching ${modelName}s:`, err);
            res.status(500).json({ message: `Error fetching ${modelName}s` });
        }
    });

    // GET single item by ID
    router.get('/:id', getItem(model, modelName), (req, res) => {
        res.json(res.item);
    });

    // POST new item
    router.post('/', async (req, res) => {
        const item = new model(req.body);
        try {
            const newItem = await item.save();
            res.status(201).json(newItem);
        } catch (err) {
            console.error(`Error creating ${modelName}:`, err.message);
            res.status(400).json({ message: err.message });
        }
    });

    // PUT update item by ID
    router.put('/:id', getItem(model, modelName), async (req, res) => {
        Object.assign(res.item, req.body);
        try {
            const updatedItem = await res.item.save();
            res.json(updatedItem);
        } catch (err) {
            console.error(`Error updating ${modelName}:`, err.message);
            res.status(400).json({ message: err.message });
        }
    });

    // DELETE item by ID
    router.delete('/:id', getItem(model, modelName), async (req, res) => {
        try {
            await res.item.remove();
            res.json({ message: `${modelName} deleted successfully` });
        } catch (err) {
            console.error(`Error deleting ${modelName}:`, err.message);
            res.status(500).json({ message: err.message });
        }
    });

    return router;
};

// Middleware to find item by ID
function getItem(model, modelName) {
    return async (req, res, next) => {
        let item;
        try {
            item = await model.findOne({ id: req.params.id });
            if (!item) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
        } catch (err) {
            console.error(`Error fetching ${modelName}:`, err.message);
            return res.status(500).json({ message: err.message });
        }

        res.item = item;
        next();
    };
}

// Set up routes
app.use('/accounts', createCRUDRoutes(Account, 'Account'));
app.use('/users', createCRUDRoutes(User, 'User'));
app.use('/posts', createCRUDRoutes(Post, 'Post'));

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
