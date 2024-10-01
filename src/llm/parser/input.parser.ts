import { parse, print, visit, ArgumentNode, FieldNode } from 'graphql';

export function validateAndFormatGraphQLQuery(queryString: string): string | null {
  try {
    const ast = parse(queryString);

    let hasArguments = false;

    visit(ast, {
      Argument(node: ArgumentNode) {
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

    // If parsing succeeds and no arguments found, the query is valid
    // Print the AST back to a string in a consistent format
    const formattedQuery = print(ast);

    // Wrap the formatted query in the desired structure
    return `{ query ${formattedQuery} }`;
  } catch (error) {
    // If parsing fails, the query is invalid
    console.error('Invalid GraphQL query:', error);
    return null;
  }
}