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
        process.exit(1); // Ulanish muvaffaqiyatsiz bo'lsa, dastur to'xtaydi
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
    password: String, // Parolni matn sifatida belgilang
    description: String,
    note: String,
    current: [{ email: String }],
    avatar: String,
    stories: [{ id: Number, text: String, image: String }],
    likeItems: [{ id: String, userId: Number }]
});


const postSchema = new mongoose.Schema({
    id: String,
    userId: Number,
    email: String,
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

// Create models
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Message = mongoose.model('Message', messageSchema); // Message model

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

app.post('/accounts', async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.json(account);
    } catch (err) {
        console.error("Error creating account:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/accounts/:id', async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(account);
    } catch (err) {
        console.error("Error updating account:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/accounts/:id', async (req, res) => {
    try {
        await Account.findByIdAndDelete(req.params.id);
        res.json({ message: 'Account deleted' });
    } catch (err) {
        console.error("Error deleting account:", err);
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

app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json(user);
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error("Error deleting user:", err);
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

app.post('/posts', async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(post);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error("Error deleting post:", err);
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

app.post('/comments', async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.json(comment);
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(comment);
    } catch (err) {
        console.error("Error updating comment:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/comments/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error("Error deleting comment:", err);
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

app.post('/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.json(message);
    } catch (err) {
        console.error("Error creating message:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/messages/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(message);
    } catch (err) {
        console.error("Error updating message:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete('/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
