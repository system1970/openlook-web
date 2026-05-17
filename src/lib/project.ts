import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

export interface ProjectInfo {
  root: string;
  name: string;
  baseOpenLookDir: string;
}

export async function getProjectInfo(startDir: string = process.cwd()): Promise<ProjectInfo> {
  let current = path.resolve(startDir);
  let root = current;

  while (true) {
    try {
      const gitDir = path.join(current, '.git');
      const gitStat = await fs.stat(gitDir).catch(() => null);
      const pkgPath = path.join(current, 'package.json');
      const pkgStat = await fs.stat(pkgPath).catch(() => null);
      
      if (gitStat?.isDirectory() || pkgStat?.isFile()) {
        root = current;
        break;
      }
    } catch (e) {
      // ignore
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  const name = sanitizeFileName(path.basename(root)) || 'default-project';
  const baseOpenLookDir = path.join(os.homedir(), '.openlook', name);

  return {
    root,
    name,
    baseOpenLookDir: path.resolve(baseOpenLookDir),
  };
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'openlook-run';
}
