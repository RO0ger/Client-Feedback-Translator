'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeComparisonProps {
  before: string;
  after: string;
}

const CodeBlock = ({ code }: { code: string }) => (
  <SyntaxHighlighter language="tsx" style={atomDark} customStyle={{ borderRadius: '0.5rem', margin: 0 }}>
    {code}
  </SyntaxHighlighter>
);

export function CodeComparison({ before, after }: CodeComparisonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Before</h3>
        <CodeBlock code={before} />
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold">After</h3>
        <CodeBlock code={after} />
      </div>
    </div>
  );
}
