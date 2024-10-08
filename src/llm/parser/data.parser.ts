import { Provider, workflowContext } from "../../types/workflow";
import { jsonToPlainText } from "json-to-plain-text";
import { Fields } from "../../types/workflow";
import { getContext } from "../context";
import { findProvider } from "../../common/findProvider";

export async function contextParser(
  provider: Provider,
  fields: Fields[],
  userId: string,
): Promise<string | null> {
  const data = await findProvider(userId, "GOOGLE");
  if (!data?.accessToken) return null;

  const ctx = await getContext(
    provider,
    data.accessToken,
    data.refreshToken || "",
  );

  const filteredCtx = ctx.map((item: workflowContext) => {
    const filteredItem: Partial<workflowContext> = {};

    fields.forEach((field) => {
      if (item[field]) {
        filteredItem[field] = item[field];
      }
    });

    return filteredItem;
  });

  const resp = jsonToPlainText(filteredCtx, {});

  return resp;
}
