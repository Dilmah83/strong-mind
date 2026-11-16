import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=['server.mjs'];
for (const dir of ['src','public','scripts','test']) {
  for (const file of await readdir(dir)) if (/\.(m?js)$/.test(file)) files.push(`${dir}/${file}`);
}
for (const file of files) {
  const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
  if (result.status!==0) process.exit(result.status||1);
}
console.log(`Syntax checked ${files.length} JavaScript files`);
