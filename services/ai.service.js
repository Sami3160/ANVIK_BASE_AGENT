import  {GoogleGenAI} from "@google/genai";
import { agentTools, agentFunctions } from '../config/ai.config.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
const config={
  tools:agentTools,
  toolConfig:{
    functionCallingConfig:{
      mode:'any'
    }
  }
}
const genAi = new GoogleGenerativeAI({});
console.log(genAi)
const orchestratorModel = genAi.getGenerativeModel({
  model: "gemini-2.5-pro", 
  config: config,
});
  
export { orchestratorModel }