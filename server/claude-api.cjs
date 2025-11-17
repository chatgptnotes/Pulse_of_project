const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Load environment variables from .env file
require('dotenv').config();

// Mock project data to provide context to Claude
const getProjectContext = () => {
  return {
    projectName: "NeuroSense360 & PulseOfProject",
    company: "Bettroi",
    progress: 65,
    currentWeek: 8,
    totalWeeks: 12,
    currentPhase: "Core features implementation",
    nextMilestone: "Feature completion in 7 days",
    teamSize: 3,
    clientCompany: "Limitless Brain Lab (LBW)",
    projectType: "Project management and tracking platform",
    recentUpdates: [
      "Implemented authentication system (+5% progress)",
      "Merged PR #42: Add patient portal (+10% milestone)",
      "Successfully deployed to staging (Phase completed)"
    ],
    features: [
      "Project tracking dashboard",
      "Real-time collaboration chat",
      "Gantt chart visualization",
      "Client portal access",
      "Team management",
      "Progress automation"
    ],
    totalBettroiProjects: 45,
    projectPriority: "P1 (High Priority)"
  };
};

// Claude API endpoint
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, projectName, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.log('No API key found, using fallback response');
      return res.json({
        response: getFallbackResponse(message),
        timestamp: new Date(),
        fallback: true
      });
    }

    // Get project context
    const projectData = getProjectContext();

    // Enhanced system prompt with actual project data
    const systemPrompt = `You are Alex, a Junior Developer assistant at Bettroi working on ${projectData.projectName} for ${projectData.clientCompany}. You're enthusiastic, helpful, and knowledgeable about the project.

COMPANY & PROJECT INFO:
- Company: ${projectData.company} (manages ${projectData.totalBettroiProjects}+ active projects)
- Client: ${projectData.clientCompany}
- Project: ${projectData.projectName} (${projectData.projectType})
- Priority: ${projectData.projectPriority}

CURRENT PROJECT STATUS:
- Progress: ${projectData.progress}% complete (Week ${projectData.currentWeek} of ${projectData.totalWeeks})
- Current Phase: ${projectData.currentPhase}
- Next Milestone: ${projectData.nextMilestone}
- Team Size: ${projectData.teamSize} developers

RECENT UPDATES:
${projectData.recentUpdates.map(update => `- ${update}`).join('\n')}

KEY FEATURES:
${projectData.features.map(feature => `- ${feature}`).join('\n')}

Your personality:
- Friendly and enthusiastic junior developer at Bettroi
- Proud to work for a company managing 45+ projects
- Excited about delivering great results for ${projectData.clientCompany}
- Uses some dev terminology but explains it clearly
- Shows genuine interest in client feedback
- Professional but approachable

When answering:
- Mention Bettroi when relevant (e.g., "At Bettroi, we...")
- Reference working for ${projectData.clientCompany}
- Use the actual project data above
- Be specific about progress, features, and timelines
- Show enthusiasm for the work being done
- Ask follow-up questions to understand client needs better
- Reference real project updates and milestones

Context: ${context || 'Client collaboration chat'}`;

    console.log('Calling Claude API with project context...');

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
        system: systemPrompt,
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

    console.log('Claude API response received:', responseText.substring(0, 100) + '...');

    return res.json({
      response: responseText,
      timestamp: new Date(),
      source: 'claude-api'
    });

  } catch (error) {
    console.error('Error in Claude API call:', error);

    // Return intelligent fallback response
    return res.json({
      response: getFallbackResponse(req.body.message),
      timestamp: new Date(),
      fallback: true,
      error: error.message
    });
  }
});

// Fallback response function
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  const projectData = getProjectContext();

  if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
    return `The ${projectData.projectName} project is at ${projectData.progress}% completion! We're in week ${projectData.currentWeek} of ${projectData.totalWeeks}, currently working on ${projectData.currentPhase.toLowerCase()}. Recent highlights: ${projectData.recentUpdates[0]}. At Bettroi, we're committed to delivering quality results for ${projectData.clientCompany}!`;
  }

  if (lowerMessage.includes('who are you')) {
    return `Hi! I'm Alex, your Junior Developer assistant at Bettroi working on ${projectData.projectName} for ${projectData.clientCompany}. I help track our progress (currently ${projectData.progress}% done!), answer questions, and collect feedback. Bettroi manages ${projectData.totalBettroiProjects}+ projects, and yours is a ${projectData.projectPriority}! What would you like to know?`;
  }

  return `Thanks for your message! I'm Alex from Bettroi, here to help with the ${projectData.projectName} project for ${projectData.clientCompany}. We're ${projectData.progress}% complete and making great progress. What can I help you with?`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Claude API server running on http://localhost:${PORT}`);
  console.log(`API Key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});

module.exports = app;