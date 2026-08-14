import fs from 'node:fs/promises';
import path from 'node:path';

const SKIPPED_DIRECTORIES = new Set(['.docusaurus', '.git', 'build', 'dist', 'node_modules']);

export function extractRichLinkUrls(source: string): string[] {
  const urls: string[] = [];
  const componentPattern = /<(?:RichLinkCard|LinkCard)\b[\s\S]*?>/g;
  const urlPattern = /\burl\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*["']([^"']+)["']\s*\})/;

  for (const component of source.match(componentPattern) ?? []) {
    const match = component.match(urlPattern);
    const url = match?.[1] ?? match?.[2] ?? match?.[3];
    if (url) urls.push(url);
  }

  return urls;
}

async function findContentFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return SKIPPED_DIRECTORIES.has(entry.name) ? [] : findContentFiles(entryPath);
      }
      return /\.(?:md|mdx)$/i.test(entry.name) ? [entryPath] : [];
    }),
  );
  return files.flat();
}

export async function discoverRichLinkUrls(siteDir: string, include: string[]): Promise<string[]> {
  const files = (
    await Promise.all(include.map((entry) => findContentFiles(path.resolve(siteDir, entry))))
  ).flat();
  const urls = await Promise.all(
    files.map(async (file) => extractRichLinkUrls(await fs.readFile(file, 'utf8'))),
  );
  return [...new Set(urls.flat())];
}
