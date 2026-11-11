/* Studio-grade Sparkling Gemstone & Upbeat Pop Puzzle Audio Engine.
   Physical modeling of crystal/diamond impacts + 126 BPM Joyful Japanese Pop Groove
   (Warm FM Electric Piano, Bouncy Synth Bass, Acoustic Handclaps, and Celesta Lead). */
(()=>{
 'use strict';
 let ctx=null,master=null,sfxBus=null,bgmBus=null,bgmTimer=0,enabled=false,bgmActive=false,bgmStep=0;
 const gemBuffers={};

 // Physical synthesis of hard faceted gemstone / crystal collision:
 // Real crystals resonate with pure inharmonic modes and non-linear micro-contact stiffness relaxation.
 function renderCrystalSample(c, f0, dur, sparkle=1, double=false){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[
   {r:1.000, a:1.00, d:12.0}, // Fundamental crystal ring
   {r:1.583, a:0.65*sparkle, d:26.0}, // Inharmonic 3D facet mode
   {r:2.241, a:0.45*sparkle, d:42.0}, // Edge shear mode
   {r:3.125, a:0.28*sparkle, d:68.0}, // High surface sparkle
   {r:4.820, a:0.16*sparkle, d:110.0} // Micro-crystal ping
  ];
  for(let ch=0; ch<2; ch++){
   const panPhase = ch === 0 ? 0 : 0.0008; // subtle stereo air width
   for(let i=0; i<len; i++){
    const t=i/sr;
    // Contact stiffness relaxation: frequency settles over first 2.5ms
    const contact = 1 + 0.032 * Math.exp(-t*850);
    // Instantaneous elastic impact wavefront (< 1.2ms)
    const imp = t < 0.0012 ? Math.sin(Math.PI * t / 0.0012) * 0.32 : 0;
    let s = imp;
    for(let m=0; m<modes.length; m++){
     const f = f0 * modes[m].r * contact;
     const env = Math.exp(-t * modes[m].d);
     s += Math.sin(2 * Math.PI * f * (t + panPhase)) * modes[m].a * env;
    }
    // If double strike (for match / slide settle: two gems clinking together)
    if(double && t > 0.038){
     const t2 = t - 0.038;
     const contact2 = 1 + 0.03 * Math.exp(-t2*850);
     const imp2 = t2 < 0.0012 ? Math.sin(Math.PI * t2 / 0.0012) * 0.28 : 0;
     s += imp2;
     const f2 = f0 * 1.335; // major fourth/fifth interval
     for(let m=0; m<modes.length; m++){
      const f = f2 * modes[m].r * contact2;
      const env = Math.exp(-t2 * modes[m].d);
      s += Math.sin(2 * Math.PI * f * (t2 - panPhase)) * modes[m].a * env * 0.85;
     }
    }
    // Smooth analog warmth & zero clipping
    const out = Math.tanh(s * 0.48);
    if(ch === 0) left[i] = out; else right[i] = out;
   }
  }
  return buf;
 }

 // Physical acoustic synthesis of dense polished stone tile impact (Go/Mahjong slate stone):
 // Warm fundamental body resonance (450-600Hz) with rapid damping and zero metallic/glass ringing
 function renderAcousticStone(c, f0=540, dur=0.10, isSettle=false){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[
   {r:1.00, a:1.00, d:isSettle?55.0:42.0}, // Fundamental stone body resonance
   {r:1.46, a:0.42, d:isSettle?75.0:58.0}, // Stone shear mode
   {r:2.08, a:0.20, d:isSettle?110.0:85.0},// Surface edge mode
   {r:0.58, a:0.55, d:isSettle?60.0:48.0}  // Wood/table board sub-thud
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

 let soundProfile = (()=>{
  try{ return localStorage.getItem('kanji-pop-sound-profile') || 'tile'; }catch{ return 'tile'; }
 })();

 function buildGemLibrary(c){
  // Sound Profile Fallbacks
  gemBuffers.tile = [renderAcousticStone(c, 520, 0.09, true)];
  gemBuffers.gem = [renderCrystalSample(c, 1760.00, 0.22, 0.85, false)];
  gemBuffers.crystal = [renderCrystalSample(c, 2489.02, 0.18, 1.1, false)];
  gemBuffers.stone = [renderAcousticStone(c, 580, 0.08, true)];
  gemBuffers.soft = [renderAcousticStone(c, 440, 0.10, true)];
  gemBuffers.select = gemBuffers.tile;
  gemBuffers.slide = gemBuffers.tile;
  gemBuffers.match = [renderAcousticStone(c, 480, 0.12, false)];
  gemBuffers.contact = [renderCrystalSample(c, 1567.98, 0.36, 1.1, true)];
  gemBuffers.invalid = [renderAcousticStone(c, 360, 0.11, true)];
  gemBuffers.hint = [renderCrystalSample(c, 2400.00, 0.22, 0.9, true)];
  gemBuffers.sparkle = [renderCrystalSample(c, 2093.00, 0.20, 0.8, false)];

  // Asynchronously load real recorded acoustic stone & tile Foley audio samples
  const samplePacks = {
   tile: ['audio/tile_slide.mp3'],
   gem: ['audio/gem_clink.ogg', 'audio/gem_contact.ogg', 'audio/glass_3.ogg'],
   stone: ['audio/go_stone_1.mp3', 'audio/go_stone_2.mp3', 'audio/go_stone_3.mp3'],
   select: ['audio/tile_slide.mp3', 'audio/gem_clink.ogg', 'audio/go_stone_1.mp3'],
   match: ['audio/go_stone_0.mp3', 'audio/go_stone_4.mp3', 'audio/gem_contact.ogg'],
   contact: ['audio/go_capture_0.mp3', 'audio/gem_clink.ogg'],
   invalid: ['audio/go_stone_0.mp3'],
   hint: ['audio/bell_1.ogg', 'audio/gem_clink.ogg'],
   sparkle: ['audio/gem_contact.ogg', 'audio/glass_1.ogg']
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
    comp.threshold.value=-10;comp.knee.value=15;comp.ratio.value=3.2;comp.attack.value=.002;comp.release.value=.18;
    master=ctx.createGain();master.gain.value=.9;

    // SFX bus: Warm, natural acoustic response (5200Hz lowpass prevents harsh high-frequency clicks)
    const sfxFilter=ctx.createBiquadFilter();sfxFilter.type='lowpass';sfxFilter.frequency.value=5200;
    sfxBus=ctx.createGain();sfxBus.gain.value=0.85;
    sfxBus.connect(sfxFilter);sfxFilter.connect(comp);

    // BGM bus: Warm, cozy lowpass at 4000Hz so background music stays pleasant and never masks SFX
    const bgmFilter=ctx.createBiquadFilter();bgmFilter.type='lowpass';bgmFilter.frequency.value=4000;
    bgmBus=ctx.createGain();bgmBus.gain.value=0.19;
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

 // Play pre-rendered or real recorded stone/gemstone buffer
 function playGem(name, pitch=1.0, gain=1.0, delay=0){
  const c=ensure();if(!c)return;
  const list=gemBuffers[name];if(!list||!list.length)return;
  // If real recorded samples are loaded, pick from them (prefer later loaded audio files)
  const buf=list.length > 1 ? list[1 + Math.floor(Math.random()*(list.length - 1))] : list[0];
  const t=c.currentTime+delay;
  const src=c.createBufferSource();
  src.buffer=buf;
  // Natural micro-variation (+-2.5%) so each move feels alive and organic
  src.playbackRate.setValueAtTime(pitch * (0.975 + Math.random()*0.05), t);
  const g=c.createGain();
  g.gain.setValueAtTime(gain, t);
  src.connect(g);g.connect(sfxBus);
  src.start(t);
 }

 // 1. Tap stone: gentle, authentic tap
 function select(){
  haptic(4);
  if(soundProfile === 'tile') playGem('tile', 1.04, 0.35);
  else if(soundProfile === 'gem' || soundProfile === 'crystal') playGem('gem', 1.15, 0.32);
  else playGem('select', 1.0, 0.30);
 }

 // 2. Invalid tap: gentle warm bump (matches active profile, never jarring)
 function invalid(){
  haptic([6,16,6]);
  if(soundProfile === 'tile') playGem('tile', 0.82, 0.28);
  else playGem('invalid', 0.72, 0.30);
 }

 // 3. Slide stone: real acoustic sound of stone tile settling into slot (single clean sound)
 function slide(willMatch=false){
  haptic(willMatch?[6,14,12]:5);
  const c=ensure();if(!c)return;
  if(willMatch){
   // When leading to a match: maintain identical acoustic identity + subtle sparkle
   if(soundProfile === 'tile'){
    playGem('tile', 1.0, 0.45);
    playGem('sparkle', 1.25, 0.22, 0.04);
   }else if(soundProfile === 'gem' || soundProfile === 'crystal'){
    playGem('gem', 1.1, 0.45);
   }else{
    playGem('stone', 1.0, 0.42);
   }
  }else{
   // Normal move: single clean sound according to active profile
   if(soundProfile === 'tile'){
    playGem('tile', 1.0, 0.40);
   }else if(soundProfile === 'gem'){
    playGem('gem', 1.0, 0.35);
   }else if(soundProfile === 'crystal'){
    playGem('crystal', 1.0, 0.38);
   }else if(soundProfile === 'stone'){
    playGem('stone', 1.0, 0.34);
   }else{
    playGem('soft', 1.0, 0.38);
   }
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

 // 4. Two matching stones touch on board: real stone clatter + singing glass ring
 function contact(pair=0){
  haptic([12,20,18]);
  const rootPitch = 0.95 + (pair % 5) * 0.03;
  if(soundProfile === 'tile'){
   playGem('tile', rootPitch * 1.05, 0.32);
   playGem('sparkle', rootPitch * 1.2, 0.24, 0.02);
  }else{
   playGem('contact', rootPitch, 0.36);
   playGem('sparkle', rootPitch * 1.2, 0.24, 0.02);
  }
 }

 // 5. Fusion & Kanji Forge: Ascending crystal waterfall + solid stone impact + joyous Celesta chord
 function fusion(pair=0, combo=1){
  haptic([14,28,22,38]);
  const c=ensure();if(!c)return;
  const pitchMult = Math.pow(1.05, Math.min(5, Math.max(0, combo-1)));

  // Phase A: Rapid ascending cascade of 6 crystal diamond glints as stones spiral to center
  const scale=[1046.50, 1318.51, 1567.98, 1975.53, 2349.32, 3135.96];
  scale.forEach((f, i)=>{
   const t = c.currentTime + 0.04 + i * 0.085;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.038 + i*0.005, t + 0.003);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.18);
  });

  // Phase B: Solid stone impact strike + gemstone clatter at p = 0.36 (~0.72s)
  playGem('match', 1.15 * pitchMult, 0.50, 0.70);
  playGem('contact', 1.20 * pitchMult, 0.35, 0.72);
  playGem('sparkle', 1.35 * pitchMult, 0.28, 0.74);

  // Phase C: Warm, rich Celesta & Glass Marimba chord when the character appears
  const chord = [523.25, 659.25, 783.99, 987.77, 1318.51];
  chord.forEach((f, i)=>{
   const t = c.currentTime + 0.85 + i * 0.035;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
   // Soft overtone for bell warmth
   const o2 = c.createOscillator(), g2 = c.createGain();
   o2.type = 'triangle'; o2.frequency.setValueAtTime(f * 2 * pitchMult, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.045, t + 0.012);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
   g2.gain.setValueAtTime(0.0001, t);
   g2.gain.linearRampToValueAtTime(0.015, t + 0.012);
   g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
   o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.58);
   o2.connect(g2); g2.connect(sfxBus); o2.start(t); o2.stop(t + 0.38);
  });
 }

 function win(){
  haptic([20,35,20,35,50]);
  const c=ensure();if(!c)return;
  // Triumphant crystal fanfare
  [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i)=>{
   const t = c.currentTime + i * 0.065;
   playGem('select', f / 1567.98, 0.85, i * 0.065);
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.05, t + 0.008);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
   o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.68);
  });
 }

 function hint(){
  haptic(8);
  playGem('hint', 1.0, 0.85);
 }

 // -------------------------------------------------------------
 // UPBEAT 126 BPM JAPANESE PUZZLE POP BGM
 // Royal Road Progression (IV - V - iii - vi): Fmaj7 -> G7 -> Em7 -> Am7
 // Featuring: Warm Rhodes FM Chords, Bouncy Synth Bass, Soft Pop Drums, and Playful Celesta
 // -------------------------------------------------------------
 const chords = [
  { bass: 174.61, notes: [349.23, 440.00, 523.25, 659.25] }, // Fmaj7 (F3, A4, C5, E5)
  { bass: 196.00, notes: [392.00, 493.88, 587.33, 698.46] }, // G7 (G3, B4, D5, F5)
  { bass: 164.81, notes: [329.63, 392.00, 493.88, 587.33] }, // Em7 (E3, G4, B4, D5)
  { bass: 220.00, notes: [440.00, 523.25, 659.25, 783.99] }, // Am7 (A3, C5, E5, G5)
  { bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25] }, // Dm7 (D3, F4, A4, C5)
  { bass: 196.00, notes: [392.00, 493.88, 587.33, 659.25] }, // G6 (G3, B4, D5, E5)
  { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88] }, // Cmaj7 (C3, E4, G4, B4)
  { bass: 220.00, notes: [349.23, 440.00, 523.25, 659.25] }  // Turnaround (Fmaj7/A)
 ];

 const leadMelody = [
  // Bar 1 (Fmaj7): playful rising motif
  659.25, 0, 783.99, 880.00,  0, 1046.5, 0, 880.00,
  // Bar 2 (G7): bouncing resolve
  783.99, 0, 659.25, 587.33,  0, 783.99, 0, 0,
  // Bar 3 (Em7): sweet cute descent
  587.33, 0, 659.25, 783.99,  0, 987.77, 0, 783.99,
  // Bar 4 (Am7): groovy run
  659.25, 0, 523.25, 587.33,  0, 659.25, 0, 0,
  // Bar 5 (Dm7): uplifting leap
  587.33, 0, 659.25, 880.00,  0, 1046.5, 0, 1174.66,
  // Bar 6 (G6): soaring climax
  1318.51, 0, 1174.66, 1046.5, 0, 987.77, 0, 880.00,
  // Bar 7 (Cmaj7): joyful resolution
  1046.5, 0, 783.99, 659.25,  0, 523.25, 659.25, 783.99,
  // Bar 8 (Turn): sparkling turnaround
  880.00, 0, 987.77, 1046.5,  0, 1174.66, 0, 0
 ];

 // Warm FM Rhodes / Marimba chord voice (Zero buzz, soft & lush)
 function playFmChord(c, notes, time, dur=0.18, vol=0.024){
  notes.forEach((f, i)=>{
   const t = time + i * 0.004; // micro-strum
   const car = c.createOscillator(), mod = c.createOscillator();
   const modGain = c.createGain(), carGain = c.createGain();
   car.type = 'sine'; car.frequency.setValueAtTime(f, t);
   mod.type = 'sine'; mod.frequency.setValueAtTime(f * 2.0, t); // 2:1 FM ratio for warm bell warmth
   modGain.gain.setValueAtTime(f * 0.45, t);
   modGain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.85);
   carGain.gain.setValueAtTime(0.0001, t);
   carGain.gain.linearRampToValueAtTime(vol, t + 0.006);
   carGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
   mod.connect(modGain); modGain.connect(car.frequency);
   car.connect(carGain); carGain.connect(bgmBus);
   car.start(t); car.stop(t + dur + 0.02);
   mod.start(t); mod.stop(t + dur + 0.02);
  });
 }

 // Bouncy Pop Bass (Round, warm, punchy)
 function playPopBass(c, freq, time, dur=0.14){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  // Pitch snap on attack for punch
  o.frequency.exponentialRampToValueAtTime(freq * 0.85, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.048, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.02);
 }

 // Soft Acoustic Handclap / Pop Snare
 function playPopClap(c, time){
  const t = time;
  // Layered 3 micro-flams for authentic handclap
  [0, 0.011, 0.022].forEach((flam, idx)=>{
   const ft = t + flam;
   const rate = c.sampleRate, len = Math.floor(rate * 0.045), buf = c.createBuffer(1, len, rate), d = buf.getChannelData(0);
   for(let i=0; i<len; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (rate * 0.015));
   const src = c.createBufferSource(); src.buffer = buf;
   const flt = c.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.setValueAtTime(1600, ft); flt.Q.value = 1.8;
   const g = c.createGain(); g.gain.setValueAtTime(idx === 2 ? 0.028 : 0.014, ft);
   src.connect(flt); flt.connect(g); g.connect(bgmBus);
   src.start(ft);
  });
 }

 // Punchy Sub-Kick
 function playPopKick(c, time){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(115, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.08);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.065, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + 0.12);
 }

 // Sweet Celesta / Music Box Lead Note
 function playCelesta(c, freq, time, dur=0.22){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.028, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.02);
 }

 function scheduleBgm(){
  clearTimeout(bgmTimer);
  if(!enabled || !bgmActive || document.hidden)return;
  const c = ensure(); if(!c)return;

  // 126 BPM: 1 beat = 476ms; 1 eighth note = 238ms; 1 sixteenth note = 119ms
  const stepDur = 0.119;
  const batchSteps = 4; // schedule in small 476ms batches for drift-free precision

  for(let s=0; s<batchSteps; s++){
   const step = (bgmStep + s) % 64; // 8 bars * 8 eighths = 64 sixteenth-note units
   const barIdx = Math.floor(step / 8) % chords.length;
   const subStep = step % 8; // 0 to 7 within the half-bar
   const t = c.currentTime + s * stepDur;
   const chord = chords[barIdx];

   // 1. DRUMS (Bouncy Pop Groove)
   if(subStep === 0 || subStep === 4){
    playPopKick(c, t); // Kick on beat 1 and beat 3
   }
   if(subStep === 2 || subStep === 6){
    playPopClap(c, t); // Snare/Clap on beat 2 and beat 4
   }

   // 2. BASSLINE (Bouncing funk-pop walking bass)
   if(subStep === 0){
    playPopBass(c, chord.bass, t, 0.16); // Root
   }else if(subStep === 3){
    playPopBass(c, chord.bass * 1.5, t, 0.12); // Fifth bounce
   }else if(subStep === 5){
    playPopBass(c, chord.bass * 2.0, t, 0.14); // Octave pop
   }

   // 3. WARM CHORDS (Syncopated upbeats on step 1, 3, 5 for cheerful bounce)
   if(subStep === 1 || subStep === 4){
    playFmChord(c, chord.notes, t, 0.14, 0.022);
   }

   // 4. CELESTA MELODY (Catchy, cheerful, bright)
   const mel = leadMelody[step];
   if(mel && mel > 0){
    playCelesta(c, mel, t, 0.22);
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
