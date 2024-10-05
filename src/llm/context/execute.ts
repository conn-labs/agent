import { Fields, Provider } from "../../types/workflow";
import { getGoogleDocContext } from "./batch";
import {workflowContext} from "../.././types/workflow"

type ContextFunction = (accessToken: string, refreshToken: string) => Promise<workflowContext[]>;

const CtxMap: Record<Provider, ContextFunction> = {
    [Provider.GOOGLE_DOCS]: getGoogleDocContext,
    [Provider.GOOGLE_MEET]: () => Promise.resolve([]),
    [Provider.GOOGLE_CALENDAR]: () => Promise.resolve([]),
    [Provider.GOOGLE_SHEETS]: () => Promise.resolve([]),
    [Provider.GOOGLE_GMAIL]: () => Promise.resolve([]),
};

export async function getContext(
    provider: Provider,
    fields: Fields[],
    accessToken: string,
    refreshToken: string,
    id?: string,
): Promise<string> {
    const func = CtxMap[provider];
    if (!func) {
        throw new Error(`Unsupported provider: ${provider}`);
    }
    const result = await func(accessToken, refreshToken);

    const context = result.map(item => {
        return `Id: ${item[Fields.ID]}, Content: ${item[Fields.CONTENT]}, Link: ${item[Fields.LINK]}, Created At: ${item[Fields.CREATEDAT]}, Updated At: ${item[Fields.UPDATEDAT]}, Authors: ${item[Fields.AUTHORS] || 'N/A'}`;
    }).join('\n\n');
    return context

}