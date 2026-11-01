from pathlib import Path
import json,random
stages=[]
def add(ch,teams,levels):
 for n,(team,lv)in enumerate(zip(teams,levels),1):stages.append({'name':f'{ch}-{n}','chapter':ch,'enemy':team,'levels':lv if isinstance(lv,list) else [lv]*len(team),'theme':['forest','river','harbor','garden'][ch-1]})
add(1,[[19,16],[10,13,10],[16,19,21],[13,14,13],[10,11,12],[13,14,15],[25,16,19],[29,32,56],[19,21,56],[74,95]],[[3,3],[4,4,4],[5,5,5],[6,7,6],[7,8,10],[7,8,10],[8,9,9],[9,9,9],[11,11,11],[12,14]])
add(2,[[21,23,27],[35,39,46],[74,41,129],[54,60,118],[43,69,48],[56,66,23],[63,81,100],[16,52,58],[54,61,17],[120,121]],[12,13,13,14,15,16,17,18,19,[18,21]])
add(3,[[58,78,33],[67,82,96],[24,20,88],[60,90,72],[25,83,108],[93,64,49],[84,95,128],[42,110,53],[67,97,143],[100,25,26]],[20,21,[23,23,24],22,23,24,25,[28,28,29],26,[27,26,29]])
add(4,[[43,44,69],[102,46,48],[70,114,83],[111,115,123],[54,61,79],[58,77,126],[64,93,124],[127,123,125],[105,112,143],[71,114,45]],[27,28,29,29,30,30,31,32,33,[34,33,35]])
leaders=[('웅이','leader_brock','rock'),('이슬이','leader_misty','water'),('마티스','leader_lt_surge','electric'),('민화','leader_erika','grass')]
for i,(name,portrait,gym)in enumerate(leaders):stages[i*10+9].update({'leader':name,'portrait':portrait,'gym':gym,'trainer':True})
stages[9]['moves']=[[33,111],[33,20,317]]
for i in [22,27]:stages[i].update({'rocket':True,'trainer':True,'portrait':'rocket_grunt_m'})
Path('stages.js').write_text('window.STORY_STAGES='+json.dumps(stages,ensure_ascii=False,separators=(',',':'))+';\nwindow.ROCKET_AMBUSH='+json.dumps({'name':'로켓단 습격','chapter':2,'enemy':[20,41,109],'levels':[18,19,19],'trainer':True,'rocket':True,'theme':'river','portrait':'rocket_grunt_m'},ensure_ascii=False)+';',encoding='utf-8')
points=[[[8,80],[20,48],[35,88],[43,54],[44,16],[60,15],[66,48],[71,79],[84,72],[91,39]],[[9,78],[18,45],[32,22],[44,47],[36,76],[53,84],[65,58],[61,25],[79,19],[90,46]],[[10,25],[22,49],[14,79],[36,85],[45,59],[38,29],[59,17],[75,35],[69,69],[89,81]],[[8,76],[16,42],[32,15],[49,25],[42,56],[31,83],[60,86],[76,61],[68,30],[89,18]]]
Path('chapter-maps.js').write_text('window.CHAPTER_MAPS='+json.dumps(points)+';',encoding='utf-8')
for chapter in range(2,5):
 random.seed(60+chapter);pts=points[chapter-1];theme={2:('#a4cfa1','#86c9d9'),3:('#b4c5a1','#83b9ca'),4:('#acd195','#83b5a3')}[chapter];s=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="620" viewBox="0 0 1000 620" shape-rendering="crispEdges"><rect width="1000" height="620" fill="{theme[0]}"/>']
 if chapter==2:s+=['<path d="M-100 130Q150 30 270 150T520 280T800 405T1100 530" fill="none" stroke="#dbdfad" stroke-width="108"/><path d="M-100 130Q150 30 270 150T520 280T800 405T1100 530" fill="none" stroke="#85cad8" stroke-width="86"/>']
 if chapter==3:s+=['<path d="M0 0H1000V96H0ZM800 80H1000V620H800Z" fill="#88bfd0"/><path d="M0 94H950V110H0ZM790 110H807V620H790Z" fill="#ccbd8e"/>']
 for _ in range(160):
  x=random.randrange(20,980);y=random.randrange(20,600);s.append(f'<path d="M{x} {y}h3v-6h3v9h-6z" fill="#7dab68"/>')
 path=f'M{pts[0][0]*10} {pts[0][1]*6.2}'
 for a,b in zip(pts,pts[1:]):
  x,y=a[0]*10,a[1]*6.2;nx,ny=b[0]*10,b[1]*6.2;path+=f' C{x+(nx-x)*.7} {y-22}, {nx-(nx-x)*.7} {ny+22}, {nx} {ny}'
 s+=[f'<path d="{path}" fill="none" stroke="#739b64" stroke-width="40" stroke-linejoin="round" stroke-linecap="round"/>',f'<path d="{path}" fill="none" stroke="#e1c995" stroke-width="28" stroke-linejoin="round" stroke-linecap="round"/>',f'<path d="{path}" fill="none" stroke="#f0ddb1" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/>']
 for _ in range(40):
  x=random.randrange(20,980);y=random.randrange(30,600)
  if min((x-a*10)**2+(y-b*6.2)**2 for a,b in pts)<6000:continue
  s.append(f'<g transform="translate({x},{y})"><rect x="-4" y="1" width="8" height="20" fill="#8a6b4b"/><path d="M-23 0H23V-20H15V-31H-15V-20H-23Z" fill="#49845d"/><path d="M-17-14H-7V-26H7V-31H-15V-20H-17Z" fill="#70a46f"/></g>')
 for _ in range(65):
  x=random.randrange(15,985);y=random.randrange(15,605);c=random.choice(['#ffdaad','#e5e7be','#f0b0c0'])
  s.append(f'<path d="M{x} {y}h5v4h-5z" fill="{c}"/>')
 x,y=pts[-1][0]*10,pts[-1][1]*6.2;s.append(f'<path d="M{x-38} {y-52}h76v50h-76z" fill="#f2e7bd"/><path d="M{x-45} {y-52}h90v-14h-12v-13h-66v13h-12z" fill="{["","","#619ba5","#ad8b63","#8d8b64"][chapter]}"/>');s.append('</svg>');Path(f'assets/world/chapter-{chapter}.svg').write_text(''.join(s),encoding='utf-8')
print('40 stages / 4 unique map routes ready')
