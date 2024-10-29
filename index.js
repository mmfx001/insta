const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb+srv://dilbekshermatov:dilbek1233@cluster0.14dvh.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
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
    description: String,
    note: String,
    password: String,
    current: [{ email: String }],
    avatar: String,
    stories: [{ id: Number, text: String, image: String }],
    likeItems: [{ id: String, userId: Number }]
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
    audio: String,
    video: String
});

// New schemas for thisMonth and earlier
const activitySchema = new mongoose.Schema({
    id: Number,
    user: String,
    avatar: String,
    action: String,
    time: String,
    followable: Boolean
});

// Create models
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Message = mongoose.model('Message', messageSchema);
const Activity = mongoose.model('Activity', activitySchema);

// Sample data for thisMonth and earlier (you can populate it from your database)
const thisMonthData = [
    {
        id: 1,
        user: "Alice",
        avatar: "https://example.com/avatar1.jpg",
        action: "начал(-а) использовать Threads – новое приложение для микроблогов от Instagram.",
        time: "2 hours ago",
        followable: false
    },
    {
        id: 2,
        user: "Bob",
        avatar: "https://example.com/avatar2.jpg",
        action: "commented: 'Great shot!'",
        time: "5 hours ago",
        followable: false
    }
];

const earlierData = [
    {
        id: 3,
        user: "Charlie",
        avatar: "https://example.com/avatar3.jpg",
        action: " есть в Instagram. Вы можете знать этого человека.",
        time: "2 days ago",
        followable: true
    },
    {
        id: 4,
        user: "Diana",
        avatar: "https://example.com/avatar4.jpg",
        action: " есть в Instagram. Вы можете знать этого человека.",
        time: "1 week ago",
        followable: true
    },
    {
        id: 5,
        user: "Roma",
        avatar: "https://example.com/avatar4.jpg",
        action: " есть в Instagram. Вы можете знать этого человека.",
        time: "1 week ago",
        followable: true
    }
];

// API routes with error handling
// Accounts
app.get('/accounts', async (req, res) => {
    try {
        const accounts = await Account.find();
        res.json(accounts);
    } catch (err) {
        console.error("Error fetching accounts:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Comments
app.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Messages
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// New routes for thisMonth and earlier
app.get('/thisMonth', (req, res) => {
    res.json(thisMonthData);
});

app.get('/earlier', (req, res) => {
    res.json(earlierData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
