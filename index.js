const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

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

// Models
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Reels = mongoose.model('Reels', realsSchema);
const Live = mongoose.model('Live', liveSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Message = mongoose.model('Message', messageSchema);

// Create CRUD routes for models
const createCRUDRoutes = (model, modelName) => {
    const router = express.Router();

    // GET Barcha Ma'lumotlar
    router.get('/', async (req, res) => {
        try {
            const items = await model.find();
            res.json(items);
        } catch (err) {
            console.error(`GET /${modelName.toLowerCase()} xatosi:`, err.message);
            res.status(500).json({ message: err.message });
        }
    });

    // GET Bitta Ma'lumot
    router.get('/:id', getItem(model, modelName), (req, res) => {
        res.json(res.item);
    });

    // POST Yangi Ma'lumot Qo'shish
    router.post('/', async (req, res) => {
        console.log(`POST /${modelName.toLowerCase()}`);
        console.log('Request Body:', req.body);
        const item = new model(req.body);
        try {
            const newItem = await item.save();
            res.status(201).json(newItem);
        } catch (err) {
            console.error(`POST /${modelName.toLowerCase()} xatosi:`, err.message);
            res.status(400).json({ message: err.message });
        }
    });

    // PUT Ma'lumotni Yangilash
    router.put('/:id', getItem(model, modelName), async (req, res) => {
        Object.assign(res.item, req.body);
        try {
            const updatedItem = await res.item.save();
            res.json(updatedItem);
        } catch (err) {
            console.error(`PUT /${modelName.toLowerCase()}/${req.params.id} xatosi:`, err.message);
            res.status(400).json({ message: err.message });
        }
    });

    // DELETE Ma'lumotni O'chirish
    router.delete('/:id', getItem(model, modelName), async (req, res) => {
        try {
            await res.item.remove();
            res.json({ message: `${modelName} o'chirildi` });
        } catch (err) {
            console.error(`DELETE /${modelName.toLowerCase()}/${req.params.id} xatosi:`, err.message);
            res.status(500).json({ message: err.message });
        }
    });

    return router;
};

// Middleware: Ma'lumotni Topish
function getItem(model, modelName) {
    return async (req, res, next) => {
        let item;
        try {
            item = await model.findOne({ id: req.params.id });
            if (item == null) {
                return res.status(404).json({ message: `${modelName} topilmadi` });
            }
        } catch (err) {
            console.error(`GET_ITEM /${modelName.toLowerCase()}/${req.params.id} xatosi:`, err.message);
            return res.status(500).json({ message: err.message });
        }

        res.item = item;
        next();
    };
}

// Routerlarni Ulash
app.use('/accounts', createCRUDRoutes(Account, 'Account'));
app.use('/users', createCRUDRoutes(User, 'User'));
app.use('/posts', createCRUDRoutes(Post, 'Post'));
app.use('/reels', createCRUDRoutes(Reels, 'Reels'));
app.use('/lives', createCRUDRoutes(Live, 'Live'));
app.use('/comments', createCRUDRoutes(Comment, 'Comment'));
app.use('/messages', createCRUDRoutes(Message, 'Message'));

// MongoDB ulanish hodisalarini kuzatish
mongoose.connection.on('connected', () => {
    console.log('Mongoose: MongoDB ga muvaffaqiyatli ulandi');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose: Ulanish xatosi:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose: MongoDB bilan ulanish uzildi');
});

// MongoDB ga ulanish va serverni ishga tushurish
const startServer = async () => {
    try {
        await mongoose.connect(uri, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 30000, // 30 soniya timeout
            socketTimeoutMS: 45000  // 45 soniya socket timeout
        });
        console.log('MongoDB ga ulandi');

        const PORT = process.env.PORT || 5002;
        server.listen(PORT, () => {
            console.log(`Server ${PORT} portda ishlamoqda`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} allaqachon ishlatilmoqda. Iltimos, boshqa portni tanlang.`);
                process.exit(1);
            } else {
                console.error('Server xatosi:', err);
            }
        });
    } catch (err) {
        console.error('MongoDB ulanish xatosi:', err.message);
        process.exit(1); // Ulanish muvaffaqiyatsiz bo'lsa, jarayonni tugatish
    }
};

// Serverni boshlash
startServer();
