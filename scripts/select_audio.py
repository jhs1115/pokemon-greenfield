from pathlib import Path
import zipfile,json
root=Path('assets/audio');(root/'sfx').mkdir(exist_ok=True);(root/'licenses').mkdir(exist_ok=True)
select={
'interface':{'click':'click_003','hover':'select_002','back':'back_002','confirm':'confirmation_002','error':'error_004','dialogue':'tick_001','reveal':'open_002','heal':'glass_003','status':'pluck_001'},
'rpg':{'step':'footstep02','step-alt':'footstep04','swish':'knifeSlice','swish-alt':'knifeSlice2','impact':'chop','coin':'handleCoins','page':'bookFlip1'},
'scifi':{'fire':'thrusterFire_000','water':'slime_000','electric':'laserRetro_000','beam':'laserSmall_002','magic':'forceField_001','heavy':'explosionCrunch_000'},
'jingles':{'victory':'8-Bit jingles/jingles_NES00','level':'Pizzicato jingles/jingles_PIZZI00','defeat':'8-Bit jingles/jingles_NES10','evolve':'Pizzicato jingles/jingles_PIZZI01'}
}
manifest={}
for pack,items in select.items():
 with zipfile.ZipFile(root/(pack+'.zip'))as z:
  for key,source in items.items():
   path='Audio/'+source+'.ogg';dest=root/'sfx'/(key+'.ogg');dest.write_bytes(z.read(path));manifest[key]={'src':dest.as_posix(),'pack':pack,'original':path}
  (root/'licenses'/(pack+'.txt')).write_bytes(z.read('License.txt'))
(root/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'manifest.js').write_text('window.AUDIO_ASSETS='+json.dumps(manifest,separators=(',',':'))+';',encoding='utf-8')
print('Selected sound effects:',len(manifest),'bytes:',sum((root/v['src'].split('assets/audio/')[1]).stat().st_size for v in manifest.values()))
