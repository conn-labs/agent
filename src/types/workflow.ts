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


export interface AgentWorkflow {
    input: string;
    context: Context[]
    instances: number;
    memory: boolean;
    proMode: boolean;
}

export interface workflowContext {
    [Fields.ID]: string;
    [Fields.CONTENT]: string;
    [Fields.LINK]: string;
    [Fields.CREATEDAT]: string;
    [Fields.UPDATEDAT]: string;
    [Fields.AUTHORS]?: string;
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
});