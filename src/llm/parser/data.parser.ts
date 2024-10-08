import { Provider, workflowContext } from "../../types/workflow";
import { jsonToPlainText } from "json-to-plain-text";
import { Fields } from "../../types/workflow";
import { getContext } from "../context";
import { findProvider } from "../../common/findProvider";


export async function contextParser(provider: Provider, fields: Fields[], userId: string): Promise<string | null> {
    const data = await findProvider(userId, "GOOGLE");
    if (!data?.accessToken) return null;
  
    const ctx = await getContext(provider, data.accessToken, data.refreshToken || "");
  
    // Now filter the ctx to return only the fields passed in the `fields` parameter
    const filteredCtx = ctx.map((item: workflowContext) => {
      const filteredItem: Partial<workflowContext> = {};
      
      // Loop through each field in the parameter list and pick it from the item
      fields.forEach(field => {
        if (item[field]) {
          filteredItem[field] = item[field];
        }
      });
  
      return filteredItem;
    });
  
    const resp = jsonToPlainText(filteredCtx, {})

    return resp
  }
  