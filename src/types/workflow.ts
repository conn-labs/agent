export enum Fields {
    ID = "id",
    CONTENT = "content",
    LINK = "link",
    CREATEDAT = "createdAt",
    UPDATEDAT = "updatedAt",
    AUTHORS = "authors",
  }


export enum Provider {
    GOOGLE_MEET = "google-meet",
    GOOGLE_CALENDAR = "google-calendar",
    GOOGLE_DOCS = "google-docs",
    GOOGLE_SHEETS = "google-sheets",
    GOOGLE_GMAIL = "google-gmail"
}

interface Context {
    provider: string
    fields: Fields[],
    id?: string
    instructions?: string
}

export enum Event {
    onGmail = "on-gmail",
    onGmailReceived = "on-gmail-received",
    onGoogleCalendarEvent = "on-google-calendar-event",
    onGoogleCalendarCreate = "on-google-calendar-create",
    onGoogleDocsCreate = "on-google-docs-create",
    onGoogleSheetsCreate = "on-google-sheets-create",
    onGoogleMeetStart = "on-google-meet-start"
}


export interface AgentWorkflow {
    input: string;
    context: Context[]
    instances: number;
    memory: boolean;
    proMode: boolean;
    cron?: string;
    event?: Event
}



import { z } from "zod";

export const WorkflowJobSchema = z.object({
    input: z.string(),      //done               
    context: z.array(z.object({              
        provider: z.string(),
        fields: z.enum(["id", "content", "link", "time"]).array(),
        id: z.string().optional(),
        instructions: z.string().optional(),
    })), //done 
    instances: z.number().int(),     //todo       
    memory: z.boolean(),     //todo                 
    proMode: z.boolean(),                   
    event: z.enum([                        
        "on-gmail", 
        "on-gmail-received", 
        "on-google-calendar-event", 
        "on-google-calendar-create", 
        "on-google-docs-create", 
        "on-google-sheets-create", 
        "on-google-meet-start"
    ]), //todo
    cron: z.string().optional()            
});