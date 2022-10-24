import React,{useState, useEffect} from 'react';
import ReactSlider from 'react-slider'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import '../css/homepage.css';

const range = (x,y) => {
    if (x > y)
      return range(y,x).reverse();
    else
      return x === y ? [y] : [x, ...range(x + 1, y)];
};

const midi2freq = (midi:number) =>{
    return Math.pow(2, (midi - 49) / 12.0) * 220
}

const firstNote = MidiNumbers.fromNote('c4');
const lastNote = MidiNumbers.fromNote('b4');

const HomePage = () =>{
    const [atx, setAtx] = useState(null);
    const [oscs, setOscs] = useState(null);
    const [lfo, setLfo] = useState(null);
    const [gain, setGainNode] = useState(null);

    useEffect(()=>{
        if(atx === null) return;
        const makeOscs = (startnote:number, endnote:number) => {
            console.log('makings oscs');
            let out = {}
            console.log(range(startnote, endnote))
            for(let i of range(startnote, endnote)){
                const osc = atx.createOscillator();
                osc.type = 'sine'
                osc.frequency.value = midi2freq(i);
                osc.start();
                
                out[i] = osc;
            }
            console.log(oscs);
            return out;
        }
        setOscs(makeOscs(firstNote, lastNote));
        const gn  = atx.createGain();
        gn.connect(atx.destination);
        setGainNode(gn);
        const _lfo = atx.createOscillator();
        _lfo.type = 'sine'
        _lfo.frequency.value = 3;
        _lfo.start();
        _lfo.connect(gn.gain);
        setLfo(_lfo);
    },[atx])
    
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: firstNote,
      lastNote: lastNote,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
        <div className = 'homepage'>
            <button onClick = {()=>{
                setAtx(new AudioContext());
                }}>start</button>
            <div className = 'keyboard-container'>
                <Piano
                    noteRange={{ first: firstNote, last: lastNote }}
                    playNote={(midiNumber:number) => {

                        console.log('playing', midiNumber);
                        oscs[midiNumber].connect(gain);
                    }}
                    stopNote={(midiNumber:number) => {
               
                        console.log('stopping', midiNumber);
                        oscs[midiNumber].disconnect(gain);
                    }}
                    width={1000}
                    keyboardShortcuts={keyboardShortcuts}
                />
            </div>
            <div className = 'lfo-state-container'></div>
            <div className = 'adsr-container'></div>
            <div className = 'knobs-container'></div>
            <div className = 'harmonics-container'></div>
        </div>
        
    );
}

export default HomePage;