// import { google, drive_v3, calendar_v3, gmail_v1 } from "googleapis";
// import { BASE_URL, GID, GSECRET } from "../../constants";
// import { prisma } from "../../lib";

// export enum Fields {
//   ID = "id",
//   CONTENT = "content",
//   LINK = "link",
//   CREATEDAT = "createdat",
//   UPDATEDAT = "updatedat",
//   AUTHORS = "authors",
// }

// interface FileDetails {
//   [Fields.ID]: string;
//   [Fields.CONTENT]: string;
//   [Fields.LINK]: string;
//   [Fields.CREATEDAT]: string;
//   [Fields.UPDATEDAT]: string;
//   [Fields.AUTHORS]: string;
// }

// async function getGoogleAuthClient(accessToken: string, refreshToken: string) {
//   const client = new google.auth.OAuth2(GID, GSECRET, `${BASE_URL}/auth/google/callback`);
//   client.setCredentials({
//     refresh_token: refreshToken,
//     access_token: accessToken,
//   });
//   return client;
// }

// // Fetch a specific Google Document by ID
// async function getGoogleDocById(docId: string, accessToken: string, refreshToken: string): Promise<FileDetails | null> {
//   const client = await getGoogleAuthClient(accessToken, refreshToken);
//   const drive = google.drive({ version: "v3", auth: client });

//   try {
//     const content = await getGoogleDocContent(docId, drive);
//     return {
//       [Fields.ID]: docId,
//       [Fields.CONTENT]: content,
//       [Fields.LINK]: `https://docs.google.com/document/d/${docId}`,
//       [Fields.CREATEDAT]: new Date().toLocaleString(), // Placeholder
//       [Fields.UPDATEDAT]: new Date().toLocaleString(), // Placeholder
//       [Fields.AUTHORS]: "", // You may need to fetch authors if needed
//     };
//   } catch (error) {
//     console.error(`Error fetching Google Doc with ID ${docId}:`, error.message);
//     return null;
//   }
// }

// // Fetch a specific Google Sheet by ID
// async function getGoogleSheetById(sheetId: string, accessToken: string, refreshToken: string): Promise<FileDetails | null> {
//   const client = await getGoogleAuthClient(accessToken, refreshToken);
//   const drive = google.drive({ version: "v3", auth: client });

//   try {
//     const sheetResponse = await drive.files.export({
//       fileId: sheetId,
//       mimeType: "text/csv",
//     });

//     const sheetContent = sheetResponse.data;
//     return {
//       [Fields.ID]: sheetId,
//       [Fields.CONTENT]: sheetContent || "No data available.",
//       [Fields.LINK]: `https://docs.google.com/spreadsheets/d/${sheetId}`,
//       [Fields.CREATEDAT]: new Date().toLocaleString(), // Placeholder
//       [Fields.UPDATEDAT]: new Date().toLocaleString(), // Placeholder
//       [Fields.AUTHORS]: "", // You may need to fetch authors if needed
//     };
//   } catch (error) {
//     console.error(`Error fetching Google Sheet with ID ${sheetId}:`, error.message);
//     return null;
//   }
// }

// // Fetch a specific Google Calendar Event by ID
// async function getCalendarEventById(eventId: string, accessToken: string, refreshToken: string): Promise<FileDetails | null> {
//   const client = await getGoogleAuthClient(accessToken, refreshToken);
//   const calendar = google.calendar({ version: "v3", auth: client });

//   try {
//     const eventResponse = await calendar.events.get({
//       calendarId: "primary",
//       eventId: eventId,
//     });

//     const event = eventResponse.data;
//     return {
//       [Fields.ID]: eventId,
//       [Fields.CONTENT]: event.summary || "No content available.",
//       [Fields.LINK]: event.htmlLink || "",
//       [Fields.CREATEDAT]: event.created || "",
//       [Fields.UPDATEDAT]: event.updated || "",
//       [Fields.AUTHORS]: event.organizer?.email || "",
//     };
//   } catch (error) {
//     console.error(`Error fetching Calendar Event with ID ${eventId}:`, error.message);
//     return null;
//   }
// }

// // Fetch the latest email by its ID
// async function getLatestEmail(accessToken: string, refreshToken: string): Promise<FileDetails | null> {
//   const client = await getGoogleAuthClient(accessToken, refreshToken);
//   const gmail = google.gmail({ version: "v1", auth: client });

//   // Fetch the latest email message
//   const response = await gmail.users.messages.list({
//     userId: "me",
//     maxResults: 1, // Get the latest email
//   });

//   const messages = response.data.messages;
//   if (!messages || messages.length === 0) return null;

//   // Retrieve details for the latest email
//   const latestMessageId = messages[0].id || "";
//   const emailDetails = await getEmailDetails("me", latestMessageId, client);
  
//   return {
//     [Fields.ID]: latestMessageId,
//     [Fields.CONTENT]: emailDetails.content,
//     [Fields.LINK]: "", // Emails don't have direct public links
//     [Fields.CREATEDAT]: emailDetails.timestamp,
//     [Fields.UPDATEDAT]: emailDetails.timestamp,
//     [Fields.AUTHORS]: emailDetails.receiver,
//   };
// }

// // Helper function to get Google Doc content
// async function getGoogleDocContent(docId: string, drive: drive_v3.Drive): Promise<string> {
//   try {
//     const response = await drive.files.export({
//       fileId: docId,
//       mimeType: "text/plain",
//     });
//     const str = response.data as string;
//     return str.replace(/(\r\n|\n|\r)/gm, " ");
//   } catch (error) {
//     console.error(`Error retrieving content for Google Doc (${docId}):`, error.message);
//     return "";
//   }
// }

// // Helper function to get email details
// async function getEmailDetails(userId: string, messageId: string, client: any): Promise<{
//   subject: string;
//   content: string;
//   timestamp: string;
//   receiver: string;
// }> {
//   const gmail = google.gmail({ version: "v1", auth: client });

//   const messageResponse = await gmail.users.messages.get({
//     userId: userId,
//     id: messageId,
//   });

//   const message = messageResponse.data;
//   const headers = message.payload?.headers || [];

//   const subject =
//     headers.find((header) => header.name === "Subject")?.value || "";
//   const timestamp = new Date(
//     parseInt(message.internalDate || "0", 10),
//   ).toLocaleString();
//   const receiver = headers.find((header) => header.name === "To")?.value || "";
//   const content = message.snippet || "";

//   return { subject, content, timestamp, receiver };
// }

// export {
//   getGoogleDocById,
//   getGoogleSheetById,
//   getCalendarEventById,
//   getLatestEmail,
// };
