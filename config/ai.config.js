import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCalendarEvents } from '../agents/calendar.agent.js';
import { getEmails } from '../agents/email.agent.js';
import { config } from "dotenv";
import { Type } from '@google/genai';



// 1. Tool Declarations (Schema for the Base Agent)
export const agentTools = [
  {
    functionDeclarations: [
      {
        name: "getCalendarEvents",
        description: "Get a list of Google Calendar events for a specific date.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            date: { type: "STRING", description: "The date (YYYY-MM-DD)" },
          },
          required: ["date"],
        },
      },
      {
        name: "setCalendarEvents",
        description: "Set a calendar event for a specified date(s)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            date: { type: "STRING", description: "The date (YYYY-MM-DD)" },
            event: { type: "STRING", description: "The event" },
            time: { type: "STRING", description: "The time" },
            description: { type: "STRING", description: "The description" },
            location: { type: "STRING", description: "The location" },

            userId: { type: "STRING", description: "The user ID" },
          },
          required: ["date", "event", "userId"],
        },
      },
      {
        name: "getEmails",
        description: "Get a list of emails based on a filter.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            filter: { type: "STRING", description: "e.g., 'unread', 'from:boss'" },
            userId: { type: "STRING", description: "The user ID" },
          },
          required: ["filter", "userId"],
        },
      },
      {
        name: 'scheduleMeeting',
        description: 'Schedules a meeting with specified attendees at a given time and date.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            attendees: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of people attending the meeting.',
            },
            date: {
              type: Type.STRING,
              description: 'Date of the meeting (e.g., "2024-07-29")',
            },
            time: {
              type: Type.STRING,
              description: 'Time of the meeting (e.g., "15:00")',
            },
            topic: {
              type: Type.STRING,
              description: 'The subject or topic of the meeting.',
            },
          },
          required: ['attendees', 'date', 'time', 'topic'],
        },
      }, {
        name: 'getCurrentTemperature',
        description: 'Gets the current temperature for a given location.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: {
              type: Type.STRING,
              description: 'The city name, e.g. San Francisco',
            },
          },
          required: ['location'],
        },
      }
    ],
  },
];


const config={
  tools:[{
    functionDeclarations:agentTools
  }]
  ,
  // Force the model to call 'any' function, instead of chatting.
    toolConfig: {
        functionCallingConfig: {
            mode: 'any'
        }
    }
}

export const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);


// const chat = ai.chats.create({
//     model: 'gemini-2.5-flash',
//     config: config
// });
// const response = await chat.sendMessage({message: 'Turn this place into a party!'});

// // Print out each of the function calls requested from this single call
// console.log("Example 1: Forced function calling");
// for (const fn of response.functionCalls) {
//     const args = Object.entries(fn.args)
//         .map(([key, val]) => `${key}=${val}`)
//         .join(', ');
//     console.log(`${fn.name}(${args})`);
// }



