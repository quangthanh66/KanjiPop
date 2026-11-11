/* Studio-grade Granular Audio Engine & Audition Studio for Kanji Pop.
   - Unified Tile Tap & Movement (10 tactile options for tap/slide/contact)
   - Zero invalid move penalty (free slide navigation)
   - Zero hint sound clutter
   - 10 distinct synthesized options each for Tile Tap, Fusion, Win, and BGM (40 total options)
   - Native Japanese TTS Utterance synthesis */
(()=>{
 'use strict';
 let ctx=null,master=null,sfxBus=null,bgmBus=null,bgmTimer=0,enabled=false,bgmActive=false,bgmStep=0;
 const gemBuffers={};

 const defaultAudioMap = {
  tileTap: 'tile',
  fusion: 'pop',
  win: 'pop',
  bgm: 'pop',
  voice: 'on'
 };

 const audioPresets = {
  popGem: {
   id: 'popGem',
   name: '💎 Bản gốc: Pop & Đá quý',
   desc: 'Giai điệu J-Pop 126 BPM sôi động cùng âm đá quý pha lê giòn tan.',
   map: { tileTap: 'gem', fusion: 'pop', win: 'pop', bgm: 'pop', voice: 'on' }
  },
  zenStone: {
   id: 'zenStone',
   name: '🍃 Cổ phong: Đá mộc & Zen Chill',
   desc: 'Phiến đá mộc êm dịu, đàn đá Lithophone và mộc cầm 118 BPM thanh tịnh.',
   map: { tileTap: 'tile', fusion: 'zen', win: 'zen', bgm: 'zen', voice: 'on' }
  },
  sakuraKoto: {
   id: 'sakuraKoto',
   name: '🌸 Trà đạo: Đàn Koto & Hoa anh đào',
   desc: 'Mộc bản ấm áp, giai điệu đàn tranh Koto truyền thống và khúc hoa anh đào.',
   map: { tileTap: 'wood', fusion: 'koto', win: 'sakura', bgm: 'koto', voice: 'on' }
  },
  arcadeRetro: {
   id: 'arcadeRetro',
   name: '🎮 Hoài niệm: 8-Bit Pixel Arcade',
   desc: 'Âm kim khí vui nhộn, power-up 8-bit và nhạc game 4 nút NES thập niên 90.',
   map: { tileTap: 'metal', fusion: 'arcade', win: 'arcade', bgm: 'chiptune', voice: 'on' }
  },
  lofiCafe: {
   id: 'lofiCafe',
   name: '☕ Thư giãn: Lofi Study Cafe',
   desc: 'Tiếng ngọc bích êm đềm, sóng nước dâng trào và giai điệu Lofi 84 BPM ấm cúng.',
   map: { tileTap: 'soft', fusion: 'water', win: 'circus', bgm: 'lofi', voice: 'on' }
  },
  cosmicFantasy: {
   id: 'cosmicFantasy',
   name: '✨ Thiên hà: Thạch anh & Vũ trụ',
   desc: 'Chuỗi thạch anh tím ngân nga, cổng không gian và nhạc nền Synthwave kỳ ảo.',
   map: { tileTap: 'quartz', fusion: 'sparkle', win: 'crystal', bgm: 'synthwave', voice: 'on' }
  }
 };

 let customAudioMap = (()=>{
  try{
   const saved = localStorage.getItem('kp-custom-audio-map');
   if(saved) return Object.assign({}, defaultAudioMap, JSON.parse(saved));
  }catch{}
  let b = 'pop', p = 'tile', v = true;
  try{ b = localStorage.getItem('kp-bgm-style') || 'pop'; }catch{}
  try{ p = localStorage.getItem('kanji-pop-sound-profile') || 'tile'; }catch{}
  try{ v = localStorage.getItem('kp-voice-enabled') !== 'false'; }catch{}
  return {
   tileTap: ['tile','gem','wood','stone','soft','porcelain','metal','quartz','bamboo','water'].includes(p)?p:'tile',
   fusion: b === 'zen' ? 'zen' : 'pop',
   win: b === 'zen' ? 'zen' : 'pop',
   bgm: b,
   voice: v ? 'on' : 'off'
  };
 })();

 /* --- PHYSICAL MODELING RESIDUAL SYNTHESIZERS --- */

 function renderCrystalSample(c, f0, dur, sparkle=1, double=false){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[
   {r:1.000, a:1.00, d:12.0},
   {r:1.583, a:0.65*sparkle, d:26.0},
   {r:2.241, a:0.45*sparkle, d:42.0},
   {r:3.125, a:0.28*sparkle, d:68.0},
   {r:4.820, a:0.16*sparkle, d:110.0}
  ];
  for(let i=0; i<len; i++){
   const t=i/sr;
   let s=0;
   for(let m=0; m<modes.length; m++){
    const md=modes[m];
    s += md.a * Math.sin(2*Math.PI * f0 * md.r * t) * Math.exp(-md.d * t);
   }
   if(double && t > 0.038){
    const t2 = t - 0.038;
    for(let m=0; m<modes.length; m++){
     const md=modes[m];
     s += 0.55 * md.a * Math.sin(2*Math.PI * f0 * 1.12 * md.r * t2) * Math.exp(-md.d * 1.3 * t2);
    }
   }
   const noise = (Math.random()*2 - 1) * Math.exp(-180.0 * t) * 0.12;
   const env = Math.min(1.0, t/0.0015);
   const val = (s + noise) * env * 0.42;
   left[i] = val * 0.98;
   right[i] = val * 1.02;
  }
  return buf;
 }

 function renderAcousticStone(c, f0, dur, double=false, damping=1.0){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[
   {r:1.00, a:1.00, d:34.0*damping},
   {r:1.46, a:0.75, d:58.0*damping},
   {r:2.18, a:0.45, d:92.0*damping},
   {r:3.22, a:0.25, d:140.0*damping},
   {r:4.60, a:0.12, d:210.0*damping}
  ];
  for(let i=0; i<len; i++){
   const t=i/sr;
   let s=0;
   for(let m=0; m<modes.length; m++){
    const md=modes[m];
    s += md.a * Math.sin(2*Math.PI * f0 * md.r * t) * Math.exp(-md.d * t);
   }
   if(double && t > 0.024){
    const t2 = t - 0.024;
    for(let m=0; m<modes.length; m++){
     const md=modes[m];
     s += 0.52 * md.a * Math.sin(2*Math.PI * f0 * 1.06 * md.r * t2) * Math.exp(-md.d * 1.2 * t2);
    }
   }
   const impactNoise = (Math.random()*2 - 1) * Math.exp(-420.0 * t) * 0.48;
   const env = Math.min(1.0, t/0.001);
   const val = (s * 0.55 + impactNoise) * env * 0.60;
   left[i] = val;
   right[i] = val;
  }
  return buf;
 }

 function renderWoodBlock(c, f0, dur){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  for(let i=0; i<len; i++){
   const t=i/sr;
   const f=f0*(1.0 + 0.6*Math.exp(-140*t));
   const body=Math.sin(2*Math.PI*f*t)*Math.exp(-48*t);
   const overtone=0.35*Math.sin(2*Math.PI*f*2.76*t)*Math.exp(-95*t);
   const click=(Math.random()*2 - 1)*Math.exp(-600*t)*0.28;
   const val=(body + overtone + click)*Math.min(1.0, t/0.001)*0.65;
   left[i]=val; right[i]=val;
  }
  return buf;
 }

 function renderBrassBell(c, f0, dur){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[{r:1.0, a:1.0, d:6.0}, {r:2.76, a:0.55, d:12.0}, {r:5.4, a:0.25, d:24.0}];
  for(let i=0; i<len; i++){
   const t=i/sr;
   let s=0;
   modes.forEach(m => s += m.a * Math.sin(2*Math.PI*f0*m.r*t) * Math.exp(-m.d*t));
   const val=s*Math.min(1.0, t/0.001)*0.45;
   left[i]=val; right[i]=val;
  }
  return buf;
 }

 function renderPorcelain(c, f0=2200, dur=0.14){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[{r:1.0, a:1.0, d:28}, {r:1.73, a:0.65, d:55}, {r:2.85, a:0.4, d:95}];
  for(let i=0; i<len; i++){
   const t=i/sr;
   let s=0;
   modes.forEach(m => s += m.a * Math.sin(2*Math.PI*f0*m.r*t) * Math.exp(-m.d*t));
   const click = (Math.random()*2 - 1) * Math.exp(-650*t) * 0.25;
   const val = (s*0.7 + click) * Math.min(1.0, t/0.001) * 0.55;
   left[i] = val; right[i] = val;
  }
  return buf;
 }

 function renderWaterPlink(c, f0=480, dur=0.16){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  for(let i=0; i<len; i++){
   const t=i/sr;
   const f = f0 * (0.8 + 1.2 * (1 - Math.exp(-60*t)));
   const s = Math.sin(2*Math.PI*f*t) * Math.exp(-24*t);
   const val = s * Math.min(1.0, t/0.002) * 0.65;
   left[i] = val; right[i] = val;
  }
  return buf;
 }

 function buildGemLibrary(c){
  // 10 Tactile Tile Tap models:
  gemBuffers.tile = [renderAcousticStone(c, 520, 0.09, true)];
  gemBuffers.gem = [renderCrystalSample(c, 1760.00, 0.22, 0.85, false)];
  gemBuffers.wood = [renderWoodBlock(c, 480, 0.09)];
  gemBuffers.stone = [renderAcousticStone(c, 560, 0.07, true, 1.6)];
  gemBuffers.soft = [renderAcousticStone(c, 440, 0.10, true, 0.8)];
  gemBuffers.porcelain = [renderPorcelain(c, 2200, 0.14)];
  gemBuffers.metal = [renderBrassBell(c, 1860, 0.18)];
  gemBuffers.quartz = [renderCrystalSample(c, 2489.02, 0.20, 1.2, false)];
  gemBuffers.bamboo = [renderWoodBlock(c, 680, 0.065)];
  gemBuffers.water = [renderWaterPlink(c, 480, 0.16)];
  gemBuffers.sparkle = [renderCrystalSample(c, 2093.00, 0.20, 0.8, false)];
  gemBuffers.match = [renderAcousticStone(c, 480, 0.11, false)];
  gemBuffers.contact = [renderCrystalSample(c, 1567.98, 0.36, 1.1, true)];
 }

 function ensure(){
  if(ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 1.0; sfxBus.connect(master);
  bgmBus = ctx.createGain(); bgmBus.gain.value = 0.55; bgmBus.connect(master);
  buildGemLibrary(ctx);
  return ctx;
 }

 function haptic(pattern=10){
  if(typeof navigator !== 'undefined' && navigator.vibrate){
   try{ navigator.vibrate(pattern); }catch{}
  }
 }

 function playBuffer(name, pitch=1.0, gain=1.0, delay=0){
  const c=ensure(); if(!c) return;
  const list=gemBuffers[name]; if(!list||!list.length) return;
  const buf=list[0];
  const t=c.currentTime+delay;
  const src=c.createBufferSource();
  src.buffer=buf;
  src.playbackRate.setValueAtTime(pitch * (0.98 + Math.random()*0.04), t);
  const g=c.createGain();
  g.gain.setValueAtTime(gain, t);
  src.connect(g); g.connect(sfxBus);
  src.start(t);
 }

 /* --- TILE TAP & MOVEMENT PLAYERS --- */
 function playTap(pitch=1.0, gain=0.45, delay=0){
  const style = customAudioMap.tileTap || 'tile';
  playBuffer(style, pitch, gain, delay);
 }

 function select(){
  haptic(4);
  playTap(1.05, 0.44);
 }

 function slide(willMatch=false){
  haptic(willMatch ? [6,14,12] : 5);
  playTap(1.0, 0.45);
  if(willMatch){
   playBuffer('sparkle', 1.25, 0.25, 0.035);
  }
 }

 function contact(pair=0){
  haptic([10,18]);
  const pitchMult = 0.98 + (pair % 5) * 0.03;
  playTap(pitchMult, 0.44);
  playTap(pitchMult * 1.12, 0.35, 0.025);
 }

 function invalid(){
  // User explicitly requested: NO sound for invalid moves; free navigation
  haptic(4);
 }

 function hint(){
  // User explicitly requested: NO sound for hints
  haptic(6);
 }

 /* --- 10 FUSION SYNTHESIS ENGINES --- */
 function fusion(pair=0, combo=1){
  haptic([14,28,22,38]);
  const c = ensure(); if(!c) return;
  const pitchMult = Math.pow(1.04, Math.min(4, Math.max(0, combo-1)));
  const style = customAudioMap.fusion || 'pop';
  playFusionStyle(c, style, pitchMult);
 }

 function playFusionStyle(c, style, pitchMult=1.0){
  if(style === 'pop'){
   // 1. J-Pop Celesta Cascade
   const scale=[1046.50, 1318.51, 1567.98, 1975.53, 2349.32, 3135.96];
   scale.forEach((f, i)=>{
    const t = c.currentTime + 0.04 + i * 0.08;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.038 + i*0.004, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.18);
   });
   playBuffer('match', 1.15 * pitchMult, 0.50, 0.60);
   playBuffer('sparkle', 1.35 * pitchMult, 0.32, 0.64);
  }else if(style === 'zen'){
   // 2. Zen Lithophone Bloom
   playTap(1.0 * pitchMult, 0.45, 0.02);
   const chord = [196.00, 293.66, 392.00, 493.88, 587.33];
   chord.forEach((f, i)=>{
    const t = c.currentTime + 0.12 + i * 0.04;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = 'sine'; o2.frequency.setValueAtTime(f * 1.46 * pitchMult, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(0.018, t + 0.012);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.68);
    o2.connect(g2); g2.connect(sfxBus); o2.start(t); o2.stop(t + 0.45);
   });
  }else if(style === 'sparkle'){
   // 3. Starlight Shimmer
   const scale = [1318.51, 1567.98, 1975.53, 2349.32, 2637.02, 3135.96, 3951.07];
   scale.forEach((f, i)=>{
    const t = c.currentTime + 0.03 + i * 0.05;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.24);
   });
   playBuffer('sparkle', 1.4 * pitchMult, 0.45, 0.38);
  }else if(style === 'taiko'){
   // 4. Taiko & Temple Bell
   const bellFreqs = [196.00, 480.00, 1020.00];
   bellFreqs.forEach((f, i)=>{
    const t = c.currentTime + 0.02;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(i === 0 ? 0.08 : 0.03, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (i === 0 ? 0.9 : 0.45));
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.95);
   });
   playBuffer('wood', 1.0 * pitchMult, 0.60, 0.05);
  }else if(style === 'koto'){
   // 5. Traditional Japanese Koto Insen scale
   const kotoNotes = [293.66, 311.13, 392.00, 440.00, 523.25, 587.33];
   kotoNotes.forEach((f, i)=>{
    const t = c.currentTime + 0.04 + i * 0.065;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f * pitchMult, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.35);
   });
  }else if(style === 'thunder'){
   // 6. Thunder Sparks
   const zaps = [880, 1320, 1760, 2640];
   zaps.forEach((f, i)=>{
    const t = c.currentTime + i * 0.04;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f * pitchMult, t);
    o.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.16);
   });
  }else if(style === 'water'){
   // 7. Ocean Ripple
   const drops = [440, 554.37, 659.25, 880, 1108.73];
   drops.forEach((f, i)=>{
    const t = c.currentTime + 0.03 + i * 0.06;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f * 0.85 * pitchMult, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.15 * pitchMult, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.25);
   });
  }else if(style === 'arcade'){
   // 8. Retro 8-Bit Powerup
   const arp = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
   arp.forEach((f, i)=>{
    const t = c.currentTime + i * 0.045;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(f * pitchMult, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.032, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.14);
   });
  }else if(style === 'strings'){
   // 9. Strings Blossom
   const chord = [261.63, 392.00, 523.25, 659.25, 783.99];
   chord.forEach(f=>{
    const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f * pitchMult, t);
    const flt = c.createBiquadFilter(); flt.type = 'lowpass';
    flt.frequency.setValueAtTime(1200, t);
    flt.frequency.linearRampToValueAtTime(3200, t + 0.25);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.024, t + 0.10);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    o.connect(flt); flt.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.70);
   });
  }else if(style === 'cosmic'){
   // 10. Cosmic Portal
   const t = c.currentTime;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(220 * pitchMult, t);
   o.frequency.exponentialRampToValueAtTime(1760 * pitchMult, t + 0.55);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.065, t + 0.15);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.70);
   playBuffer('sparkle', 1.5 * pitchMult, 0.40, 0.45);
  }
 }

 /* --- 10 WIN FANFARE ENGINES --- */
 function win(){
  haptic([20,30,25,35,30,45]);
  const c = ensure(); if(!c) return;
  const style = customAudioMap.win || 'pop';
  playWinStyle(c, style);
 }

 function playWinStyle(c, style){
  if(style === 'pop'){
   // 1. J-Pop Joyful Fanfare
   const triad=[523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
   triad.forEach((f, i)=>{
    const t = c.currentTime + i * 0.085;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.52);
   });
   playBuffer('sparkle', 1.2, 0.45, 0.45);
  }else if(style === 'zen'){
   // 2. Grand Marimba Resolution
   const pentatonic=[261.63, 392.00, 523.25, 587.33, 659.25, 783.99, 1046.50];
   pentatonic.forEach((f, i)=>{
    const t = c.currentTime + i * 0.09;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.60);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.64);
   });
  }else if(style === 'crystal'){
   // 3. Celestial Angel Chime
   const scale=[1046.50, 1318.51, 1567.98, 2093.00, 2637.02, 3135.96];
   scale.forEach((f, i)=>{
    const t = c.currentTime + i * 0.08;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.060, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.58);
   });
   playBuffer('sparkle', 1.3, 0.45, 0.45);
  }else if(style === 'matsuri'){
   // 4. Matsuri Festival Taiko
   [0, 0.12, 0.24, 0.36, 0.48, 0.60].forEach((dt, i)=>{
    const t = c.currentTime + dt;
    playBuffer('wood', i === 5 ? 0.85 : 1.15, 0.65, dt);
   });
   playBuffer('metal', 1.0, 0.50, 0.62);
  }else if(style === 'sakura'){
   // 5. Sakura Serenade
   const notes = [440, 493.88, 587.33, 659.25, 783.99, 880];
   notes.forEach((f, i)=>{
    const t = c.currentTime + i * 0.09;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.48);
   });
  }else if(style === 'arcade'){
   // 6. Arcade Stage Clear
   const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
   const times = [0, 0.10, 0.20, 0.32, 0.44, 0.60];
   notes.forEach((f, i)=>{
    const t = c.currentTime + times[i];
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.040, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (i === 5 ? 0.45 : 0.08));
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + (i === 5 ? 0.50 : 0.09));
   });
  }else if(style === 'brass'){
   // 7. Royal Victory Brass
   const fanfare = [392.00, 523.25, 659.25, 783.99, 1046.50];
   fanfare.forEach((f, i)=>{
    const t = c.currentTime + i * 0.11;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t);
    const flt = c.createBiquadFilter(); flt.frequency.setValueAtTime(1400, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.40);
    o.connect(flt); flt.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.44);
   });
  }else if(style === 'cathedral'){
   // 8. Chime Cathedral
   const chimes = [523.25, 659.25, 783.99, 1046.50];
   chimes.forEach((f, i)=>{
    const t = c.currentTime + i * 0.14;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t);
    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = 'sine'; o2.frequency.setValueAtTime(f * 2.76, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.065, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(0.025, t + 0.006);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.50);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.90);
    o2.connect(g2); g2.connect(sfxBus); o2.start(t); o2.stop(t + 0.55);
   });
  }else if(style === 'cosmic'){
   // 9. Cosmic Supernova
   const t = c.currentTime;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(110, t);
   o.frequency.exponentialRampToValueAtTime(880, t + 0.5);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.08, t + 0.1);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.80);
   playBuffer('sparkle', 1.4, 0.45, 0.40);
  }else if(style === 'circus'){
   // 10. Circus Celebration
   const bounce = [659.25, 783.99, 880, 1046.50, 880, 1046.50, 1318.51];
   bounce.forEach((f, i)=>{
    const t = c.currentTime + i * 0.07;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + 0.18);
   });
  }
 }

 /* --- 10 BACKGROUND MUSIC BGM ENGINES --- */
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
  659.25, 0, 783.99, 880.00,  0, 1046.5, 0, 880.00,
  783.99, 0, 659.25, 587.33,  0, 783.99, 0, 0,
  587.33, 0, 659.25, 783.99,  0, 987.77, 0, 783.99,
  659.25, 0, 523.25, 587.33,  0, 659.25, 0, 0,
  587.33, 0, 659.25, 880.00,  0, 1046.5, 0, 1174.66,
  1318.51, 0, 1174.66, 1046.5, 0, 987.77, 0, 880.00,
  1046.5, 0, 783.99, 659.25,  0, 523.25, 659.25, 783.99,
  880.00, 0, 987.77, 1046.5,  0, 1174.66, 0, 0
 ];

 function playPopRhythm(c, t, subStep, chord, mel){
  if(subStep === 0 || subStep === 4){
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(115, t);
   o.frequency.exponentialRampToValueAtTime(42, t + 0.08);
   g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.065, t + 0.003);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
   o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.12);
  }
  if(subStep === 2 || subStep === 6){
   [0, 0.012].forEach(flam => {
    const ft = t + flam;
    const rate = c.sampleRate, len = Math.floor(rate * 0.04), buf = c.createBuffer(1, len, rate), d = buf.getChannelData(0);
    for(let i=0; i<len; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (rate * 0.015));
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.frequency.setValueAtTime(1600, ft);
    const g = c.createGain(); g.gain.setValueAtTime(0.024, ft);
    src.connect(flt); flt.connect(g); g.connect(bgmBus);
    src.start(ft);
   });
  }
  if(subStep === 0 || subStep === 3 || subStep === 5){
   const fb = subStep === 0 ? chord.bass : (subStep === 3 ? chord.bass * 1.5 : chord.bass * 2.0);
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(fb, t);
   g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.048, t + 0.004);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
   o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.16);
  }
  if(subStep === 1 || subStep === 4){
   chord.notes.forEach((f, i)=>{
    const ct = t + i * 0.004;
    const car = c.createOscillator(), mod = c.createOscillator();
    const modG = c.createGain(), carG = c.createGain();
    car.type = 'sine'; car.frequency.setValueAtTime(f, ct);
    mod.type = 'sine'; mod.frequency.setValueAtTime(f * 2, ct);
    modG.gain.setValueAtTime(f * 0.45, ct); modG.gain.exponentialRampToValueAtTime(0.01, ct + 0.15);
    carG.gain.setValueAtTime(0.0001, ct); carG.gain.linearRampToValueAtTime(0.022, ct + 0.006);
    carG.gain.exponentialRampToValueAtTime(0.0001, ct + 0.18);
    mod.connect(modG); modG.connect(car.frequency);
    car.connect(carG); carG.connect(bgmBus);
    car.start(ct); car.stop(ct + 0.20); mod.start(ct); mod.stop(ct + 0.20);
   });
  }
  if(mel && mel > 0){
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(mel, t);
   g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.028, t + 0.008);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
   o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.24);
  }
 }

 function playStepForStyle(c, style, t, subStep, chord, mel){
  if(style === 'pop'){
   playPopRhythm(c, t, subStep, chord, mel);
  }else if(style === 'zen'){
   if(subStep === 0 || subStep === 4){
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(95, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.16);
   }
   if(subStep === 1 || subStep === 4){
    chord.notes.forEach((f, i)=>{
     const o = c.createOscillator(), g = c.createGain();
     o.type = 'sine'; o.frequency.setValueAtTime(f, t + i*0.006);
     g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + 0.008);
     g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
     o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.24);
    });
   }
   if(mel && mel > 0){
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(mel, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.040, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.30);
    o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.32);
   }
  }else if(style === 'lofi'){
   if(subStep === 0 || subStep === 5){
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(75, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.20);
    o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.22);
   }
   if(subStep === 2 || subStep === 6){
    const rate = c.sampleRate, len = Math.floor(rate * 0.03), buf = c.createBuffer(1, len, rate), d = buf.getChannelData(0);
    for(let i=0; i<len; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (rate * 0.01));
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.frequency.setValueAtTime(900, t);
    const g = c.createGain(); g.gain.setValueAtTime(0.02, t);
    src.connect(flt); flt.connect(g); g.connect(bgmBus); src.start(t);
   }
   if(subStep === 1 || subStep === 3){
    chord.notes.forEach((f, i)=>{
     const o = c.createOscillator(), g = c.createGain();
     o.type = 'sine'; o.frequency.setValueAtTime(f * 0.99, t + i*0.008);
     g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.01);
     g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
     o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.28);
    });
   }
  }else if(style === 'koto'){
   if(subStep === 0 || subStep === 3 || subStep === 6){
    const kotoF = chord.notes[subStep % chord.notes.length];
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(kotoF, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.055, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.38);
   }
  }else if(style === 'citypop'){
   if(subStep === 0 || subStep === 2 || subStep === 4 || subStep === 6){
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(chord.bass * (subStep === 4 ? 2 : 1), t);
    const flt = c.createBiquadFilter(); flt.frequency.setValueAtTime(600, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.032, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(flt); flt.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.14);
   }
   if(subStep === 2 || subStep === 6){
    const rate = c.sampleRate, len = Math.floor(rate * 0.04), buf = c.createBuffer(1, len, rate), d = buf.getChannelData(0);
    for(let i=0; i<len; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (rate * 0.012));
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.setValueAtTime(0.03, t);
    src.connect(g); g.connect(bgmBus); src.start(t);
   }
  }else if(style === 'chiptune'){
   if(subStep % 2 === 0){
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(chord.notes[subStep % 4], t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.10);
   }
  }else if(style === 'ocean'){
   if(subStep === 0){
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(chord.notes[0], t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.80);
   }
  }else if(style === 'synthwave'){
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sawtooth'; o.frequency.setValueAtTime(chord.bass * (subStep % 2 === 0 ? 1 : 1.5), t);
   const flt = c.createBiquadFilter(); flt.frequency.setValueAtTime(450 + subStep * 40, t);
   g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t + 0.004);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
   o.connect(flt); flt.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.13);
  }else if(style === 'piano'){
   if(subStep === 0 || subStep === 3){
    chord.notes.forEach((f, i)=>{
     const o = c.createOscillator(), g = c.createGain();
     o.type = 'triangle'; o.frequency.setValueAtTime(f, t + i * 0.01);
     g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + 0.008);
     g.gain.exponentialRampToValueAtTime(0.0001, t + 0.40);
     o.connect(g); g.connect(bgmBus); o.start(t); o.stop(t + 0.45);
    });
   }
  }
 }

 function scheduleBgm(){
  clearTimeout(bgmTimer);
  const curBgm = customAudioMap.bgm || 'pop';
  if(!enabled || !bgmActive || document.hidden || curBgm === 'none') return;
  const c = ensure(); if(!c) return;

  const stepDur = curBgm === 'lofi' ? 0.178 : (curBgm === 'koto' ? 0.142 : (curBgm === 'chiptune' ? 0.115 : 0.119));
  const batchSteps = 4;

  for(let s=0; s<batchSteps; s++){
   const step = (bgmStep + s) % 64;
   const barIdx = Math.floor(step / 8) % chords.length;
   const subStep = step % 8;
   const t = c.currentTime + s * stepDur;
   const chord = chords[barIdx];
   const mel = leadMelody[step];

   playStepForStyle(c, curBgm, t, subStep, chord, mel);
  }

  bgmStep = (bgmStep + batchSteps) % 64;
  bgmTimer = setTimeout(scheduleBgm, batchSteps * stepDur * 1000 - 25);
 }

 function preview(fnKey, optKey){
  const c = ensure(); if(!c) return;
  if(c.state === 'suspended') c.resume();

  if(fnKey === 'tileTap'){
   playBuffer(optKey, 1.0, 0.50);
  }else if(fnKey === 'fusion'){
   playFusionStyle(c, optKey, 1.0);
  }else if(fnKey === 'win'){
   playWinStyle(c, optKey);
  }else if(fnKey === 'bgm'){
   if(optKey === 'none'){
    playBuffer('soft', 0.9, 0.3);
    return;
   }
   const stepDur = optKey === 'lofi' ? 0.178 : (optKey === 'koto' ? 0.142 : 0.119);
   for(let s=0; s<16; s++){
    const barIdx = Math.floor(s / 8) % chords.length;
    const subStep = s % 8;
    const t = c.currentTime + s * stepDur;
    const chord = chords[barIdx];
    const mel = leadMelody[s];
    playStepForStyle(c, optKey, t, subStep, chord, mel);
   }
  }else if(fnKey === 'voice'){
   speak('休む（やすむ）');
  }
 }

 function setEnabled(on){
  enabled = !!on;
  if(!enabled){
   clearTimeout(bgmTimer);
   if(ctx && ctx.state === 'running'){
    try{ ctx.suspend(); }catch{}
   }
  }else{
   const c = ensure();
   if(c && c.state === 'suspended'){
    c.resume().then(()=>{
     if(bgmActive && (customAudioMap.bgm !== 'none')) scheduleBgm();
    }).catch(()=>{});
   }else if(bgmActive && (customAudioMap.bgm !== 'none')){
    scheduleBgm();
   }
  }
 }

 function setBgm(on){
  bgmActive = !!on;
  if(bgmActive && enabled && (customAudioMap.bgm !== 'none')){
   scheduleBgm();
  }else{
   clearTimeout(bgmTimer);
  }
 }

 function setBgmStyle(style){
  customAudioMap.bgm = style;
  saveAudioMap(customAudioMap);
  clearTimeout(bgmTimer);
  bgmStep = 0;
  if(bgmActive && enabled && style !== 'none'){
   scheduleBgm();
  }
 }

 function getBgmStyle(){ return customAudioMap.bgm || 'pop'; }

 function setSoundProfile(name){
  customAudioMap.tileTap = name;
  saveAudioMap(customAudioMap);
  select();
 }

 function getSoundProfile(){ return customAudioMap.tileTap || 'tile'; }

 function getAudioMap(){
  return Object.assign({}, customAudioMap);
 }

 function setAudioMap(newMap){
  if(!newMap || typeof newMap !== 'object') return;
  customAudioMap = Object.assign({}, defaultAudioMap, customAudioMap, newMap);
  saveAudioMap(customAudioMap);
  if(customAudioMap.bgm){
   clearTimeout(bgmTimer);
   bgmStep = 0;
   if(bgmActive && enabled && customAudioMap.bgm !== 'none') scheduleBgm();
  }
 }

 function saveAudioMap(map){
  try{
   localStorage.setItem('kp-custom-audio-map', JSON.stringify(map));
   if(map.bgm) localStorage.setItem('kp-bgm-style', map.bgm);
   if(map.tileTap) localStorage.setItem('kanji-pop-sound-profile', map.tileTap);
   if(map.voice) localStorage.setItem('kp-voice-enabled', map.voice === 'on' ? 'true' : 'false');
  }catch{}
 }

 function getPresets(){
  return JSON.parse(JSON.stringify(audioPresets));
 }

 function applyPreset(presetKey){
  if(audioPresets[presetKey]){
   setAudioMap(audioPresets[presetKey].map);
   return true;
  }
  return false;
 }

 function setVoiceEnabled(on){
  customAudioMap.voice = on ? 'on' : 'off';
  saveAudioMap(customAudioMap);
 }

 function isVoiceEnabled(){
  return customAudioMap.voice !== 'off';
 }

 function speak(text){
  if(!isVoiceEnabled() || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try{
   window.speechSynthesis.cancel();
   const utt = new SpeechSynthesisUtterance(text);
   utt.lang = 'ja-JP';
   utt.rate = 0.88;
   utt.pitch = 1.02;
   const voices = window.speechSynthesis.getVoices();
   const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
   if(jaVoice) utt.voice = jaVoice;
   window.speechSynthesis.speak(utt);
  }catch{}
 }

 if(typeof document !== 'undefined'){
  document.addEventListener('visibilitychange', ()=>{
   if(document.hidden){
    clearTimeout(bgmTimer);
   }else if(enabled && bgmActive && (customAudioMap.bgm !== 'none')){
    scheduleBgm();
   }
  });
 }

 window.KanjiAudio = {
  setEnabled,
  setBgm,
  setBgmStyle,
  getBgmStyle,
  select,
  invalid,
  slide,
  contact,
  fusion,
  win,
  hint,
  haptic,
  setSoundProfile,
  getSoundProfile,
  getAudioMap,
  setAudioMap,
  getPresets,
  applyPreset,
  preview,
  speak,
  setVoiceEnabled,
  isVoiceEnabled
 };
})();
