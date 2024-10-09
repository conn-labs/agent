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
  GOOGLE_GMAIL = "google-gmail",
}

interface Context {
  provider: Provider;
  fields: Fields[];
  id?: string;
  instructions?: string;
}

export interface AgentWorkflow {
  input: string;
  context: Context[];
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
  context: z.array(
    z.object({
      provider: z.nativeEnum(Provider),
      fields: z.array(z.nativeEnum(Fields)),
      id: z.string().optional(),
      instructions: z.string().optional(),
    }),
  ),
  instances: z.number().int().positive(),
  memory: z.boolean().nullable(),
  proMode: z.boolean().nullable(),
  apiKey: z.string(),
});

const test = {
  route: "/workflow",
  data: {
    input:
      "Using Google Finance site, find 10 different company stocks and compare them. Complete your workflow by giving a brief comparison between them using the graph on the page.",
    instances: 10,
    apiKey: "quark_h3w)^ssrwN94[XH;-+ZuyXF;9p",
    context: [
      {
        provider: "google-docs",
        fields: ["id", "content"],
        instructions: "Use them for getting xyz.",
      },
    ],
    memory: true,
    proMode: true,
  },
};
