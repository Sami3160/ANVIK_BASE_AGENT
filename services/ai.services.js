const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class AIService {
  constructor() {
    // Initialize with your API key from environment variables
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });
  }

  /**
   * Generate content using the Gemini model
   * @param {string} prompt - The input prompt for the AI
   * @returns {Promise<string>} - The generated content
   */
  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  /**
   * Start a chat session
   * @returns {object} - Chat session object
   */
  startChat() {
    return this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
  }

  /**
   * Send a message in a chat session
   * @param {object} chat - The chat session
   * @param {string} message - The message to send
   * @returns {Promise<string>} - The AI's response
   */
  async sendMessage(chat, message) {
    try {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }
}

module.exports = new AIService();