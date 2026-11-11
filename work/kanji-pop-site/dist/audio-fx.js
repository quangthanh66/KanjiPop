/* Studio-grade Acoustic Slate Stone & Chill Zen-Pop Audio Engine.
   Physical modeling of acoustic slate stones (Go/Mahjong/Pebbles),
   tuned Lithophone stone chimes, wooden marimba, and peaceful chill BGM. */
(()=>{
 'use strict';
 let ctx=null,master=null,sfxBus=null,bgmBus=null,bgmTimer=0,enabled=false,bgmActive=false,bgmStep=0;
 const gemBuffers={};

 // -------------------------------------------------------------
 // 1. PHYSICAL ACOUSTIC SYNTHESIS ENGINES
 // -------------------------------------------------------------

 // Physical acoustic synthesis of dense polished slate stone (Go / Mahjong / River stone):
 // Warm fundamental body resonance (450-620Hz) with rapid physical damping, zero glass/metallic ring.
 function renderAcousticStone(c, f0=520, dur=0.10, isSettle=true, dampingMult=1.0){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const dMult = dampingMult * (isSettle ? 1.25 : 1.0);
  const modes=[
   {r:1.00, a:1.00, d:46.0 * dMult}, // Fundamental stone body resonance
   {r:1.46, a:0.42, d:62.0 * dMult}, // Stone shear mode
   {r:2.08, a:0.20, d:95.0 * dMult}, // Surface edge mode
   {r:0.58, a:0.55, d:52.0 * dMult}  // Solid board / table sub-thud
  ];
  for(let ch=0; ch<2; ch++){
   const panPhase = ch === 0 ? 0 : 0.0004;
   for(let i=0; i<len; i++){
    const t=i/sr;
    // Rounded 1.8ms physical contact wavefront (prevents harsh/piercing click)
    const imp = t < 0.0018 ? Math.sin(Math.PI * t / 0.0018) * 0.32 : 0;
    let s = imp;
    for(let m=0; m<modes.length; m++){
     const f = f0 * modes[m].r;
     const env = Math.exp(-t * modes[m].d);
     s += Math.sin(2 * Math.PI * f * (t + panPhase)) * modes[m].a * env;
    }
    const out = Math.tanh(s * 0.52);
    if(ch===0) left[i]=out; else right[i]=out;
   }
  }
  return buf;
 }

 // Double stone click (two polished stones kissing and settling together)
 function renderAcousticStoneDouble(c, f0=500, dur=0.14){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  for(let ch=0; ch<2; ch++){
   const panPhase = ch === 0 ? 0 : 0.0005;
   for(let i=0; i<len; i++){
    const t=i/sr;
    // First strike at t=0
    const imp1 = t < 0.0016 ? Math.sin(Math.PI * t / 0.0016) * 0.28 : 0;
    let s = imp1;
    const f1 = f0;
    s += Math.sin(2 * Math.PI * f1 * (t + panPhase)) * Math.exp(-t * 50);
    s += Math.sin(2 * Math.PI * f1 * 1.46 * (t + panPhase)) * 0.35 * Math.exp(-t * 70);
    s += Math.sin(2 * Math.PI * f1 * 0.58 * (t + panPhase)) * 0.45 * Math.exp(-t * 55);

    // Second settle strike at t=0.024s (higher pitch, settling stone)
    if(t > 0.024){
     const t2 = t - 0.024;
     const imp2 = t2 < 0.0014 ? Math.sin(Math.PI * t2 / 0.0014) * 0.24 : 0;
     const f2 = f0 * 1.18;
     s += imp2;
     s += Math.sin(2 * Math.PI * f2 * (t2 - panPhase)) * 0.75 * Math.exp(-t2 * 60);
     s += Math.sin(2 * Math.PI * f2 * 1.46 * (t2 - panPhase)) * 0.25 * Math.exp(-t2 * 85);
    }
    const out = Math.tanh(s * 0.50);
    if(ch===0) left[i]=out; else right[i]=out;
   }
  }
  return buf;
 }

 // Tuned Lithophone / Stone Chime Bar (Vietnamese Đàn Đá / Japanese temple stone chime):
 // Pure, tranquil, warm stone bar bell tone.
 function renderStoneChime(c, f0, dur=0.55){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[
   {r:1.00, a:1.00, d:7.5},  // Fundamental tuned stone chime
   {r:1.48, a:0.32, d:14.0}, // Lithophone bar shear mode
   {r:2.76, a:0.18, d:22.0}, // Upper chime sparkle
   {r:0.50, a:0.15, d:12.0}  // Soft mallet strike undertone
  ];
  for(let ch=0; ch<2; ch++){
   const panPhase = ch === 0 ? 0 : 0.0006;
   for(let i=0; i<len; i++){
    const t=i/sr;
    const imp = t < 0.002 ? Math.sin(Math.PI * t / 0.002) * 0.22 : 0;
    let s = imp;
    for(let m=0; m<modes.length; m++){
     const f = f0 * modes[m].r;
     const env = Math.exp(-t * modes[m].d);
     s += Math.sin(2 * Math.PI * f * (t + panPhase)) * modes[m].a * env;
    }
    const out = Math.tanh(s * 0.45);
    if(ch===0) left[i]=out; else right[i]=out;
   }
  }
  return buf;
 }

 let soundProfile = (()=>{
  try{ return localStorage.getItem('kanji-pop-sound-profile') || 'tile'; }catch{ return 'tile'; }
 })();

 function buildGemLibrary(c){
  // All default sound buffers synthesized with acoustic slate stone physics:
  gemBuffers.tile = [renderAcousticStone(c, 520, 0.09, true)];
  gemBuffers.stone = [renderAcousticStone(c, 540, 0.08, true)];
  gemBuffers.soft = [renderAcousticStone(c, 460, 0.10, true)];
  gemBuffers.select = [renderAcousticStone(c, 580, 0.065, true, 1.2)]; // Crisp snappy tap
  gemBuffers.slide = [renderAcousticStone(c, 520, 0.09, true)]; // The exact beloved stone slide
  gemBuffers.match = [renderAcousticStone(c, 480, 0.11, false)];
  gemBuffers.contact = [renderAcousticStoneDouble(c, 510, 0.13)]; // Two stones clicking together
  gemBuffers.invalid = [renderAcousticStone(c, 290, 0.08, true, 1.6)]; // Soft low-pitched muted bump
  gemBuffers.hint = [renderStoneChime(c, 520, 0.35)]; // Gentle stone chime harmonic
  gemBuffers.sparkle = [renderStoneChime(c, 784, 0.25)];

  // Asynchronously load real recorded acoustic stone & tile Foley audio samples
  const samplePacks = {
   tile: ['audio/tile_slide.mp3', 'audio/stone_slide.ogg'],
   slide: ['audio/tile_slide.mp3', 'audio/stone_slide.ogg'],
   select: ['audio/stone_tap.ogg', 'audio/go_stone_1.mp3', 'audio/go_stone_2.mp3'],
   stone: ['audio/go_stone_1.mp3', 'audio/go_stone_2.mp3', 'audio/go_stone_3.mp3'],
   match: ['audio/stone_match.ogg', 'audio/go_stone_3.mp3', 'audio/go_stone_4.mp3'],
   contact: ['audio/stone_tap.ogg', 'audio/go_stone_2.mp3', 'audio/go_stone_1.mp3'],
   invalid: ['audio/go_stone_0.mp3'],
   hint: ['audio/plate_1.ogg', 'audio/plate_3.ogg'],
   sparkle: ['audio/stone_tap.ogg', 'audio/plate_1.ogg']
  };

  const loadedPacks = {};
  Object.entries(samplePacks).forEach(([name, urls])=>{
   urls.forEach(url=>{
    fetch(url).then(r=>r.arrayBuffer()).then(ab=>c.decodeAudioData(ab)).then(buf=>{
     if(!loadedPacks[name]){
      gemBuffers[name] = [];
      loadedPacks[name] = true;
     }
     gemBuffers[name].push(buf);
    }).catch(()=>{});
   });
  });
 }

 function ensure(){
  if(!enabled)return null;
  try{
   if(!ctx){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    ctx=new AC();

    // Master bus with gentle limiter
    const comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-8;comp.knee.value=12;comp.ratio.value=3.0;comp.attack.value=.002;comp.release.value=.15;
    master=ctx.createGain();master.gain.value=0.96;

    // SFX bus: Warm, natural acoustic response
    const sfxFilter=ctx.createBiquadFilter();sfxFilter.type='lowpass';sfxFilter.frequency.value=5600;
    sfxBus=ctx.createGain();sfxBus.gain.value=0.92;
    sfxBus.connect(sfxFilter);sfxFilter.connect(comp);

    // BGM bus: Master volume boosted from 0.19 to 0.56, pleasant warm 3800Hz lowpass for cozy ambiance
    const bgmFilter=ctx.createBiquadFilter();bgmFilter.type='lowpass';bgmFilter.frequency.value=3800;
    bgmBus=ctx.createGain();bgmBus.gain.value=0.56;
    bgmBus.connect(bgmFilter);bgmFilter.connect(comp);

    comp.connect(master);master.connect(ctx.destination);
    buildGemLibrary(ctx);
   }
   if(ctx.state==='suspended')ctx.resume();
   return ctx;
  }catch{return null;}
 }

 function haptic(pattern){
  try{if(navigator.vibrate&&!matchMedia('(prefers-reduced-motion:reduce)').matches)navigator.vibrate(pattern);}catch{}
 }

 // Play pre-rendered or real recorded stone buffer
 function playGem(name, pitch=1.0, gain=1.0, delay=0){
  const c=ensure();if(!c)return;
  const list=gemBuffers[name];if(!list||!list.length)return;
  // If real recorded samples are loaded, pick from them
  const buf=list.length > 1 ? list[1 + Math.floor(Math.random()*(list.length - 1))] : list[0];
  const t=c.currentTime+delay;
  const src=c.createBufferSource();
  src.buffer=buf;
  // Natural micro-variation (+-2.0%) so each move feels alive and organic
  src.playbackRate.setValueAtTime(pitch * (0.98 + Math.random()*0.04), t);
  const g=c.createGain();
  g.gain.setValueAtTime(gain, t);
  src.connect(g);g.connect(sfxBus);
  src.start(t);
 }

 // 1. Select / Tap: crisp, satisfying acoustic stone tap
 function select(){
  haptic(4);
  playGem('select', 1.05, 0.42);
 }

 // 2. Invalid tap: gentle warm bump on table, zero jarring harshness
 function invalid(){
  haptic([6,16,6]);
  playGem('invalid', 0.85, 0.35);
 }

 // 3. Slide stone: the authentic acoustic slate stone slide clink
 function slide(willMatch=false){
  haptic(willMatch?[6,14,12]:5);
  const c=ensure();if(!c)return;
  if(willMatch){
   // When leading to a match: clean stone slide + subtle resonant clink
   playGem('tile', 1.0, 0.48);
   playGem('contact', 1.10, 0.30, 0.035);
  }else{
   // Normal move: clean, satisfying stone slide
   playGem('tile', 1.0, 0.44);
  }
 }

 function setSoundProfile(name){
  if(['tile','gem','crystal','stone','soft'].includes(name)){
   soundProfile = name;
   try{localStorage.setItem('kanji-pop-sound-profile', name);}catch{}
   slide(false);
  }
 }

 function getSoundProfile(){ return soundProfile; }

 // 4. Two matching stones touch on board: real acoustic stone kiss & double clink
 function contact(pair=0){
  haptic([12,20,18]);
  const rootPitch = 0.96 + (pair % 5) * 0.04;
  playGem('contact', rootPitch, 0.45);
 }

 // 5. Fusion & Kanji Forge: Deep resonant stone lithophone chime + solid stone locking impact
 function fusion(pair=0, combo=1){
  haptic([14,28,22,38]);
  const c=ensure();if(!c)return;
  const pitchMult = Math.pow(1.04, Math.min(4, Math.max(0, combo-1)));

  // Phase A: Rapid organic stone clatter as blocks rush together
  playGem('contact', 1.0 * pitchMult, 0.45, 0.02);
  playGem('match', 1.08 * pitchMult, 0.50, 0.08);

  // Phase B: Peaceful, warm Stone Lithophone chord bloom (G major / Pentatonic temple chime)
  // G3 (196Hz - warm resonant body), D4 (293.7Hz), G4 (392Hz), B4 (493.9Hz), D5 (587.3Hz)
  const stoneChord = [196.00, 293.66, 392.00, 493.88, 587.33];
  stoneChord.forEach((f, i)=>{
   const t = c.currentTime + 0.16 + i * 0.04;
   // Fundamental stone bar oscillator
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine';
   o.frequency.setValueAtTime(f * pitchMult, t);

   // Inharmonic shear mode (1.46 ratio for stone bar ring)
   const o2 = c.createOscillator(), g2 = c.createGain();
   o2.type = 'sine';
   o2.frequency.setValueAtTime(f * 1.46 * pitchMult, t);

   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.055, t + 0.012);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

   g2.gain.setValueAtTime(0.0001, t);
   g2.gain.linearRampToValueAtTime(0.018, t + 0.012);
   g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

   o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.68);
   o2.connect(g2); g2.connect(sfxBus); o2.start(t); o2.stop(t + 0.45);
  });

  // Phase C: Solid, decisive stone lock "TOCK" as the Kanji character is forged
  playGem('tile', 1.0 * pitchMult, 0.52, 0.48);
 }

 // 6. Win / Chapter complete: Joyful acoustic stone marimba / lithophone fanfare
 function win(){
  haptic([20,35,20,35,50]);
  const c=ensure();if(!c)return;
  // Pentatonic stone chime sequence (C4, D4, E4, G4, A4, C5, D5, E5)
  const melody = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  melody.forEach((f, i)=>{
   const t = c.currentTime + i * 0.075;
   playGem('select', f / 520, 0.65, i * 0.075);
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine';
   o.frequency.setValueAtTime(f, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.060, t + 0.010);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.70);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.75);
  });
 }

 // 7. Hint: gentle acoustic stone chime harmonic (5th interval)
 function hint(){
  haptic(8);
  const c=ensure();if(!c)return;
  playGem('select', 1.0, 0.45);
  const chord = [520.00, 780.00];
  chord.forEach((f, i)=>{
   const t = c.currentTime + i * 0.03;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.045, t + 0.01);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
   o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.48);
  });
 }

 // -------------------------------------------------------------
 // CHILL ACOUSTIC STONE & MARIMBA BGM (116 BPM)
 // Royal Road Progression (IV - V - iii - vi): Fmaj7 -> G7 -> Em7 -> Am7
 // Featuring: Warm Acoustic Stone Marimba, Rhythmic Stone Clicks,
 // Round Wooden Bass, and Soft Kalimba Melody.
 // -------------------------------------------------------------
 const chords = [
  { bass: 174.61, notes: [349.23, 440.00, 523.25, 659.25] }, // Fmaj7
  { bass: 196.00, notes: [392.00, 493.88, 587.33, 698.46] }, // G7
  { bass: 164.81, notes: [329.63, 392.00, 493.88, 587.33] }, // Em7
  { bass: 220.00, notes: [440.00, 523.25, 659.25, 783.99] }, // Am7
  { bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25] }, // Dm7
  { bass: 196.00, notes: [392.00, 493.88, 587.33, 659.25] }, // G6
  { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88] }, // Cmaj7
  { bass: 220.00, notes: [349.23, 440.00, 523.25, 659.25] }  // Turnaround (Fmaj7/A)
 ];

 const leadMelody = [
  // Bar 1 (Fmaj7): playful peaceful motif
  659.25, 0, 783.99, 880.00,  0, 1046.5, 0, 880.00,
  // Bar 2 (G7): relaxing resolve
  783.99, 0, 659.25, 587.33,  0, 783.99, 0, 0,
  // Bar 3 (Em7): sweet gentle descent
  587.33, 0, 659.25, 783.99,  0, 987.77, 0, 783.99,
  // Bar 4 (Am7): cozy chill run
  659.25, 0, 523.25, 587.33,  0, 659.25, 0, 0,
  // Bar 5 (Dm7): uplifting melody
  587.33, 0, 659.25, 880.00,  0, 1046.5, 0, 1174.66,
  // Bar 6 (G6): gentle soaring chime
  1318.51, 0, 1174.66, 1046.5, 0, 987.77, 0, 880.00,
  // Bar 7 (Cmaj7): serene resolution
  1046.5, 0, 783.99, 659.25,  0, 523.25, 659.25, 783.99,
  // Bar 8 (Turn): peaceful turnaround
  880.00, 0, 987.77, 1046.5,  0, 1174.66, 0, 0
 ];

 // Warm Acoustic Stone Marimba Chords (Rich, organic, wooden/stone resonance)
 function playStoneMarimbaChord(c, notes, time, dur=0.22, vol=0.065){
  notes.forEach((f, i)=>{
   const t = time + i * 0.006; // natural strum spread
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f, t);

   // Inharmonic stone mode for warm organic marimba timbre
   const o2 = c.createOscillator(), g2 = c.createGain();
   o2.type = 'sine'; o2.frequency.setValueAtTime(f * 1.48, t);

   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(vol, t + 0.008);
   g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

   g2.gain.setValueAtTime(0.0001, t);
   g2.gain.linearRampToValueAtTime(vol * 0.32, t + 0.008);
   g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);

   o.connect(g); g.connect(bgmBus);
   o2.connect(g2); g2.connect(bgmBus);
   o.start(t); o.stop(t + dur + 0.03);
   o2.start(t); o2.stop(t + dur + 0.03);
  });
 }

 // Round Acoustic Thumb Piano / Bass (Warm, deep, punchy)
 function playAcousticBass(c, freq, time, dur=0.18){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.88, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.082, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.02);
 }

 // Rhythmic Acoustic Stone Click (Polished river stone percussion on beats 2 & 4)
 function playStoneClickPercussion(c, time){
  const t = time;
  // Two layered stone micro-clicks for organic woodblock/stone tap
  [0, 0.012].forEach((flam, idx)=>{
   const ft = t + flam;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'triangle';
   o.frequency.setValueAtTime(idx === 0 ? 540 : 880, ft);
   o.frequency.exponentialRampToValueAtTime(idx === 0 ? 220 : 380, ft + 0.035);
   g.gain.setValueAtTime(0.0001, ft);
   g.gain.linearRampToValueAtTime(idx === 0 ? 0.038 : 0.026, ft + 0.002);
   g.gain.exponentialRampToValueAtTime(0.0001, ft + 0.04);
   o.connect(g); g.connect(bgmBus);
   o.start(ft); o.stop(ft + 0.045);
  });
 }

 // Soft Acoustic Mallet Thump (Low cajon / table kick on beats 1 & 3)
 function playStoneMalletThump(c, time){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(95, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.075, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + 0.14);
 }

 // Sweet Kalimba / Stone Chime Lead Melody
 function playStoneKalimbaLead(c, freq, time, dur=0.28){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  // Overtone mode for kalimba tine ringing
  const o2 = c.createOscillator(), g2 = c.createGain();
  o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 2.76, t);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.068, t + 0.007);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.linearRampToValueAtTime(0.016, t + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.45);

  o.connect(g); g.connect(bgmBus);
  o2.connect(g2); g2.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.03);
  o2.start(t); o2.stop(t + dur + 0.03);
 }

 function scheduleBgm(){
  clearTimeout(bgmTimer);
  if(!enabled || !bgmActive || document.hidden)return;
  const c = ensure(); if(!c)return;

  // 118 BPM: relaxing, chill, cozy tempo
  // 1 beat = 508ms; 1 eighth = 254ms; 1 sixteenth = 127ms
  const stepDur = 0.127;
  const batchSteps = 4; // drift-free batches

  for(let s=0; s<batchSteps; s++){
   const step = (bgmStep + s) % 64; // 8 bars * 8 sixteenths
   const barIdx = Math.floor(step / 8) % chords.length;
   const subStep = step % 8;
   const t = c.currentTime + s * stepDur;
   const chord = chords[barIdx];

   // 1. ACOUSTIC STONE PERCUSSION (Soft mallet kick + pebble clink)
   if(subStep === 0 || subStep === 4){
    playStoneMalletThump(c, t); // Warm mallet thump on 1 & 3
   }
   if(subStep === 2 || subStep === 6){
    playStoneClickPercussion(c, t); // Gentle stone click on 2 & 4
   }

   // 2. ROUND ACOUSTIC BASS
   if(subStep === 0){
    playAcousticBass(c, chord.bass, t, 0.20);
   }else if(subStep === 3){
    playAcousticBass(c, chord.bass * 1.5, t, 0.15);
   }else if(subStep === 5){
    playAcousticBass(c, chord.bass * 2.0, t, 0.17);
   }

   // 3. WARM ACOUSTIC STONE MARIMBA CHORDS
   if(subStep === 1 || subStep === 4){
    playStoneMarimbaChord(c, chord.notes, t, 0.18, 0.060);
   }

   // 4. PEACEFUL KALIMBA / LITHOPHONE LEAD MELODY
   const mel = leadMelody[step];
   if(mel && mel > 0){
    playStoneKalimbaLead(c, mel, t, 0.26);
   }
  }

  bgmStep = (bgmStep + batchSteps) % 64;
  bgmTimer = setTimeout(scheduleBgm, batchSteps * stepDur * 1000 - 25);
 }

 function setEnabled(flag){
  enabled=!!flag;
  if(!enabled){
   clearTimeout(bgmTimer);
   if(ctx && ctx.state==='running')ctx.suspend().catch(()=>{});
  }else{
   ensure();
   if(bgmActive)scheduleBgm();
  }
 }

 function setBgm(flag){
  const was=bgmActive;bgmActive=!!flag;
  if(enabled && bgmActive){
   if(!was)scheduleBgm();
  }else{
   clearTimeout(bgmTimer);
  }
 }

 document.addEventListener('visibilitychange', ()=>{
  if(document.hidden)clearTimeout(bgmTimer);
  else if(enabled && bgmActive)scheduleBgm();
 });

 // Japanese Web Speech API pronunciation engine
 let voiceEnabled = true;
 function setVoiceEnabled(flag){ voiceEnabled = !!flag; }
 function isVoiceEnabled(){ return voiceEnabled; }

 function speak(text, lang = 'ja-JP'){
  if(!voiceEnabled || !text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
   window.speechSynthesis.cancel();
   const u = new SpeechSynthesisUtterance(text);
   u.lang = lang;
   u.rate = 0.88; // Calm, clear, chill pronunciation
   u.pitch = 1.02;
   u.volume = 0.95;
   const voices = window.speechSynthesis.getVoices();
   const ja = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || (v.lang && v.lang.startsWith('ja')));
   if(ja) u.voice = ja;
   window.speechSynthesis.speak(u);
  } catch(e) {
   console.warn('SpeechSynthesis error:', e);
  }
 }

 if(typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
   try { window.speechSynthesis.getVoices(); } catch(e) {}
  };
 }

 window.KanjiAudio={setEnabled, setBgm, select, invalid, slide, contact, fusion, win, hint, haptic, setSoundProfile, getSoundProfile, speak, setVoiceEnabled, isVoiceEnabled};
})();
