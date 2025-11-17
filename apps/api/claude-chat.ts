import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ChatRequest {
  message: string;
  context?: string;
  projectName?: string;
  role?: 'junior-developer' | 'senior-developer';
}

export interface ChatResponse {
  response: string;
  timestamp: Date;
}

// System prompt for Junior Developer skill
const JUNIOR_DEVELOPER_PROMPT = `You are a Junior Developer assistant working on a project management platform called PulseOfProject.
You help clients with:
- Project status updates and progress tracking
- Understanding technical features and implementations
- Answering questions about timelines and milestones
- Collecting requirements and feedback
- Providing helpful development insights
- Troubleshooting basic issues

Be friendly, professional, and helpful. Keep responses concise but informative.
Current project completion: 65%
Timeline: 12-week project, currently in week 8
Next milestone: Core features completion in 7 days`;

export async function handleChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Use the junior developer system prompt
    const systemPrompt = JUNIOR_DEVELOPER_PROMPT;

    // Create a message with Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: request.message
        }
      ]
    });

    // Extract the response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : 'I apologize, but I couldn\'t generate a response. Please try again.';

    return {
      response: responseText,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);

    // Fallback to local responses if API fails
    return {
      response: generateFallbackResponse(request.message),
      timestamp: new Date()
    };
  }
}

// Fallback responses when API is unavailable
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
    return 'I\'m your dedicated Junior Developer assistant for this project. I\'m here to help with development discussions, track progress, and assist with any requirements.';
  }

  if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
    return 'The project is at 65% completion. We\'re currently in week 8 of our 12-week timeline. All milestones are on track!';
  }

  if (lowerMessage.includes('timeline') || lowerMessage.includes('deadline')) {
    return 'We have 4 weeks remaining in our 12-week project timeline. The next major milestone is in 7 days.';
  }

  if (lowerMessage.includes('help')) {
    return 'I can help you with project status, timelines, features, bug reports, and requirements. What would you like to know?';
  }

  return 'Thank you for your message. I\'m here to help with any project-related questions or concerns you might have.';
}

export default handleChatMessage;