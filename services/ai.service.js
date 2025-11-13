import  {GoogleGenAI} from "@google/genai";
import 'dotenv/config'
import { agentTools } from '../config/ai.config.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
const config={
  tools:agentTools,
  toolConfig:{
    functionCallingConfig:{
      mode:'any'
    }
  }
}

const genAi = new GoogleGenerativeAI(process.env.AI_API_KEY);
const orchestratorModel = genAi.getGenerativeModel({
  model: "gemini-2.5-flash", 
  ...config,
});


  
export { orchestratorModel }