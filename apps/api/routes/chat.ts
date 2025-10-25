import express from 'express';
import handleChatMessage from '../claude-chat';

const router = express.Router();

// POST endpoint for chat messages
router.post('/api/chat/message', async (req, res) => {
  try {
    const { message, projectName, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call Claude API handler
    const response = await handleChatMessage({
      message,
      projectName: projectName || 'PulseOfProject',
      context,
      role: 'junior-developer'
    });

    res.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      response: 'I apologize, but I\'m having trouble processing your message right now. Please try again.',
      timestamp: new Date()
    });
  }
});

// Health check endpoint
router.get('/api/chat/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date()
  });
});

export default router;