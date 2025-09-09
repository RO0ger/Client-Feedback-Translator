export function CodeDiff({
  before,
  after,
  language,
  description,
  type,
}: {
  before: string;
  after: string;
  language: string;
  description: string;
  type: "css" | "animation" | "props" | "structure";
}) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">{description}</h3>
      <p>Type: {type}</p>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <h4>Before</h4>
          <pre className="bg-gray-100 p-2 rounded">
            <code>{before}</code>
          </pre>
        </div>
        <div>
          <h4>After</h4>
          <pre className="bg-gray-100 p-2 rounded">
            <code>{after}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
