import store from "store"
import { OAuth2Client } from 'google-auth-library';

import { saveAuthentication } from '../../common/saveProvider';

import { findUserByEmail } from "../../common/findUser";
import { prisma } from "../../lib";
import { Provider } from "@prisma/client";


const CLIENT_ID =  process.env.GOOGLE_ID || 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:8080/auth/google/callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


export async function initiateGoogleAuth() {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [ "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://mail.google.com",
    ]
    });
  
    return authUrl;
}



export async function handleGoogleCallback(code: string) {
    try {
      // Exchange the code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
  
      // Get user info
      const userInfo:any = await oauth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });
  
      if (!userInfo.data.id || !userInfo.data.email) {
        throw new Error('Failed to get user info from Google');
      }
  
      // Find or create user
      const user = await prisma.user.upsert({
        where: { email: userInfo.data.email },
        update: {},
        create: {
          email: userInfo.data.email,
          name: userInfo.data.name || ''
        }
      });
  
      // Save authentication
      const authentication = await saveAuthentication(
        Provider.GOOGLE,
        tokens.access_token!,
        user.id,
        tokens.refresh_token || null
      );
  
      return { user, authentication };
    } catch (error) {
      console.error('Error in Google authentication:', error);
      throw error;
    }
  } 