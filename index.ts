import fs from "fs";
import path from "path";
import { Core } from './core';

const modulesDir = "./modules"

async function loadModules(core: Core, modulesDir: string): Promise<void> {
  console.log(`looking for modules...`);
  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });

  for (const entry of entries) {
    const indexPath = path.join(modulesDir, entry.name, "index.ts");
    if (entry.isDirectory() && fs.existsSync(indexPath)) {
      await core.load(entry.name)
    }
  }

  console.log(`loaded: ${[...core.getModules().keys()]}`);
}


async function main() {
  const core = new Core(modulesDir);
  loadModules(core, modulesDir)
}

main().catch(console.error);

