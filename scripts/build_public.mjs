import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'public-dist');
const outputAvatarsDir = path.join(outputDir, 'avatars');

const ensureCleanDir = async (dir) => {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
};

const copyFile = async (source, destination) => {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
};

await ensureCleanDir(outputDir);
await copyFile(path.join(root, 'index.html'), path.join(outputDir, 'index.html'));
await copyFile(
  path.join(root, 'public', 'avatars', 'icono-compass.svg'),
  path.join(outputAvatarsDir, 'icono-compass.svg')
);
