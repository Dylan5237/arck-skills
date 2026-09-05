#!/usr/bin/env node

import { run } from './cli.mjs';

run(process.argv.slice(2)).then((output) => {
  if (output) process.stdout.write(output.endsWith('\n') ? output : `${output}\n`);
}).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
