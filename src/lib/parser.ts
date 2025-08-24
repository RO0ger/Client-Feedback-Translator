import * as babelParser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import { ExportDefaultDeclaration, VariableDeclarator } from '@babel/types';
import { ParsedComponent } from './types';

export class ParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParserError';
  }
}

export function parseComponent(code: string): ParsedComponent {
  try {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    let componentName: string | null = null;
    
    // Traverse the Abstract Syntax Tree (AST) to find the component name.
    // This uses a few heuristics, focusing on default exports and capitalized variable names
    // which are common conventions for React components.
    traverse(ast, {
      ExportDefaultDeclaration(path: NodePath<ExportDefaultDeclaration>) {
        const declaration = path.node.declaration;
        if (declaration.type === 'Identifier') {
          componentName = declaration.name;
        } else if (declaration.type === 'FunctionDeclaration' && declaration.id) {
          componentName = declaration.id.name;
        }
      },
      VariableDeclarator(path: NodePath<VariableDeclarator>) {
        if (path.node.id.type === 'Identifier') {
          // A naive check for a component variable (e.g., const MyComponent = () => ...)
          if (/[A-Z]/.test(path.node.id.name[0])) {
             if (path.node.init && (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')) {
                // Heuristic: If we haven't found a default export, take the first capitalized variable
                if (!componentName) {
                    componentName = path.node.id.name;
                }
             }
          }
        }
      },
    });

    if (!componentName) {
      // As a fallback, use a regex to find common component definition patterns.
      // This is less reliable than AST traversal but can catch some edge cases.
      const match = code.match(/export default function (\w+)/) || code.match(/const (\w+) = \(/);
      if (match) {
        componentName = match[1];
      }
    }

    // This is a placeholder implementation. A real implementation
    // would also extract props, styling, structure, and imports from the AST.
    return {
      componentName: componentName || 'UnnamedComponent',
      props: [],
      styling: {},
      structure: {},
      imports: [],
    };
  } catch (error) {
    console.error("Babel parsing error:", error);
    throw new ParserError("Failed to parse the component. Please ensure it's valid JSX/TSX.");
  }
}
