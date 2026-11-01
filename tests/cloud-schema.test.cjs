const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const db=await PGlite.create();try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`);
 const schema=fs.readFileSync('supabase/schema.sql','utf8');await db.exec(schema);await db.exec(schema);
 const user=async id=>{await db.exec('reset role;set role authenticated;');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 const alice='00000000-0000-0000-0000-000000000001',bob='00000000-0000-0000-0000-000000000002';await user(alice);
 let r=await db.query("select * from public.save_game_slot(1,'{\"coins\":1}',0,auth.uid())");assert.equal(Number(r.rows[0].revision),1);
 await assert.rejects(db.query("select * from public.save_game_slot(1,'{}',0,auth.uid())"),/SAVE_CONFLICT/);
 await assert.rejects(db.query("update public.game_saves set state='{}'"),/permission denied/);
 await assert.rejects(db.query("insert into public.game_saves(user_id,slot,state) values ($1,2,'{}')",[bob]),/permission denied/);
 await assert.rejects(db.query("select * from public.save_game_slot(4,'{}',0,auth.uid())"),/INVALID_SLOT/);
 await assert.rejects(db.query("select * from public.save_game_slot(2,'[]',0,auth.uid())"),/INVALID_SAVE/);
 await user(bob);await assert.rejects(db.query("select * from public.save_game_slot(1,'{}',0,$1)",[alice]),/AUTH_MISMATCH/);assert.equal((await db.query('select * from public.game_saves')).rows.length,0,'RLS hides Alice');await db.query("select * from public.save_game_slot(1,'{\"coins\":2}',0,auth.uid())");
 await user(alice);r=await db.query('select * from public.game_saves');assert.equal(r.rows.length,1);assert.equal(r.rows[0].state.coins,1);r=await db.query("select * from public.save_game_slot(1,'{\"coins\":3}',1,auth.uid())");assert.equal(Number(r.rows[0].revision),2);
 await db.exec('reset role;set role anon;');await assert.rejects(db.query('select * from public.game_saves'),/permission denied/);await assert.rejects(db.query("select * from public.save_game_slot(1,'{}',0,auth.uid())"),/permission denied/);
 await user('');await assert.rejects(db.query("select * from public.save_game_slot(1,'{}',0,auth.uid())"),/AUTH_REQUIRED/);
 console.log('PostgreSQL schema: repeatable migration, real RLS account separation, anonymous/direct-write denial, slot/payload validation and atomic revision checks: passed.');
}finally{await db.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
