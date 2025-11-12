import { orchestratorModel } from '../services/ai.service.js';

export const handleChatRequest = async (req, res) => {
  const { prompt, userId } = req.body;
  try {
    
 

  const chat = orchestratorModel.startChat();
  
  // Send the initial prompt
  const initialResult = await chat.sendMessage(prompt);
  let response = initialResult.response;

  // Use a 'while' loop to handle multi-step function calls
  while (response.functionCalls && response.functionCalls.length > 0) {
    console.log("Agent: Model requested function calls...");
    const functionResponses = [];

    // Loop and call all functions requested in this turn
    for (const call of response.functionCalls) {
      const functionName = call.name;
      const functionToCall = agentFunctions[functionName];
      
      if (functionToCall) {
        console.log(`Agent: Calling function: ${functionName}`);
        
        // Call the agent, passing the userId
        const functionResponse = await functionToCall(call.args, userId);
        
        // Push the formatted response for the model
        functionResponses.push({
          functionResponse: { // This is the required wrapper object
            name: functionName,
            response: functionResponse,
          }
        });

      } else {
        console.error(`Error: Model tried to call unknown function: ${functionName}`);
        // Push an error response
        functionResponses.push({
          functionResponse: {
            name: functionName,
            response: { error: `Function ${functionName} not found.` },
          }
        });
      }
    }

    // Send all function results from this turn back to the model
    const nextResult = await chat.sendMessage(functionResponses);
    
    // Update 'response' with the model's *new* response
    // The loop will check this new response for more function calls
    response = nextResult.response;
    
  }
   } catch (error) {
    console.error("Error in function call loop:", error);
    res.status(500).json({ error: "Internal server error" });
  }

  // If no function call was needed (or the loop finished)
  // return the final text response.
  res.status(200).json({ response: response.text() });
};

// export const startSession = async (req, res) => {
//   const { userId } = req.body;

//   const chat = orchestratorModel.startChat();

//   res.status(200).json({ chatId: chat.chatId });
// };
