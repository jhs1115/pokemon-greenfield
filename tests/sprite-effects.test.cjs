const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const manifest=require('../assets/effects/manifest.json'),moves=require('../moves.js');
const root=path.resolve(__dirname,'..');
for(const asset of Object.values(manifest)){
 const png=fs.readFileSync(path.join(root,asset.src));
 assert.equal(png.readUInt32BE(16),asset.width*asset.frames);
 assert.equal(png.readUInt32BE(20),asset.height);
}
const byPath=Object.fromEntries(Object.values(manifest).map(m=>[m.src,m]));
let clock=0,draws=[];
const context2d={imageSmoothingEnabled:false,save(){},restore(){},clearRect(){},rotate(){},translate(){},scale(){},strokeText(){},fillText(){},
 drawImage(image,sx,sy,sw,sh,x,y,w,h){
  const asset=byPath[image.src];assert.ok(asset);assert.ok(sx>=0&&sx+sw<=asset.width*asset.frames);assert.equal(sh,asset.height);assert.ok([x,y,w,h].every(Number.isFinite));draws.push(image.src);
 }};
const unit={classList:{add(){},remove(){}},style:{setProperty(){}}};
const board={getBoundingClientRect:()=>({width:1000,height:700}),append(node){node.isConnected=true;},querySelector:()=>unit};
class FakeImage{set src(value){this._src=value;queueMicrotask(()=>this.onload());}get src(){return this._src;}}
const sandbox=vm.createContext({window:{EFFECT_SPRITES:manifest,matchMedia:()=>({matches:false})},Image:FakeImage,console,
 document:{querySelector:()=>board,createElement:()=>({isConnected:false,dataset:{},setAttribute(){},getContext:()=>context2d,remove(){this.isConnected=false;}})},
 performance:{now:()=>clock},requestAnimationFrame:callback=>queueMicrotask(()=>{clock+=50;callback(clock);})});
vm.runInContext(fs.readFileSync(path.join(root,'sprite-effects.js'),'utf8'),sandbox);
(async()=>{
 const signatures=new Set();
 for(const [id,rule]of Object.entries(moves)){
  draws=[];
  await sandbox.window.playMoveEffect({move:{id:+id,...rule},origin:{x:2,y:3},target:{x:5,y:3},tiles:[{x:4,y:2},{x:5,y:3},{x:6,y:4}],hit:true,critical:true,defenderPos:{x:5,y:3}});
  assert.ok(draws.length>0,`${rule.fx} did not draw any source sprite`);
  signatures.add([...new Set(draws)].sort().join(','));
 }
 assert.ok(signatures.size>=26,`Expected distinct sprite compositions, got ${signatures.size}`);
 const expanded=require('../expanded-moves.js'),data=require('../data/reference.json');
 for(const m of Object.values(data.moves)){
  const rule=expanded(m);assert.equal(rule.fxVariant,m.id);assert.ok(rule.fxAssets.every(key=>manifest[key]));
  await sandbox.window.playMoveEffect({move:{...m,fx:'tackle',...rule},origin:{x:2,y:3},target:{x:5,y:3},tiles:[{x:4,y:2},{x:5,y:3}],hit:true,defenderPos:{x:5,y:3}});
 }
 console.log(`${Object.keys(moves).length} authored effects and ${Object.keys(data.moves).length} per-move sprite variants: valid frames and successful rendering.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
