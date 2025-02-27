const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT posts.*, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id
        `);

        // Fetch comments for each post
        for (let post of posts) {
            const [comments] = await db.query(`
                SELECT comments.*, users.username 
                FROM comments 
                JOIN users ON comments.user_id = users.id
                WHERE comments.post_id = ?
            `, [post.id]);
            post.comments = comments;
        }

        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
router.post('/', async (req, res) => {
    const { user_id, content, image_url } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
            [user_id, content, image_url]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like a post
router.put('/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id]);
        res.json({ message: 'Post liked' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a comment
router.post('/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { user_id, content } = req.body;
    if (!user_id || !content) {
        return res.status(400).json({ error: 'user_id and content are required' });
    }
    try {
        await db.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [id, user_id, content]
        );
        res.status(201).json({ message: 'Comment added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;