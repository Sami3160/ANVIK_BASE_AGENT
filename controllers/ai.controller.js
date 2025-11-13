import { orchestratorModel } from '../services/ai.service.js';
import { agentFunctions } from '../config/ai.config.js';
export const handleChatRequest = async (req, res) => {
  const { prompt, userId } = req.body;
  console.log("user id-", userId);
  let response;
  try {
    const chat = orchestratorModel.startChat();
    const initialResult = await chat.sendMessage(prompt);
    response = initialResult.response;

    let functionCalls = response.functionCalls();
    while (functionCalls && functionCalls.length > 0) {
      console.log("Agent: Model requested function calls...");
      const functionResponses = [];

      for (const call of functionCalls) {
        const functionName = call.name;
        const functionToCall = agentFunctions[functionName];

        if (functionToCall) {
          console.log(`Agent: Calling function: ${functionName}`);

          const functionResponse = await functionToCall(call.args, userId);

          functionResponses.push({
            functionResponse: {
              name: functionName,
              response: functionResponse,
            }
          });
        } else {
          console.error(`Error: Model tried to call unknown function: ${functionName}`);
          functionResponses.push({
            functionResponse: {
              name: functionName,
              response: { error: `Function ${functionName} not found.` },
            }
          });
        }
      }

      const nextResult = await chat.sendMessage(functionResponses);
      response = nextResult.response;

      functionCalls = response.functionCalls();
    }

    console.log("res : ", response);
  } catch (error) {
    console.error("Error in function call loop:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  // If no function call was needed (or the loop finished)
  // return the final text response.
  console.log("final response is ..");
  console.log(response.candidates[0].content);
  res.status(200).json({ response: response.text() });
};


// export const handleHistoryBasedChat
