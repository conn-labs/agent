import { Fields, Provider } from "../../types/workflow";
import { getGoogleDocContext } from "./batch";
import { workflowContext } from "../.././types/workflow";

type ContextFunction = (
  accessToken: string,
  refreshToken: string,
) => Promise<workflowContext[]>;

const CtxMap: Record<Provider, ContextFunction> = {
  [Provider.GOOGLE_DOCS]: getGoogleDocContext,
  [Provider.GOOGLE_MEET]: () => Promise.resolve([]),
  [Provider.GOOGLE_CALENDAR]: () => Promise.resolve([]),
  [Provider.GOOGLE_SHEETS]: () => Promise.resolve([]),
  [Provider.GOOGLE_GMAIL]: () => Promise.resolve([]),
};

export async function getContext(
  provider: Provider,
  accessToken: string,
  refreshToken: string,
): Promise<workflowContext[]> {
  const func = CtxMap[provider];
  if (!func) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  const result = await func(accessToken, refreshToken);

  return result;
}
