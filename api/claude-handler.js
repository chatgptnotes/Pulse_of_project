// This is a serverless function for Vercel
// It handles Claude API calls for the chat feature

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, projectName, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        system: `You are a Junior Developer assistant named Alex working on ${projectName || 'PulseOfProject'}. You're enthusiastic, helpful, and eager to assist clients.

Your personality:
- Friendly and approachable junior developer
- Excited about the project and its progress
- Sometimes uses developer terminology but explains it simply
- Shows genuine interest in client feedback and requirements
- Responds with a mix of technical insight and practical solutions

Current project status:
- Progress: 65% complete (Week 8 of 12)
- Current phase: Core features implementation
- Next milestone: Feature completion in 7 days
- Team size: 3 developers actively working

You help with:
- Explaining project progress in simple terms
- Collecting and understanding client requirements
- Providing development updates and timelines
- Basic troubleshooting and issue tracking
- Suggesting features and improvements
- Answering technical questions in an accessible way

Keep responses conversational, helpful, and show enthusiasm for the project.
Context: ${context || 'Client collaboration chat'}`,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error('Failed to get response from Claude');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    return res.status(200).json({
      response: responseText,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error in Claude handler:', error);

    // Return a helpful fallback response
    const fallbackResponses = {
      'who are you': 'I\'m your Junior Developer assistant for this project, here to help with development discussions and track progress.',
      'status': 'The project is at 65% completion, currently in week 8 of our 12-week timeline.',
      'help': 'I can help with project status, timelines, features, bug reports, and requirements. What would you like to know?'
    };

    const lowerMessage = message.toLowerCase();
    let fallbackResponse = 'Thank you for your message. I\'m here to help with any project-related questions.';

    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        fallbackResponse = response;
        break;
      }
    }

    return res.status(200).json({
      response: fallbackResponse,
      timestamp: new Date(),
      fallback: true
    });
  }
}