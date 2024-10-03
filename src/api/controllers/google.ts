import store from "store"
import { OAuth2Client } from 'google-auth-library';

import { saveAuthentication } from '../../common/saveProvider';

import { findUserByEmail } from "../../common/findUser";


const CLIENT_ID =  process.env.GOOGLE_ID || 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:8080/auth/google/callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


export async function initiateGoogleAuth() {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    });
  
    return authUrl;
}

