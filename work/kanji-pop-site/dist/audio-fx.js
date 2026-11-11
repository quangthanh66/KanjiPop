/* Studio-grade Granular Audio Engine & Audition Studio for Kanji Pop.
   Physical modeling of Sparkling Gemstones, Acoustic Slate Stones, Wood Blocks & Bells.
   Granular per-action sound configuration with interactive real-time audition previews.
   Full TTS Japanese Speech Synthesis integration. */
(()=>{
 'use strict';
 let ctx=null,master=null,sfxBus=null,bgmBus=null,bgmTimer=0,enabled=false,bgmActive=false,bgmStep=0;
 const gemBuffers={};

 const defaultAudioMap = {
  select: 'gem',
  slide: 'gem',
  contact: 'gem',
  fusion: 'pop',
  invalid: 'gem',
  hint: 'sparkle',
  win: 'pop',
  bgm: 'pop',
  voice: 'on'
 };

 const audioPresets = {
  popGem: {
   id: 'popGem',
   name: '💎 Pop & Đá quý (Bản gốc)',
   desc: 'Âm thanh đá quý trong trẻo kết hợp giai điệu J-Pop 126 BPM sôi động.',
   map: { select: 'gem', slide: 'gem', contact: 'gem', fusion: 'pop', invalid: 'gem', hint: 'sparkle', win: 'pop', bgm: 'pop', voice: 'on' }
  },
  zenStone: {
   id: 'zenStone',
   name: '🍃 Cổ phong (Zen & Đá mộc)',
   desc: 'Tiếng phiến đá mộc êm dịu, đàn đá Lithophone và mộc cầm thanh tịnh 118 BPM.',
   map: { select: 'tile', slide: 'tile', contact: 'stone', fusion: 'zen', invalid: 'stone', hint: 'stone', win: 'zen', bgm: 'zen', voice: 'on' }
  },
  crystalFantasy: {
   id: 'crystalFantasy',
   name: '✨ Pha lê huyền ảo',
   desc: 'Chuỗi âm thanh pha lê ngân nga thanh khiết và pháo hoa ánh sao.',
   map: { select: 'crystal', slide: 'crystal', contact: 'crystal', fusion: 'sparkle', invalid: 'gem', hint: 'sparkle', win: 'crystal', bgm: 'pop', voice: 'on' }
  },
  traditionalGo: {
   id: 'traditionalGo',
   name: '⚫ Cờ vây & Chuông đền',
   desc: 'Quân cờ vây lách cách đanh gọn, mộc bản và chuông đồng trang nhã.',
   map: { select: 'stone', slide: 'stone', contact: 'stone', fusion: 'taiko', invalid: 'stone', hint: 'bell', win: 'zen', bgm: 'zen', voice: 'on' }
  }
 };

 let customAudioMap = (()=>{
  try{
   const saved = localStorage.getItem('kp-custom-audio-map');
   if(saved) return Object.assign({}, defaultAudioMap, JSON.parse(saved));
  }catch{}
  // Fallback to legacy single-keys if previously saved
  let b = 'pop', p = 'gem', v = true;
  try{ b = localStorage.getItem('kp-bgm-style') || 'pop'; }catch{}
  try{ p = localStorage.getItem('kanji-pop-sound-profile') || 'gem'; }catch{}
  try{ v = localStorage.getItem('kp-voice-enabled') !== 'false'; }catch{}
  return {
   select: ['gem','tile','crystal','stone','soft','wood'].includes(p)?p:'gem',
   slide: ['gem','tile','crystal','stone','soft','wood'].includes(p)?p:'gem',
   contact: p === 'tile' || p === 'stone' ? 'stone' : (p === 'crystal' ? 'crystal' : 'gem'),
   fusion: b === 'zen' ? 'zen' : 'pop',
   invalid: p === 'tile' || p === 'stone' ? 'stone' : 'gem',
   hint: p === 'tile' || p === 'stone' ? 'stone' : 'sparkle',
   win: b === 'zen' ? 'zen' : 'pop',
   bgm: b,
   voice: v ? 'on' : 'off'
  };
 })();

 /* --- PHYSICAL MODELING SYNTHESIS GENERATORS --- */

 // 1. Sparkling Modal Crystal / Gemstone
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

 // 2. Acoustic Slate Stone Physics (Mahjong / Go stone / Slate Tile)
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

 function renderAcousticStoneDouble(c, f0, dur){
  return renderAcousticStone(c, f0, dur, true, 1.15);
 }

 // 3. Stone Lithophone Chime
 function renderStoneChime(c, f0, dur){
  const sr=c.sampleRate, len=Math.floor(sr*dur), buf=c.createBuffer(2, len, sr);
  const left=buf.getChannelData(0), right=buf.getChannelData(1);
  const modes=[
   {r:1.00, a:1.00, d:7.5},
   {r:1.46, a:0.55, d:14.0},
   {r:2.72, a:0.25, d:32.0},
   {r:4.25, a:0.10, d:65.0}
  ];
  for(let i=0; i<len; i++){
   const t=i/sr;
   let s=0;
   for(let m=0; m<modes.length; m++){
    const md=modes[m];
    s += md.a * Math.sin(2*Math.PI * f0 * md.r * t) * Math.exp(-md.d * t);
   }
   const impact = (Math.random()*2 - 1) * Math.exp(-350.0 * t) * 0.18;
   const env = Math.min(1.0, t/0.002);
   const val = (s * 0.75 + impact) * env * 0.45;
   left[i] = val; right[i] = val;
  }
  return buf;
 }

 // 4. Organic Resonant Wood Block / Marimba Mallet
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

 // 5. Brass Temple Bell / Tiny Chime
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

 function buildGemLibrary(c){
  gemBuffers.gem = [renderCrystalSample(c, 1760.00, 0.22, 0.85, false)];
  gemBuffers.crystal = [renderCrystalSample(c, 2489.02, 0.18, 1.1, false)];
  gemBuffers.tile = [renderAcousticStone(c, 520, 0.09, true)];
  gemBuffers.stone = [renderAcousticStone(c, 540, 0.08, true, 1.4)];
  gemBuffers.soft = [renderAcousticStone(c, 440, 0.10, true, 0.8)];
  gemBuffers.wood = [renderWoodBlock(c, 480, 0.09)];
  gemBuffers.bell = [renderBrassBell(c, 1864.66, 0.38)];
  gemBuffers.select = [renderCrystalSample(c, 1760.00, 0.16, 0.9, false)];
  gemBuffers.slide = [renderCrystalSample(c, 1600.00, 0.20, 0.8, false)];
  gemBuffers.match = [renderAcousticStone(c, 480, 0.11, false)];
  gemBuffers.contact = [renderCrystalSample(c, 1567.98, 0.36, 1.1, true), renderAcousticStoneDouble(c, 510, 0.13)];
  gemBuffers.invalid = [renderAcousticStone(c, 290, 0.08, true, 1.6)];
  gemBuffers.hint = [renderCrystalSample(c, 2400.00, 0.22, 0.9, true), renderStoneChime(c, 520, 0.35)];
  gemBuffers.sparkle = [renderCrystalSample(c, 2093.00, 0.20, 0.8, false)];

  // Fallback Foley enhancement
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

 function playGem(name, pitch=1.0, gain=1.0, delay=0){
  const c=ensure();if(!c)return;
  const list=gemBuffers[name];if(!list||!list.length)return;
  const buf=list.length > 1 ? list[1 + Math.floor(Math.random()*(list.length - 1))] : list[0];
  const t=c.currentTime+delay;
  const src=c.createBufferSource();
  src.buffer=buf;
  src.playbackRate.setValueAtTime(pitch * (0.98 + Math.random()*0.04), t);
  const g=c.createGain();
  g.gain.setValueAtTime(gain, t);
  src.connect(g); g.connect(sfxBus);
  src.start(t);
 }

 /* --- REAL-TIME GRANULAR PREVIEW ENGINE --- */
 function preview(fnKey, optKey){
  const c = ensure(); if(!c) return;
  if(c.state === 'suspended') c.resume();

  if(fnKey === 'select'){
   if(optKey === 'gem') playGem('gem', 1.15, 0.44);
   else if(optKey === 'tile') playGem('tile', 1.0, 0.48);
   else if(optKey === 'crystal') playGem('crystal', 1.22, 0.42);
   else if(optKey === 'stone') playGem('stone', 1.08, 0.45);
   else if(optKey === 'soft') playGem('soft', 1.0, 0.44);
   else if(optKey === 'wood') playGem('wood', 1.0, 0.48);
  }else if(fnKey === 'slide'){
   if(optKey === 'gem') playGem('gem', 1.0, 0.44);
   else if(optKey === 'tile') playGem('tile', 1.0, 0.46);
   else if(optKey === 'crystal') playGem('crystal', 1.0, 0.42);
   else if(optKey === 'stone') playGem('stone', 1.0, 0.44);
   else if(optKey === 'soft') playGem('soft', 1.0, 0.42);
   else if(optKey === 'wood') playGem('wood', 1.0, 0.46);
  }else if(fnKey === 'contact'){
   if(optKey === 'gem'){ playGem('contact', 1.0, 0.42); playGem('sparkle', 1.25, 0.28, 0.02); }
   else if(optKey === 'stone') playGem('contact', 1.0, 0.46);
   else if(optKey === 'crystal'){ playGem('crystal', 1.12, 0.44); playGem('sparkle', 1.3, 0.28, 0.02); }
   else if(optKey === 'soft') playGem('soft', 1.0, 0.42);
  }else if(fnKey === 'fusion'){
   if(optKey === 'pop') playFusionPop(c, 1.0);
   else if(optKey === 'zen') playFusionZen(c, 1.0);
   else if(optKey === 'sparkle') playFusionSparkle(c, 1.0);
   else if(optKey === 'taiko') playFusionTaiko(c, 1.0);
  }else if(fnKey === 'invalid'){
   if(optKey === 'gem') playGem('gem', 0.80, 0.35);
   else if(optKey === 'stone') playGem('invalid', 0.72, 0.38);
   else if(optKey === 'soft') playGem('soft', 0.75, 0.35);
  }else if(fnKey === 'hint'){
   if(optKey === 'sparkle'){ playGem('hint', 1.0, 0.46); playGem('sparkle', 1.15, 0.32, 0.05); }
   else if(optKey === 'stone'){ playGem('stone', 1.1, 0.42); playGem('contact', 1.2, 0.30, 0.05); }
   else if(optKey === 'bell') playGem('bell', 1.0, 0.48);
  }else if(fnKey === 'win'){
   if(optKey === 'pop') playWinPop(c);
   else if(optKey === 'zen') playWinZen(c);
   else if(optKey === 'crystal') playWinCrystal(c);
  }else if(fnKey === 'bgm'){
   previewBgmRiff(optKey);
  }else if(fnKey === 'voice'){
   speak('休む（やすむ）');
  }
 }

 /* --- GAMEPLAY HOOKS (READING FROM customAudioMap) --- */
 function select(){
  haptic(4);
  const style = customAudioMap.select || 'gem';
  preview('select', style);
 }

 function invalid(){
  haptic([6,16,6]);
  const style = customAudioMap.invalid || 'gem';
  preview('invalid', style);
 }

 function slide(willMatch=false){
  haptic(willMatch?[6,14,12]:5);
  const style = customAudioMap.slide || 'gem';
  if(willMatch){
   preview('slide', style);
   playGem('sparkle', 1.25, 0.25, 0.035);
  }else{
   preview('slide', style);
  }
 }

 function contact(pair=0){
  haptic([12,20,18]);
  const style = customAudioMap.contact || 'gem';
  preview('contact', style);
 }

 function fusion(pair=0, combo=1){
  haptic([14,28,22,38]);
  const c = ensure(); if(!c) return;
  const pitchMult = Math.pow(1.04, Math.min(4, Math.max(0, combo-1)));
  const style = customAudioMap.fusion || 'pop';

  if(style === 'pop') playFusionPop(c, pitchMult);
  else if(style === 'zen') playFusionZen(c, pitchMult);
  else if(style === 'sparkle') playFusionSparkle(c, pitchMult);
  else if(style === 'taiko') playFusionTaiko(c, pitchMult);
 }

 function playFusionPop(c, pitchMult=1.0){
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
  playGem('match', 1.15 * pitchMult, 0.50, 0.70);
  playGem('contact', 1.20 * pitchMult, 0.35, 0.72);
  playGem('sparkle', 1.35 * pitchMult, 0.28, 0.74);
 }

 function playFusionZen(c, pitchMult=1.0){
  playGem('contact', 1.0 * pitchMult, 0.45, 0.02);
  playGem('match', 1.08 * pitchMult, 0.50, 0.08);
  const stoneChord = [196.00, 293.66, 392.00, 493.88, 587.33];
  stoneChord.forEach((f, i)=>{
   const t = c.currentTime + 0.16 + i * 0.04;
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
  playGem('match', 1.0 * pitchMult, 0.60, 0.42);
 }

 function playFusionSparkle(c, pitchMult=1.0){
  const scale = [1318.51, 1567.98, 1975.53, 2349.32, 2637.02, 3135.96, 3951.07];
  scale.forEach((f, i)=>{
   const t = c.currentTime + 0.03 + i * 0.055;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f * pitchMult, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.045, t + 0.003);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.24);
  });
  playGem('sparkle', 1.4 * pitchMult, 0.45, 0.42);
  playGem('crystal', 1.2 * pitchMult, 0.35, 0.44);
 }

 function playFusionTaiko(c, pitchMult=1.0){
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
  playGem('wood', 1.0 * pitchMult, 0.55, 0.05);
  playGem('stone', 1.1 * pitchMult, 0.48, 0.08);
 }

 function win(){
  haptic([20,30,25,35,30,45]);
  const style = customAudioMap.win || 'pop';
  preview('win', style);
 }

 function playWinPop(c){
  const triad=[523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
  triad.forEach((f, i)=>{
   const t = c.currentTime + i * 0.09;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.065, t + 0.006);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.52);
  });
  playGem('match', 1.0, 0.60, 0.40);
  playGem('sparkle', 1.2, 0.40, 0.45);
 }

 function playWinZen(c){
  const pentatonic=[261.63, 392.00, 523.25, 587.33, 659.25, 783.99, 1046.50];
  pentatonic.forEach((f, i)=>{
   const t = c.currentTime + i * 0.10;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(0.055, t + 0.008);
   g.gain.exponentialRampToValueAtTime(0.0001, t + 0.60);
   o.connect(g); g.connect(sfxBus);
   o.start(t); o.stop(t + 0.64);
  });
  playGem('stone', 1.0, 0.55, 0.35);
  playGem('bell', 1.0, 0.45, 0.42);
 }

 function playWinCrystal(c){
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
  playGem('crystal', 1.0, 0.60, 0.40);
  playGem('sparkle', 1.3, 0.45, 0.45);
 }

 function hint(){
  haptic(8);
  const style = customAudioMap.hint || 'sparkle';
  preview('hint', style);
 }

 /* --- BGM COMPOSITION & ENGINES --- */
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

 /* POP SYNTHESIS (126 BPM) */
 function playFmChord(c, notes, time, dur=0.18, vol=0.024){
  notes.forEach((f, i)=>{
   const t = time + i * 0.004;
   const car = c.createOscillator(), mod = c.createOscillator();
   const modGain = c.createGain(), carGain = c.createGain();
   car.type = 'sine'; car.frequency.setValueAtTime(f, t);
   mod.type = 'sine'; mod.frequency.setValueAtTime(f * 2.0, t);
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

 function playPopBass(c, freq, time, dur=0.14){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.85, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.048, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.02);
 }

 function playPopClap(c, time){
  const t = time;
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

 /* ZEN SYNTHESIS (118 BPM) */
 function playStoneMarimbaChord(c, notes, time, dur=0.22, vol=0.065){
  notes.forEach((f, i)=>{
   const t = time + i * 0.006;
   const o = c.createOscillator(), g = c.createGain();
   o.type = 'sine'; o.frequency.setValueAtTime(f, t);
   const o2 = c.createOscillator(), g2 = c.createGain();
   o2.type = 'sine'; o2.frequency.setValueAtTime(f * 1.48, t);
   g.gain.setValueAtTime(0.0001, t);
   g.gain.linearRampToValueAtTime(vol, t + 0.008);
   g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
   g2.gain.setValueAtTime(0.0001, t);
   g2.gain.linearRampToValueAtTime(vol * 0.28, t + 0.008);
   g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.65);
   o.connect(g); g.connect(bgmBus);
   o2.connect(g2); g2.connect(bgmBus);
   o.start(t); o.stop(t + dur + 0.02);
   o2.start(t); o2.stop(t + dur + 0.02);
  });
 }

 function playAcousticBass(c, freq, time, dur=0.20){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.92, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.02);
 }

 function playStoneClickPercussion(c, time){
  const t = time;
  const rate = c.sampleRate, len = Math.floor(rate * 0.04), buf = c.createBuffer(1, len, rate), d = buf.getChannelData(0);
  for(let i=0; i<len; i++) d[i] = (Math.random()*2 - 1) * Math.exp(-i / (rate * 0.006));
  const src = c.createBufferSource(); src.buffer = buf;
  const flt = c.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.setValueAtTime(1450, t); flt.Q.value = 3.2;
  const g = c.createGain(); g.gain.setValueAtTime(0.045, t);
  src.connect(flt); flt.connect(g); g.connect(bgmBus);
  src.start(t);
 }

 function playStoneMalletThump(c, time){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(95, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.11, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.connect(g); g.connect(bgmBus);
  o.start(t); o.stop(t + 0.16);
 }

 function playStoneKalimbaLead(c, freq, time, dur=0.32){
  const t = time;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
  const o2 = c.createOscillator(), g2 = c.createGain();
  o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 2.76, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.055, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.linearRampToValueAtTime(0.016, t + 0.004);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g); g.connect(bgmBus);
  o2.connect(g2); g2.connect(bgmBus);
  o.start(t); o.stop(t + dur + 0.02);
  o2.start(t); o2.stop(t + dur + 0.02);
 }

 function previewBgmRiff(style){
  const c = ensure(); if(!c) return;
  if(c.state === 'suspended') c.resume();
  if(style === 'none'){
   playGem('soft', 0.9, 0.3);
   return;
  }
  const stepDur = style === 'zen' ? 0.127 : 0.119;
  const numSteps = 16; // 2 bars
  for(let s=0; s<numSteps; s++){
   const barIdx = Math.floor(s / 8) % chords.length;
   const subStep = s % 8;
   const t = c.currentTime + s * stepDur;
   const chord = chords[barIdx];

   if(style === 'zen'){
    if(subStep === 0 || subStep === 4) playStoneMalletThump(c, t);
    if(subStep === 2 || subStep === 6) playStoneClickPercussion(c, t);
    if(subStep === 0) playAcousticBass(c, chord.bass, t, 0.20);
    else if(subStep === 3) playAcousticBass(c, chord.bass * 1.5, t, 0.15);
    if(subStep === 1 || subStep === 4) playStoneMarimbaChord(c, chord.notes, t, 0.18, 0.060);
    const mel = leadMelody[s];
    if(mel && mel > 0) playStoneKalimbaLead(c, mel, t, 0.30);
   }else{
    if(subStep === 0 || subStep === 4) playPopKick(c, t);
    if(subStep === 2 || subStep === 6) playPopClap(c, t);
    if(subStep === 0) playPopBass(c, chord.bass, t, 0.16);
    else if(subStep === 3) playPopBass(c, chord.bass * 1.5, t, 0.12);
    if(subStep === 1 || subStep === 4) playFmChord(c, chord.notes, t, 0.14, 0.022);
    const mel = leadMelody[s];
    if(mel && mel > 0) playCelesta(c, mel, t, 0.22);
   }
  }
 }

 function scheduleBgm(){
  clearTimeout(bgmTimer);
  const curBgm = customAudioMap.bgm || 'pop';
  if(!enabled || !bgmActive || document.hidden || curBgm === 'none') return;
  const c = ensure(); if(!c) return;

  if(curBgm === 'zen'){
   const stepDur = 0.127;
   const batchSteps = 4;
   for(let s=0; s<batchSteps; s++){
    const step = (bgmStep + s) % 64;
    const barIdx = Math.floor(step / 8) % chords.length;
    const subStep = step % 8;
    const t = c.currentTime + s * stepDur;
    const chord = chords[barIdx];

    if(subStep === 0 || subStep === 4) playStoneMalletThump(c, t);
    if(subStep === 2 || subStep === 6) playStoneClickPercussion(c, t);

    if(subStep === 0) playAcousticBass(c, chord.bass, t, 0.20);
    else if(subStep === 3) playAcousticBass(c, chord.bass * 1.5, t, 0.15);
    else if(subStep === 5) playAcousticBass(c, chord.bass * 2.0, t, 0.17);

    if(subStep === 1 || subStep === 4) playStoneMarimbaChord(c, chord.notes, t, 0.18, 0.060);

    const mel = leadMelody[step];
    if(mel && mel > 0) playStoneKalimbaLead(c, mel, t, 0.30);
   }
   bgmStep = (bgmStep + batchSteps) % 64;
   bgmTimer = setTimeout(scheduleBgm, batchSteps * stepDur * 1000 - 25);
  }else{
   const stepDur = 0.119;
   const batchSteps = 4;
   for(let s=0; s<batchSteps; s++){
    const step = (bgmStep + s) % 64;
    const barIdx = Math.floor(step / 8) % chords.length;
    const subStep = step % 8;
    const t = c.currentTime + s * stepDur;
    const chord = chords[barIdx];

    if(subStep === 0 || subStep === 4) playPopKick(c, t);
    if(subStep === 2 || subStep === 6) playPopClap(c, t);

    if(subStep === 0) playPopBass(c, chord.bass, t, 0.16);
    else if(subStep === 3) playPopBass(c, chord.bass * 1.5, t, 0.12);
    else if(subStep === 5) playPopBass(c, chord.bass * 2.0, t, 0.14);

    if(subStep === 1 || subStep === 4) playFmChord(c, chord.notes, t, 0.14, 0.022);

    const mel = leadMelody[step];
    if(mel && mel > 0) playCelesta(c, mel, t, 0.22);
   }
   bgmStep = (bgmStep + batchSteps) % 64;
   bgmTimer = setTimeout(scheduleBgm, batchSteps * stepDur * 1000 - 25);
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
  if(['pop','zen','none'].includes(style)){
   customAudioMap.bgm = style;
   try{ localStorage.setItem('kp-bgm-style', style); }catch{}
   saveAudioMap(customAudioMap);
   clearTimeout(bgmTimer);
   bgmStep = 0;
   if(bgmActive && enabled && style !== 'none'){
    scheduleBgm();
   }
  }
 }

 function getBgmStyle(){ return customAudioMap.bgm || 'pop'; }

 function setSoundProfile(name){
  if(['gem','tile','crystal','stone','soft','wood'].includes(name)){
   customAudioMap.select = name;
   customAudioMap.slide = name;
   saveAudioMap(customAudioMap);
   slide(false);
  }
 }

 function getSoundProfile(){ return customAudioMap.slide || 'gem'; }

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
   if(map.slide) localStorage.setItem('kanji-pop-sound-profile', map.slide);
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

 /* Native Japanese TTS Engine */
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
