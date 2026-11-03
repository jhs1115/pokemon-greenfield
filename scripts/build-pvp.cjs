// One simulator copy, without Showdown's unused team-legality tables.
// Owned Pokemon / learned moves are validated by game-state.js with training.json.
const esbuild=require('esbuild'),path=require('node:path'),fs=require('node:fs');
const simulator=path.resolve('node_modules/@pkmn/sim/build/esm/sim/index.mjs');
(async()=>{
 const result=await esbuild.build({entryPoints:['scripts/pvp-server-entry.js'],bundle:true,platform:'browser',format:'esm',minify:true,
  outfile:'supabase/functions/pvp/rules.mjs',metafile:true,plugins:[{
   name:'pvp-runtime-only',setup(build){
    // native-combat's CommonJS fallback and the ESM entry must share the same Dex.
    build.onResolve({filter:/^@pkmn\/sim$/},()=>({path:simulator}));
    build.onLoad({filter:/[\\/]@pkmn[\\/]sim[\\/]build[\\/]esm[\\/]data[\\/].*(?:learnsets|legality)\.mjs$/},args=>({
     contents:`export const ${path.basename(args.path)==='learnsets.mjs'?'Learnsets':'Legality'} = {};`,loader:'js',
    }));
   },
  }]});
 const bytes=fs.statSync('supabase/functions/pvp/rules.mjs').size;
 // Leave headroom for the Edge Function handler, SDK and deployment metadata.
 if(bytes>4_000_000)throw Error(`PVP bundle too large for API deployment: ${bytes} bytes`);
 const inputs=Object.keys(result.metafile.inputs);
 if(inputs.some(p=>p.includes('@pkmn/sim/build/cjs/')))throw Error('Duplicate CommonJS simulator in bundle');
 console.log(`PVP server bundle: ${(bytes/1024/1024).toFixed(2)} MiB; single simulator, API deployment size check passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
