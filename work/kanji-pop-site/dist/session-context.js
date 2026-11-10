(()=>{
 'use strict';
 const id=new URLSearchParams(location.search).get('playtest'),study=typeof id==='string'&&/^[a-zA-Z0-9-]{8,64}$/.test(id);
 const suffix=study?'-study-'+id:'';
 window.KanjiSession={study,id:study?id:null,progressKey:'kanji-pop-n5-v1'+suffix,experienceKey:'kanji-pop-experience-v1'+suffix,metaKey:study?'kanji-pop-study-meta-'+id:null};
 window.KanjiWriter=KanjiProgressLock.create({key:KanjiSession.progressKey});
 window.KanjiWriterReady=KanjiWriter.acquire();
})();
