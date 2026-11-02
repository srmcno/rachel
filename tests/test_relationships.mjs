import test from 'node:test';
import assert from 'node:assert/strict';
import {createRelationships} from '../relationships.js';

function family() {
  const P = {};
  const person = (id,x='M',f=null,m=null,sp=[]) => P[id]={n:id,x,f,m,sp};
  person('r','F','f','m',['w']); person('f','M','gf','gm'); person('m','F','mgf','mgm');
  person('gf','M','ggf','ggm'); person('gm','F');person('mgf');person('mgm','F');
  person('ggf','M','gggf','gggm');person('ggm','F');person('gggf','M','ggggf','ggggm');person('gggm','F');person('ggggf');person('ggggm','F');
  person('s','F','f','m',['sh']);person('h','M','f','othermother');person('othermother','F');person('sh');
  person('u','M','gf','gm',['uw']);person('uw','F');person('a','F','gf','gm');
  person('c','F','u','uw',['cw']);person('cw');person('cchild','M','c');person('cgrandchild','F','cchild');
  person('gu','M','ggf','ggm');person('secondparent','F','gu');person('secondcousin','M','secondparent');
  person('thirdgreatuncle','M','ggggf','ggggm');
  person('child','M','r',null,['childwife']);person('childwife','F');person('grandchild','F','child');person('greatgrandchild','M','grandchild');
  person('niece','F','s');person('greatnephew','M','niece');
  person('w','M','wf','wm');person('wf');person('wm','F');person('ws','F','wf','wm');
  person('unrelated');person('unknownsex','','f','m');
  return P;
}

test('direct ancestors and descendants use generation-appropriate names',()=>{
  const rel=createRelationships(family(),'r');
  assert.equal(rel.label('r'),'Rachel');assert.equal(rel.label('f'),'Father');assert.equal(rel.label('m'),'Mother');
  assert.equal(rel.label('gf'),'Grandfather');assert.equal(rel.label('ggf'),'Great-grandfather');
  assert.equal(rel.label('gggf'),'2nd great-grandfather');
  assert.equal(rel.label('child'),'Son');assert.equal(rel.label('grandchild'),'Granddaughter');assert.equal(rel.label('greatgrandchild'),'Great-grandson');
});

test('siblings, half-siblings and unknown sex are distinguished without guesses',()=>{
  const P=family();const rel=createRelationships(P,'r');
  assert.equal(rel.label('s'),'Sister');assert.equal(rel.label('h'),'Half-brother');assert.equal(rel.label('unknownsex'),'Sibling');
  P.h.m=null;assert.equal(createRelationships(P,'r').label('h'),'Brother');
});

test('uncle, aunt, great-uncle, nieces and nephews follow parent links',()=>{
  const rel=createRelationships(family(),'r');
  assert.equal(rel.label('u'),'Uncle');assert.equal(rel.label('a'),'Aunt');assert.equal(rel.label('gu'),'Great-uncle');
  assert.equal(rel.label('thirdgreatuncle'),'3rd great-uncle');assert.equal(rel.label('niece'),'Niece');assert.equal(rel.label('greatnephew'),'Great-nephew');
});

test('cousin degree and removals are counted in both directions',()=>{
  const P=family(),rel=createRelationships(P,'r');
  assert.equal(rel.label('c'),'1st cousin');assert.equal(rel.label('cchild'),'1st cousin, once removed');
  assert.equal(rel.label('cgrandchild'),'1st cousin, twice removed');assert.equal(rel.label('secondcousin'),'2nd cousin');
  assert.equal(createRelationships(P,'cgrandchild').label('r'),'1st cousin, twice removed');
});

test('recorded marriages provide explicit affinity labels',()=>{
  const rel=createRelationships(family(),'r');
  assert.equal(rel.label('w'),'Husband');assert.equal(rel.label('sh'),'Brother-in-law');assert.equal(rel.label('uw'),'Aunt by marriage');
  assert.equal(rel.label('cw'),'1st cousin by marriage');assert.equal(rel.label('wf'),'Father-in-law');assert.equal(rel.label('ws'),'Sister-in-law');
  assert.equal(rel.label('childwife'),'Daughter-in-law');
});

test('a parents spouse is not silently treated as a biological parent',()=>{
  const P=family();P.m.sp=['step'];P.step={x:'M',f:null,m:null,sp:[]};
  assert.equal(createRelationships(P,'r').label('step'),'Mother’s spouse');
});

test('one-direction spouse records are symmetric; coparents do not imply marriage',()=>{
  const P=family();P.w.sp=['r'];P.r.sp=[];
  assert.equal(createRelationships(P,'r').label('w'),'Husband');
  P.r.sp=[];P.w.sp=[];P.shared={x:'M',f:'r',m:'w',sp:[]};
  assert.equal(createRelationships(P,'r').label('w'),'Relationship not determined');
});

test('disconnected people and missing IDs have no inferred relationship',()=>{
  const P=family();P.unrelated.s='r';P.unrelated.gen=2;P.unrelated.side='N';
  const rel=createRelationships(P,'r');assert.equal(rel.label('unrelated'),'Relationship not determined');assert.equal(rel.label('absent'),'Relationship not determined');
});

test('pedigree collapse chooses the nearest recorded relationship deterministically',()=>{
  const P=family();P.m.f='gf';const rel=createRelationships(P,'r');
  assert.equal(rel.label('u'),'Uncle');assert.equal(rel.describe('u').distance,3);
  const reversed=Object.fromEntries(Object.entries(P).reverse());assert.equal(createRelationships(reversed,'r').label('u'),'Uncle');
});

test('cycles and self-links terminate; memoized results do not mutate input',()=>{
  const P=family();P.gf.f='f';P.unrelated.f='unrelated';P.gm.m='missing';const before=JSON.stringify(P);
  const rel=createRelationships(P,'r');assert.equal(rel.label('u'),'Uncle');assert.equal(rel.label('unrelated'),'Relationship not determined');
  assert.strictEqual(rel.describe('u'),rel.describe('u'));assert.equal(JSON.stringify(P),before);
});

test('ordinal suffixes handle the teens correctly',()=>{
  const P={};for(let i=0;i<=13;i++)P[`p${i}`]={x:i===13?'F':'M',f:i<13?`p${i+1}`:null,m:null,sp:[]};
  assert.equal(createRelationships(P,'p0').label('p13'),'11th great-grandmother');
});
