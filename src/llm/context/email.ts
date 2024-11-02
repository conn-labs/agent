import { google } from 'googleapis';
import { prisma } from '../../lib'; // Assuming you have a Prisma client set up
import { GID, GSECRET, BASE_URL } from '../../constants';


function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getAllEmails(userid: string): Promise<string[]> {
  const array: string[] = [];
  const client = new google.auth.OAuth2(
    GID,
    GSECRET,
    `${BASE_URL}/auth/google/callback`,
  );

  const user = await prisma.user.findUnique({
    where: { email: userid },
  });

  client.setCredentials({
    refresh_token: user?.google?.refreshToken,
  });

  const token = await (await client.getAccessToken()).res?.data.access_token;
  client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: 'v1', auth: client });

  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
  });

  const messages = response.data.messages;
  if (messages && messages.length > 0) {
    await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id || '',
          format: 'full',
        });

        const headers = email.data.payload?.headers;
        const subject = headers?.find(header => header.name === 'Subject')?.value || 'No Subject';
        const from = headers?.find(header => header.name === 'From')?.value || 'Unknown Sender';
        const date = headers?.find(header => header.name === 'Date')?.value || 'Unknown Date';

        let body = '';
        if (email.data.payload?.parts) {
          const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain');
          const htmlPart = email.data.payload.parts.find(part => part.mimeType === 'text/html');
          
          if (textPart && textPart.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          } else if (htmlPart && htmlPart.body?.data) {
            const htmlBody = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
            body = stripHtml(htmlBody);
          }
        } else if (email.data.payload?.body?.data) {
          const rawBody = Buffer.from(email.data.payload.body.data, 'base64').toString('utf-8');
          body = stripHtml(rawBody);
        }

        // Truncate body if it's too long
        const maxBodyLength = 500;
        if (body.length > maxBodyLength) {
          body = body.substring(0, maxBodyLength) + '...';
        }

        array.push(
          `Email Id: ${message.id}\nSubject: ${subject}\nFrom: ${from}\nDate: ${date}\nBody: ${body.trim()}`
        );
      })
    );

    console.log(array);
    return array;
  }

  return array;
}

getAllEmails("apoorv.conn@gmail.com").then(e => console.log(e))