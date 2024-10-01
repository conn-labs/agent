import { parse, print, visit, ArgumentNode, FieldNode } from 'graphql';

export function validateAndFormatGraphQLQuery(queryString: string): string | null {
  try {
    const ast = parse(queryString);

    let hasArguments = false;

    visit(ast, {
      Argument(_: ArgumentNode) {
        hasArguments = true;
      },
      Field(node: FieldNode) {
        if (node.arguments && node.arguments.length > 0) {
          hasArguments = true;
        }
      }
    });

    if (hasArguments) {
      console.error('Invalid GraphQL query: Arguments are not allowed');
      return null;
    }


    const formattedQuery = print(ast);

    return `{ query ${formattedQuery} }`;
  } catch (error) {
    console.error('Invalid GraphQL query:', error);
    return null;
  }
}