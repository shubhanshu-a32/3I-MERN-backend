const Post = require('../models/postModel');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const post = await Post.create({
      user: req.user._id,
      title,
      content,
      category,
    });
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name email profilePicture');
    
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (post) {
      // Check if user is the post owner
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }
      
      post.title = title || post.title;
      post.content = content || post.content;
      post.category = category || post.category;
      
      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (post) {
      // Check if user is the post owner
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }
      
      await Post.findByIdAndDelete(req.params.id);
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (post) {
      // Check if the post has already been liked by this user
      if (post.likes.includes(req.user._id)) {
        // Unlike the post
        post.likes = post.likes.filter(
          (like) => like.toString() !== req.user._id.toString()
        );
      } else {
        // Like the post
        post.likes.push(req.user._id);
      }
      
      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share a post
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (post) {
      post.shares += 1;
      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};