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
    email: string;
    apiKey: string;
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
    input: z.string(),
    context: z.array(z.object({
        provider: z.nativeEnum(Provider),
        fields: z.array(z.nativeEnum(Fields)),
        id: z.string().optional(),
        instructions: z.string().optional(),
    })),
    instances: z.number().int().positive(),
    memory: z.boolean(),
    proMode: z.boolean(),
    email: z.string().email(),
    apiKey: z.string(),
});