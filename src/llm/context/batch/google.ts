import { google } from "googleapis/build/src";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import { Fields } from "../../../types/workflow";
const CLIENT_ID = process.env.GOOGLE_ID || 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:8080/auth/google/callback';



interface FileDetails {
  [Fields.ID]: string;
  [Fields.CONTENT]: string;
  [Fields.LINK]: string;
  [Fields.CREATEDAT]: string;
  [Fields.UPDATEDAT]: string;
  [Fields.AUTHORS]?: string;
}

// Helper for Google Drive Links
const createDriveLink = (fileId: string): string =>
  `https://drive.google.com/file/d/${fileId}/view`;

// 1. Get Google Doc Content
async function getGoogleDocContext(accessToken: string, refreshToken: string): Promise<FileDetails[]> {
  const client = await getGoogleAuthClient(accessToken, refreshToken);
  const drive = google.drive({ version: "v3", auth: client });

  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
  });

  const files = response.data.files;
  if (!files || files.length === 0) return [];

  const docsArray: Promise<FileDetails>[] = files.reverse().slice(0, 10).map(async (file: drive_v3.Schema$File) => {
    const content = await getGoogleDocContent(file.id || "", drive);
    return {
      [Fields.ID]: file.id || "",
      [Fields.CONTENT]: content,
      [Fields.LINK]: createDriveLink(file.id || ""),
      [Fields.CREATEDAT]: file.createdTime || "",
      [Fields.UPDATEDAT]: file.modifiedTime || "",
    };
  });

  return Promise.all(docsArray);
}

async function getGoogleDocContent(
  docId: string,
  drive: drive_v3.Drive,
): Promise<string> {
  try {
    const response = await drive.files.export({
      fileId: docId,
      mimeType: "text/plain",
    });
    return (response.data as string).replace(/(\r\n|\n|\r)/gm, " ");
  } catch (error) {
    console.error(`Error retrieving content for Google Doc (${docId}):`, (error as Error).message);
    return "";
  }
}

// 2. Get Google Calendar Events
async function getGoogleCalendarEvents(accessToken: string, refreshToken: string): Promise<FileDetails[]> {
  const client = await getGoogleAuthClient(accessToken, refreshToken);
  const calendar = google.calendar({ version: "v3", auth: client });

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items;
  if (!events || events.length === 0) return [];

  return events.map((event: any) => ({
    [Fields.ID]: event.id || "",
    [Fields.CONTENT]: `Summary: ${event.summary || ""}`,
    [Fields.LINK]: "", // Calendar events don't typically have direct links
    [Fields.CREATEDAT]: event.start?.dateTime || event.start?.date || "",
    [Fields.UPDATEDAT]: event.end?.dateTime || event.end?.date || "",
  }));
}

// 3. Get All Google Sheets
async function getAllGoogleSheets(accessToken: string, refreshToken: string): Promise<FileDetails[]> {
  const client = await getGoogleAuthClient(accessToken, refreshToken);
  const drive = google.drive({ version: "v3", auth: client });

  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: "files(id, name, createdTime, modifiedTime)",
  });

  const files = response.data.files;
  if (!files || files.length === 0) return [];

  return Promise.all(
    files.map(async (file: drive_v3.Schema$File) => {
      const sheetContent = await getGoogleSheetContent(file.id || "", drive);
      return {
        [Fields.ID]: file.id || "",
        [Fields.CONTENT]: JSON.stringify(sheetContent), // Convert sheet data into readable format
        [Fields.LINK]: createDriveLink(file.id || ""),
        [Fields.CREATEDAT]: file.createdTime || "",
        [Fields.UPDATEDAT]: file.modifiedTime || "",
      };
    }),
  );
}

async function getGoogleSheetContent(
  sheetId: string,
  drive: drive_v3.Drive,
): Promise<any[]> {
  const response = await drive.files.export({
    fileId: sheetId,
    mimeType: "text/csv",
  });
  const csvData = response.data as string;
  const rows = csvData.split("\n").map((row) => row.split(","));
  
  // Convert CSV to an array of objects (Assume first row is header)
  const headers = rows[0];
  return rows.slice(1).map((row) =>
    row.reduce((acc, value, index) => {
      acc[headers[index]] = value;
      return acc;
    }, {} as any),
  );
}

// 4. Get All Drive Files (General)
async function getAllDriveFiles(accessToken: string, refreshToken: string): Promise<FileDetails[]> {
  const client = await getGoogleAuthClient(accessToken, refreshToken);
  const drive = google.drive({ version: "v3", auth: client });

  const response = await drive.files.list({
    fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
  });

  const files = response.data.files;
  if (!files || files.length === 0) return [];

  return files.map((file: drive_v3.Schema$File) => ({
    [Fields.ID]: file.id || "",
    [Fields.CONTENT]: `File Name: ${file.name}, Mime Type: ${file.mimeType}, Size: ${file.size} bytes`,
    [Fields.LINK]: createDriveLink(file.id || ""),
    [Fields.CREATEDAT]: file.createdTime || "",
    [Fields.UPDATEDAT]: file.modifiedTime || "",
  }));
}

// 5. Get Latest Emails
async function getLatestEmails(accessToken: string, refreshToken: string): Promise<FileDetails[]> {
  const client = await getGoogleAuthClient(accessToken, refreshToken);
  const gmail = google.gmail({ version: "v1", auth: client });

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 100,
  });

  const messages = response.data.messages;
  if (!messages || messages.length === 0) return [];

  return Promise.all(
    messages.map(async (message: any) => {
      const emailDetails = await getEmailDetails(message.id || "", client);
      return {
        [Fields.ID]: message.id || "",
        [Fields.CONTENT]: emailDetails.content,
        [Fields.LINK]: "", // Emails don't have direct public links
        [Fields.CREATEDAT]: emailDetails.timestamp,
        [Fields.UPDATEDAT]: emailDetails.timestamp,
        [Fields.AUTHORS]: emailDetails.receiver,
      };
    }),
  );
}

async function getEmailDetails(
  messageId: string,
  client: any
): Promise<{
  subject: string;
  content: string;
  timestamp: string;
  receiver: string;
}> {
  const gmail = google.gmail({ version: "v1", auth: client });

  const messageResponse = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  const message = messageResponse.data;
  const headers = message.payload?.headers || [];

  const subject = headers.find((header: any) => header.name === "Subject")?.value || "";
  const timestamp = new Date(parseInt(message.internalDate || "0", 10)).toLocaleString();
  const receiver = headers.find((header: any) => header.name === "To")?.value || "";
  const content = message.snippet || "";

  return { subject, content, timestamp, receiver };
}

// Helper: Google Auth Client Initialization
async function getGoogleAuthClient(accessToken: string, refreshToken: string) {
  const client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
  );

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return client;
}

export {
  getGoogleDocContext,
  getGoogleCalendarEvents,
  getAllGoogleSheets,
  getAllDriveFiles,
  getLatestEmails,
};
