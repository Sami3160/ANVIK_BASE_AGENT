import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCalendarEvents , setBirthdayEvent, setCalendarEvent} from '../agents/calendar.agent.js';
import { getEmails } from '../agents/email.agent.js';
import { config } from "dotenv";
import { Type } from '@google/genai';

import { google } from 'googleapis';


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
            userId: { type: "STRING", description: "The user ID" },
          },
          required: ["date", "userId"],
        },
      },
      {
        name: "setCalendarEvent",
        description: "Set a calendar event. All times must include a timezone.",
        parameters: {
          type: "OBJECT",
          properties: {
            summary: {
              type: "STRING",
              description: "The title or summary of the event."
            },
            start: {
              type: "OBJECT",
              description: "The start time, including date and timezone.",
              properties: {
                dateTime: {
                  type: "STRING",
                  description: "ISO 8601 format, e.g., '2025-11-20T09:00:00-07:00'"
                },
                timeZone: {
                  type: "STRING",
                  description: "The timezone, e.g., 'America/Los_Angeles' or 'Asia/Kolkata'"
                },
              },
              required: ["dateTime", "timeZone"],
            },
            end: {
              type: "OBJECT",
              description: "The end time, including date and timezone.",
              properties: {
                dateTime: {
                  type: "STRING",
                  description: "ISO 8601 format, e.g., '2025-11-20T10:00:00-07:00'"
                },
                timeZone: {
                  type: "STRING",
                  description: "The timezone, e.g., 'America/Los_Angeles' or 'Asia/Kolkata'"
                },
              },
              required: ["dateTime", "timeZone"],
            },
            location: {
              type: "STRING",
              description: "The location of the event (e.g., '800 Howard St., SF')."
            },
            description: {
              type: "STRING",
              description: "A detailed description of the event."
            },
            attendees: {
              type: "ARRAY",
              description: "A list of attendee email addresses.",
              items: { type: "STRING" }
            },
            recurrence: {
              type: "ARRAY",
              description: "Recurrence rules, e.g., ['RRULE:FREQ=DAILY;COUNT=2']",
              items: { type: "STRING" }
            }
          },
          required: ["summary", "start", "end"],
        },
      }, {
        name: "setBirthdayEvent",
        description: "Creates an all-day, annually recurring birthday event in the user's Google Calendar.",
        parameters: {
          type: "OBJECT",
          properties: {
            personName: {
              type: "STRING",
              description: "The name of the person whose birthday it is (e.g., 'Jane Doe')."
            },
            date: {
              type: "STRING",
              description: "The person's date of birth in YYYY-MM-DD format (e.g., '1990-05-15')."
            },
          },
          required: ["personName", "date"],
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
      // {
      //   name: 'scheduleMeeting',
      //   description: 'Schedules a meeting with specified attendees at a given time and date.',
      //   parameters: {
      //     type: Type.OBJECT,
      //     properties: {
      //       attendees: {
      //         type: Type.ARRAY,
      //         items: { type: Type.STRING },
      //         description: 'List of people attending the meeting.',
      //       },
      //       date: {
      //         type: Type.STRING,
      //         description: 'Date of the meeting (e.g., "2024-07-29")',
      //       },
      //       time: {
      //         type: Type.STRING,
      //         description: 'Time of the meeting (e.g., "15:00")',
      //       },
      //       topic: {
      //         type: Type.STRING,
      //         description: 'The subject or topic of the meeting.',
      //       },
      //     },
      //     required: ['attendees', 'date', 'time', 'topic'],
      //   },
      // }, {
      //   name: 'getCurrentTemperature',
      //   description: 'Gets the current temperature for a given location.',
      //   parameters: {
      //     type: Type.OBJECT,
      //     properties: {
      //       location: {
      //         type: Type.STRING,
      //         description: 'The city name, e.g. San Francisco',
      //       },
      //     },
      //     required: ['location'],
      //   },
      // }
    ],
  },
];

export const agentConfig = {
  tools: [{
    functionDeclarations: agentTools
  }],
  toolConfig: {
    functionCallingConfig: {
      mode: 'any'
    }
  }
}



export const agentFunctions = {
  getCalendarEvents,
  // setCalendarEvents,
  getEmails,
  // ... all your other functions
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // e.g., "http://localhost:3000/api/auth/google/callback"
);

// These are the permissions you are asking for

export { oauth2Client };