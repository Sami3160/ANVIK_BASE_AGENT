import { User } from '../models/user.model.js';

export const getEmails = async (args, userId) => {
  const { filter } = args;
  
  if (!userId) return { error: "User ID is missing." };
  
  try {
    const user = await User.findOne({ userId });
    if (!user || !user.googleAccessToken) {
      return { error: "User account not linked." };
    }

    // MOCK API CALL: Replace with actual Gmail API call
    console.log(`Fetching emails for user ${userId} with filter: ${filter}`);
    
    return { emails: [ { subject: 'Project Update' }, { subject: 'Security Alert' } ] };

  } catch (error) {
    return { error: `Failed to fetch emails: ${error.message}` };
  }
};