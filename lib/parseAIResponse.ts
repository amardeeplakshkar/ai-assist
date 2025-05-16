interface Artifact {
  id: string;
  title: string;
  actions: Array<{
    type: string;
    filePath?: string;
    content?: string;
  }>;
}

interface StreamParseResult {
  message: string;
  artifacts: Array<{
    id: string;
    title: string;
    actions: Array<{
      type: string;
      filePath?: string;
      content?: string;
    }>
  }>;
}


export function parseAIResponse(data: string) {
  const message = data.split('<boltArtifact')[0].trim();

  const artifactBlocks = Array.from(data.matchAll(/<boltArtifact[\s\S]*?<\/boltArtifact>/g)).map(match => match[0]);

  const artifacts = artifactBlocks.map(artifact => {
    const id = (artifact.match(/id="([^"]+)"/) || [])[1] || '';
    const title = (artifact.match(/title="([^"]+)"/) || [])[1] || '';

    const actions = Array.from(artifact.matchAll(/<boltAction\s+([^>]*)>([\s\S]*?)<\/boltAction>/g)).map(([, attrString, innerContent]) => {
      const attributes: Record<string, string> = {};
      attrString.split(/\s+/).forEach(attr => {
        const [key, value] = attr.split('=');
        if (key && value) attributes[key] = value.replace(/"/g, '');
      });

      return {
        ...attributes,
        type: attributes.type,
        filePath: attributes.filePath || undefined,
        content: innerContent.trim()
      };
    });

    return { id, title, actions };
  });

  return { message, artifacts };
}

export function parseAIResponseStream() {
  let buffer = '';
  let message = '';
  const artifacts: Artifact[] = [];

  const parseChunk = (chunk: string): StreamParseResult => {
    buffer += chunk;

    let artifactRegex = /<boltArtifact[\s\S]*?<\/boltArtifact>/g;
    let match;
    while ((match = artifactRegex.exec(buffer)) !== null) {
      const fullArtifact = match[0];
      const before = buffer.slice(0, match.index);

      message += before; // plain message before this artifact
      const parsed = parseAIResponse(fullArtifact); // reuse your existing parser
      artifacts.push(...parsed.artifacts);

      buffer = buffer.slice(match.index + fullArtifact.length); // move past parsed artifact
      artifactRegex.lastIndex = 0; // reset for remaining buffer
    }

    return {
      message: message + buffer, // include remaining buffer for now
      artifacts,
    };
  };

  return { parseChunk };
}