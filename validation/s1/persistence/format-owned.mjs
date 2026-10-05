import ts from '../../../node_modules/typescript/lib/typescript.js';
import { readdir,readFile,writeFile } from 'node:fs/promises';
const roots=[new URL('../../../src/persistence/',import.meta.url),new URL('./',import.meta.url)];
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
for(const root of roots)for(const filename of await readdir(root))if(filename.endsWith('.ts')){
  const path=new URL(filename,root),source=ts.createSourceFile(filename,await readFile(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
  if(source.parseDiagnostics.length)throw new Error(`Cannot format invalid source ${filename}`);
  await writeFile(path,printer.printFile(source));
}
