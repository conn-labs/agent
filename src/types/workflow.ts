
export enum Fields {
    ID = "id",
    CONTENT = "content",
    LINK ="link",
    TIME = "time"
}


export enum Provider {
    GOOGLE_MEET = "google-meet",
    GOOGLE_CALENDAR = "google-calendar",
    GOOGLE_DOCS = "google-docs",
    GOOGLE_DRIVE = "google-drive",
    GOOGLE_SHEETS = "google-sheets",
    GOOGLE_GMAIL = "google-gmail"
}

interface Context {
    provider: string
    fields: Fields,
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
    event: Event
}