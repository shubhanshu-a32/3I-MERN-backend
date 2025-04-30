const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  sharePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Get all posts (public)
router.get('/', getPosts);

// Get post by ID (public)
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/share', protect, sharePost);

module.exports = router;