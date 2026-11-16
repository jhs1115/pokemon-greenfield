"""Original, loopable game music; standard-library offline synthesis only."""
import math, wave, array, random
from pathlib import Path
RATE=22050
def compose(path, bpm, bars, gentle=False):
    beat=60/bpm; duration=bars*4*beat; buf=array.array('f',[0])*int((duration+.15)*RATE)
    def note(midi,start,beats,volume,voice='lead'):
        freq=440*2**((midi-69)/12); length=beats*beat; offset=int(start*beat*RATE)
        for i in range(int(length*RATE)):
            t=i/RATE; attack=min(1,t/.009); release=min(1,(length-t)/.06)
            phase=2*math.pi*freq*t
            if voice=='lead': value=math.sin(phase)+.17*math.sin(phase*3)+.06*math.sin(phase*5)
            elif voice=='bass': value=math.sin(phase)+.13*math.sin(phase*2)
            else: value=math.sin(phase)+.06*math.sin(phase*2)
            env=attack*release*(.6+.4*math.exp(-t*3))
            if offset+i<len(buf):buf[offset+i]+=value*volume*env
    chords=[(57,60,64),(53,57,60),(48,52,55),(55,59,62),(57,60,64),(53,57,60),(50,53,57),(52,56,59)]
    motifs=[[76,79,81,83,81,79,76,74],[77,81,84,81,79,77,76,72],[76,79,84,83,79,76,74,72],[74,79,83,86,83,81,79,76],
            [81,84,88,86,84,83,81,79],[81,84,89,88,84,81,79,77],[77,81,86,84,81,77,76,74],[76,80,83,88,86,83,80,76]]
    for bar in range(bars):
        chord=chords[bar%8]; start=bar*4
        for m in chord:note(m,start,3.95,.065 if gentle else .045,'pad')
        for b in range(4):note(chord[0]-12,start+b,.82,.12 if not gentle else .07,'bass')
        if not gentle:
            for k in range(16):note(chord[k%3]+12,start+k*.25,.21,.052,'pad')
        motif=motifs[bar%8]
        for k,m in enumerate(motif):note(m-(12 if gentle else 0),start+k*.5,.46,.13 if not gentle else .085)
        if not gentle:
            for b in range(4):
                offset=int((start+b)*beat*RATE)
                for i in range(int(.105*RATE)):
                    t=i/RATE;buf[offset+i]+=.13*math.sin(2*math.pi*(66*t-95*t*t))*math.exp(-t*34)
    pcm=array.array('h'); peak=max(abs(v) for v in buf) or 1
    for i,v in enumerate(buf[:int(duration*RATE)]):
        edge=min(1,i/(RATE*.018),(duration*RATE-i)/(RATE*.018))
        pcm.append(int(math.tanh(v/peak*1.1)*.88*32767*max(0,edge)))
    with wave.open(str(path),'wb') as out:out.setnchannels(1);out.setsampwidth(2);out.setframerate(RATE);out.writeframes(pcm.tobytes())
    print(path,round(duration,2),'seconds; peak',round(max(abs(x) for x in pcm)/32768,3))
out=Path(__file__).resolve().parents[1]/'assets/audio'
compose(out/'champion-league.wav',136,32)
compose(out/'league-ending.wav',100,16,True)
