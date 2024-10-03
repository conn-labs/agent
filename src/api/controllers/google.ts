import store from "store"
import { OAuth2Client } from 'google-auth-library';
import Cryptr from "cryptr";
import { saveAuthentication } from '../../common/saveProvider';

import { prisma } from "../../lib";
import { Provider } from "@prisma/client";
import { Request, Response } from "express";


const crypt = new Cryptr(process.env.ENCRYPT || "RANDOM")
const CLIENT_ID =  process.env.GOOGLE_ID || 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:8080/auth/google/callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


 async function initiateGoogleAuth() {
    console.log(CLIENT_ID, CLIENT_SECRET)
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [ 
        "https://www.googleapis.com/auth/userinfo.profile",
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



 async function handleGoogleCallback(code: string) {
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
       crypt.encrypt(tokens.access_token!),
        user.id,
        crypt.encrypt(tokens.refresh_token || "Not Applicable") || null
      );
  
      return { user, authentication };
    } catch (error) {
      console.error('Error in Google authentication:', error);
      throw error;
    }
  } 


export const GoogleRedirect = async (req: Request, res: Response) => {
    const email = req.query.email
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        res.redirect("/")
        return;
    }

    const auth = await initiateGoogleAuth()
    res.redirect(auth);
}


export const GoogleCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
         res.status(400).send('Missing authorization code');
         return
      }

      try {
        const { user, authentication } = await handleGoogleCallback(code);
        
        // Here you might set up a session or generate a JWT
        res.json({ message: 'Authentication successful', userId: user.id });
        
      } catch (error) {
        console.error('Error in Google callback:', error);
        res.status(500).send('Authentication failed');
      }

    

}