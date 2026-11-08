/* The local Python server also serves the parent preview folder. Verify ALL
 * runtime files, even when Git is clean, so an old mirror cannot mask a fix. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const repo=path.resolve(__dirname,'..'),preview=path.dirname(repo);
if(path.basename(repo)!=='pokemon-greenfield'||!fs.existsSync(path.join(repo,'.git')))throw Error('Run sync:preview from the pokemon-greenfield Git checkout.');
const paths=[...new Set(cp.execFileSync('git',['-C',repo,'ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean))];
const digest=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');let copied=0,verified=0;
for(const name of paths){const source=path.resolve(repo,name),target=path.resolve(preview,name);if(!source.startsWith(repo+path.sep)||!target.startsWith(preview+path.sep))throw Error('Path escapes preview: '+name);if(!fs.existsSync(source)||!fs.statSync(source).isFile())continue;const content=fs.readFileSync(source),expected=digest(content);if(!fs.existsSync(target)||digest(fs.readFileSync(target))!==expected){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);copied++;}if(digest(fs.readFileSync(target))!==expected)throw Error('Mirror verification failed: '+name);verified++;}
console.log(`Preview synchronized: ${copied} updated; ${verified} files hash-verified (including unchanged Git files).`);
