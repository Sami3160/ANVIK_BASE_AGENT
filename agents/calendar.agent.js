import { User } from '../models/User.js';
// const User = require('../models/User.js');
import { google } from 'googleapis'; // You'll need googleapis
import { oauth2 } from 'googleapis/build/src/apis/oauth2/index.js';
import { oauth2Client } from '../config/ai.config.js';
// const SCOPES = [
//   'https://www.googleapis.com/auth/calendar',
//   'https://www.googleapis.com/auth/gmail.readonly'
// ];
const getCalendarEvents = async (args, userId) => {
  console.log("calender event triggered")
  console.log("args", args);
  console.log("userId", userId);
  try {
    // 1. Find user by your app's internal _id
    const user = await User.findById(userId); 

    if (!user || !user.refreshToken) {
      return { error: "User has not linked their Google account." };
    }

    // 2. Set user's refresh token
    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 3. Destructure arguments from the 'args' object
    let { minTime, maxTime } = args;

    // 4. Handle default logic *smartly*
    //    If no dates, default to today.
    //    If only one date, search *that specific day*.
    const today = new Date();
    if (!minTime && !maxTime) {
      minTime = today;
      maxTime = today;
    } else if (minTime && !maxTime) {
      maxTime = minTime; // Search for the single day provided
    } else if (!minTime && maxTime) {
      minTime = maxTime; // Search for the single day provided
    }

    // 5. Create date objects and set to full day
    const timeMinDate = new Date(minTime);
    timeMinDate.setHours(0, 0, 0, 0); // Start of the minTime day

    const timeMaxDate = new Date(maxTime);
    timeMaxDate.setHours(23, 59, 59, 999); // End of the maxTime day

    // 6. Make the API Call
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = result.data.items;
    if (!events || events.length === 0) {
      return { events: [], message: 'No upcoming events found for this period.' };
    }

    // 7. Return a clean, simple response for the model
    const simplifiedEvents = events.map(event => ({
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
    }));
    console.log("following events, ", simplifiedEvents);
    return { events: simplifiedEvents };

  } catch (error) {
    console.error('Error fetching calendar:', error.message);
    if (error.response?.data?.error === 'invalid_grant') {
      return { error: "Permission denied. Please re-link your Google account." };
    }
    return { error: 'Failed to fetch calendar events.' };
  }
};

const setCalendarEvent = async (args, userId) => {
  try {
    // 1. Find the user in MongoDB by your app's internal _id
    const user = await User.findById(userId); 

    if (!user || !user.refreshToken) {
      return { error: "User has not linked their Google account." };
    }

    // 2. Load the user's refresh token into the client
    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    // 3. Create an authenticated calendar service
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 4. Build the event resource for the API.
    //    Because our tool config is clean, 'args' maps almost 1:1.
    const eventResource = {
      summary: args.summary,
      start: args.start,
      end: args.end,
      location: args.location || null, // Handle optional fields
      description: args.description || null,
      recurrence: args.recurrence || null,
      
      // Map the simple email array to the object format Google needs
      attendees: args.attendees ? args.attendees.map(email => ({ email })) : [],
      
      // Add default reminders automatically for the user
      reminders: {
        useDefault: true,
      },
    };

    // 5. Make the API call to insert the event
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventResource,
      sendNotifications: true, // This sends email invites to attendees
    });

    // 6. Return a simple, clean success message for the model
    return { 
      status: "success",
      summary: result.data.summary,
      htmlLink: result.data.htmlLink // This is the link to the event
    };

  } catch (error) {
    // Handle errors cleanly
    console.error('Error creating calendar event:', error.message);
    
    // Specific check for revoked tokens
    if (error.response?.data?.error === 'invalid_grant') {
      return { error: "Permission denied. Please re-link your Google account." };
    }
    
    return { error: 'Failed to create the calendar event.' };
  }
};


const setBirthdayEvent = async (args, userId) => {
  try {
    // 1. Authenticate the user
    const user = await User.findById(userId); 
    if (!user || !user.refreshToken) {
      return { error: "User has not linked their Google account." };
    }

    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Get arguments from the model
    const { personName, date } = args; // date is "YYYY-MM-DD"
    
    // --- 3. Apply Birthday-Specific Logic ---

    // a. Handle all-day event dates (Google API uses YYYY-MM-DD strings)
    const startDate = date; // e.g., "1990-02-15"
    
    // For all-day events, the 'end' date is the *exclusive* end date,
    // so it's one day *after* the start.
    const endDateObj = new Date(date);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endDate = endDateObj.toISOString().split('T')[0]; // e.g., "1990-02-16"
    
    // b. Handle leap year (Feb 29) recurrence rule
    let recurrenceRule;
    const dateObj = new Date(date);
    if (dateObj.getMonth() === 1 && dateObj.getDate() === 29) {
      // Rule for Feb 29 as per docs
      recurrenceRule = 'RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1';
    } else {
      // Standard annual recurrence
      recurrenceRule = 'RRULE:FREQ=YEARLY';
    }

    // 4. Build the event resource *exactly* as docs require
    const eventResource = {
      eventType: 'birthday',
      summary: `${personName}'s Birthday`,
      start: {
        date: startDate, // Use 'date' for all-day events
      },
      end: {
        date: endDate, // Use 'date' for all-day events
      },
      recurrence: [
        recurrenceRule
      ],
      visibility: 'private',     // Required by docs
      transparency: 'transparent', // Required by docs
      birthdayProperties: {
        type: 'birthday'
      },
      reminders: {
        useDefault: true
      },
    };

    // 5. Make the API call
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventResource,
    });

    // 6. Return a clean success message
    return { 
      status: "success",
      summary: result.data.summary,
      htmlLink: result.data.htmlLink
    };

  } catch (error) {
    console.error('Error creating birthday event:', error.message);
    if (error.response?.data?.error === 'invalid_grant') {
      return { error: "Permission denied. Please re-link your Google account." };
    }
    return { error: 'Failed to create the birthday event.' };
  }
};

export {getCalendarEvents, setCalendarEvent, setBirthdayEvent}