const assert=require('node:assert/strict');
const {createCloudStore}=require('../cloud-save');
const copy=x=>JSON.parse(JSON.stringify(x));
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),m};};
function server(){const rows=new Map();let fail=false,hold=null;return {rows,setFail:v=>fail=v,setHold:v=>hold=v,client(uid){let session=uid?{user:{id:uid,email:uid+'@example.test'}}:null,listener;return {
 auth:{onAuthStateChange(fn){listener=fn;},async getSession(){return {data:{session}};},async signInWithPassword({email}){session={user:{id:email.split('@')[0],email}};return {data:{session}};},async signUp(){return {data:{session:null}};},async signOut(){session=null;listener?.('SIGNED_OUT',null);return {};},async resetPasswordForEmail(){return {};},async updateUser(){return {};},switch(uid){session=uid?{user:{id:uid}}:null;listener('SIGNED_IN',session);}},
 from(){const filters={};const query={select(){return query;},eq(k,v){filters[k]=v;return query;},async order(){if(fail)return {error:Error('network')};return {data:[...rows.values()].filter(x=>x.user_id===filters.user_id).map(copy)};},async maybeSingle(){return {data:copy(rows.get(filters.user_id+':'+filters.slot)||null)};}};return query;},
 async rpc(name,args){assert.equal(name,'save_game_slot');if(hold)await hold;if(fail)return {error:Error('network')};if(args.p_owner!==session.user.id)return {error:Error('AUTH_MISMATCH')};const key=session.user.id+':'+args.p_slot,row=rows.get(key);if((row?.revision||0)!==args.p_expected_revision)return {error:Error('SAVE_CONFLICT')};const next={user_id:session.user.id,slot:args.p_slot,state:copy(args.p_state),revision:(row?.revision||0)+1,updated_at:'now'};rows.set(key,next);return {data:[{revision:next.revision,updated_at:'now'}]};}
 };}};}
const scheduled=[];const options=(s,uid,local=storage())=>({client:s.client(uid),storage:local,schedule:(fn,delay)=>{if(delay===0)fn();else scheduled.push(fn);return fn;},cancel:()=>{}});
(async()=>{
 const s=server(),local=storage(),a=createCloudStore(options(s,'alice',local));await a.init();await a.load();assert.equal(a.read(1),null);a.save(1,{coins:1});await a.flush();assert.equal(s.rows.get('alice:1').revision,1);assert.equal(a.status().pending,0);
 const bob=createCloudStore(options(s,'bob',local));await bob.init();await bob.load();assert.equal(bob.read(1),null,'accounts cannot read each other’s slots');bob.save(1,{coins:99});await bob.flush();assert.equal(a.read(1).coins,1);
 // Updates that happen while an RPC is in flight must not be dropped.
 let release;s.setHold(new Promise(r=>release=r));a.save(1,{coins:2});const flushing=a.flush();a.save(1,{coins:3});release();await flushing;s.setHold(null);assert.equal(s.rows.get('alice:1').state.coins,3);assert.equal(s.rows.get('alice:1').revision,3);
 // Network failures keep an account-scoped durable pending record.
 s.setFail(true);a.save(2,{coins:5});await assert.rejects(a.flush(),/network/);assert.equal(JSON.parse(local.getItem('greenfield-cloud-pending-v1-alice'))[0].slot,2);s.setFail(false);
 const resumed=createCloudStore(options(s,'alice',local));await resumed.init();await resumed.load();assert.equal(resumed.read(2).coins,5);await resumed.flush();assert.equal(s.rows.get('alice:2').state.coins,5);
 // A stale device cannot overwrite a newer revision; recovery keeps a backup.
 const stale=createCloudStore(options(s,'alice'));await stale.init();await stale.load();resumed.save(1,{coins:4});await resumed.flush();stale.save(1,{coins:100});await assert.rejects(stale.flush(),/SAVE_CONFLICT/);assert.deepEqual(stale.status().conflicts,[1]);await stale.reloadConflict(1);assert.equal(stale.read(1).coins,4);assert.equal(s.rows.get('alice:1').state.coins,4);
 assert.throws(()=>stale.save(4,{}),/파일 번호/);
 // Acknowledgement lost after a successful write is not a conflict (JSONB key order differs).
 const ack=storage();ack.setItem('greenfield-cloud-pending-v1-alice',JSON.stringify([{slot:1,baseRevision:0,state:{z:1,a:2}}]));s.rows.set('alice:1',{user_id:'alice',slot:1,revision:1,state:{a:2,z:1}});const recovered=createCloudStore(options(s,'alice',ack));await recovered.init();await recovered.load();assert.equal(recovered.status().pending,0);assert.equal(recovered.status().conflicts.length,0);
 await recovered.signOut();assert.equal(recovered.status().user,null);assert.equal(recovered.read(1),null);assert.throws(()=>recovered.save(1,{}),/먼저/);
 // A session switch during an in-flight upload cannot write Alice’s payload into Bob’s account.
 const switchedLocal=storage(),switchOptions=options(s,'alice',switchedLocal),switched=createCloudStore(switchOptions);await switched.init();await switched.load();let releaseSwitch;s.setHold(new Promise(r=>releaseSwitch=r));switched.save(3,{owner:'alice'});const inFlight=switched.flush();switchOptions.client.auth.switch('bob');releaseSwitch();await inFlight;s.setHold(null);assert(!s.rows.has('bob:3'));assert(switchedLocal.getItem('greenfield-cloud-pending-v1-alice').includes('alice'));await switched.load();switched.save(3,{owner:'bob'});await switched.flush();assert.equal(s.rows.get('bob:3').state.owner,'bob');
 const sql=require('fs').readFileSync('supabase/schema.sql','utf8');assert(sql.includes('enable row level security'));assert(sql.includes('revoke all on public.game_saves from anon, authenticated'));assert(sql.includes('s.user_id=v_uid'));assert(sql.includes('s.revision=p_expected_revision'));
 console.log('Cloud save: account isolation, slots 1–3, in-flight edits, durable offline retry, revision conflicts, recovery and SQL permission boundaries: passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
