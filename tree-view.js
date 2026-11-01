/* Shared pedigree viewer. Parent connections come only from the published tree. */
window.ArchiveTree = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function init({container,people,root,homeLabel,getCard,onOpen,branches=[]}) {
    let generations = innerWidth < 640 ? 3 : 4, focus = root, selected = null, trail = [root];
    let scale = 1, tx = 0, ty = 0, dims = null, moved = 0, pinch = null;
    const pointers = new Map(), CW = 236, CH = 78, GX = 294, GAP = 22;
    container.classList.add('archive-tree');
    container.innerHTML = `<div class="archive-tree-toolbar"><label class="archive-tree-depth">Generations <select aria-label="Generations">${[3,4,5,6].map(n=>`<option value="${n}"${n===generations?' selected':''}>${n} generations</option>`).join('')}</select></label><div class="chips" aria-label="Generations shown">${[3,4,5,6].map(n=>`<button type="button" class="chip" data-generations="${n}" aria-pressed="${n===generations}">${n} generations</button>`).join('')}</div><button type="button" class="chip" data-tree-home>${esc(homeLabel)}</button></div>${branches.length?`<div class="chips archive-tree-branches" aria-label="Family lines">${branches.map(b=>`<button type="button" class="chip" data-tree-branch="${esc(b.id)}">${esc(b.label)}</button>`).join('')}</div>`:''}<nav class="archive-tree-trail" aria-label="Tree path"></nav><p class="archive-tree-help" id="tree-help">Drag to move. Pinch or use + / − to zoom. Tap a person; › follows their parents.</p><div class="archive-tree-viewport" tabindex="0" role="group" aria-label="Interactive family tree" aria-describedby="tree-help"><div class="archive-tree-stage"></div><div class="archive-tree-zoom"><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="fit" aria-label="Fit to view">Fit</button></div></div><p class="archive-tree-status" role="status" aria-live="polite"></p><div class="archive-tree-legend"><span><i style="background:var(--proven)"></i>Proven</span><span><i style="background:var(--probable)"></i>Probable</span><span><i style="background:var(--lead)"></i>Lead</span><span><i style="background:var(--rule)"></i>From the tree, unchecked</span><span>A number marks linked stories.</span></div>`;
    const vp=container.querySelector('.archive-tree-viewport'),stage=container.querySelector('.archive-tree-stage');
    function apply(){stage.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;}
    function fit(){
      if(!dims||!vp.clientWidth)return;
      const width=vp.clientWidth,height=vp.clientHeight;
      scale=Math.min(1.1,Math.max(width<700?.62:.3,Math.min((width-40)/dims.W,(height-50)/dims.H)));
      tx=Math.max(16,(width-dims.W*scale)/2);ty=(height-dims.H*scale)/2;apply();
    }
    function render(){
      let leaves=0,maxGeneration=0;const items=[],links=[],more=[];
      function place(id,g,path){
        if(!people[id]||path.has(id))return null;
        const next=new Set([...path,id]),p=people[id];
        const parents=g<generations-1?[p.f,p.m].filter(id=>id&&people[id]&&!next.has(id)):[];
        const ancestors=parents.map(id=>place(id,g+1,next)).filter(Boolean);
        const y=ancestors.length?(ancestors[0].y+ancestors.at(-1).y)/2:leaves++*(CH+GAP)+16;
        const node={id,x:g*GX+16,y};items.push(node);maxGeneration=Math.max(maxGeneration,g);
        ancestors.forEach(parent=>links.push(`M${node.x+CW} ${y+CH/2} C${node.x+CW+28} ${y+CH/2},${parent.x-28} ${parent.y+CH/2},${parent.x} ${parent.y+CH/2}`));
        if(!parents.length&&(p.f||p.m)&&g===generations-1)more.push(node);
        return node;
      }
      place(focus,0,new Set());
      dims={W:maxGeneration*GX+CW+76,H:Math.max(1,leaves)*(CH+GAP)+10};
      stage.style.width=dims.W+'px';stage.style.height=dims.H+'px';
      stage.innerHTML=`<svg width="${dims.W}" height="${dims.H}" aria-hidden="true"><path d="${links.join(' ')}"/></svg>`+items.map(node=>{
        const info=getCard(node.id),initials=info.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('');
        return `<button type="button" class="pc${node.id===focus?' focus':''}${node.id===selected?' sel':''}${info.evidence==='lead'?' lead':''}" style="left:${node.x}px;top:${node.y}px;--person-color:${esc(info.color||'var(--accent)')}" data-id="${esc(node.id)}"${info.selectable===false?' disabled':''}>${info.image?`<img class="tree-avatar" src="${esc(info.image)}" alt="" loading="lazy">`:`<span class="tree-avatar">${esc(initials)}</span>`}<span class="tree-card-copy"><span class="tree-name">${esc(info.name)}</span><span class="tree-years"><i class="tree-evidence ${esc(info.evidence||'')}"></i>${esc(info.years||'Dates not recorded')}</span></span>${info.stories?`<span class="tree-story-count" aria-label="${info.stories} linked ${info.stories===1?'story':'stories'}">${info.stories}</span>`:''}</button>`;
      }).join('')+more.map(node=>`<button type="button" class="archive-tree-more" style="left:${node.x+CW+8}px;top:${node.y+CH/2-22}px" data-earlier="${esc(node.id)}" aria-label="Show ${esc(getCard(node.id).name)}'s parents">›</button>`).join('');
      container.querySelector('.archive-tree-trail').innerHTML=trail.map((id,i)=>i===trail.length-1?`<span aria-current="location">${esc(getCard(id).name)}</span>`:`<button type="button" data-trail="${i}">${esc(getCard(id).name)}</button><span aria-hidden="true">›</span>`).join('');
      container.querySelector('.archive-tree-depth select').value=String(generations);
      container.querySelectorAll('[data-generations]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.generations)===generations)));
      container.querySelector('.archive-tree-status').textContent=`${items.length} ${items.length===1?'person':'people'} shown · ${generations} generations · ${getCard(focus).name}`;
      fit();
    }
    function refocus(id){if(!people[id])return;focus=id;const at=trail.indexOf(id);trail=at>=0?trail.slice(0,at+1):[...trail,id];render();}
    function zoom(cx,cy,next,base){const r=vp.getBoundingClientRect(),b=base||{s:scale,tx,ty};next=Math.min(2.4,Math.max(.2,next));const x=cx-r.left,y=cy-r.top;tx=x-(x-b.tx)*next/b.s;ty=y-(y-b.ty)*next/b.s;scale=next;apply();}
    function centeredZoom(factor){const r=vp.getBoundingClientRect();zoom(r.left+r.width/2,r.top+r.height/2,scale*factor);}
    container.querySelector('.archive-tree-depth select').addEventListener('change',event=>{generations=Number(event.target.value);render();});
    container.addEventListener('click',event=>{
      if(moved>6&&event.detail>0&&event.target.closest('.archive-tree-stage'))return;
      const gen=event.target.closest('[data-generations]'),home=event.target.closest('[data-tree-home]'),branch=event.target.closest('[data-tree-branch]'),crumb=event.target.closest('[data-trail]'),earlier=event.target.closest('[data-earlier]'),person=event.target.closest('.pc[data-id]'),control=event.target.closest('[data-zoom]');
      if(gen){generations=Number(gen.dataset.generations);render();}
      else if(home){focus=root;trail=[root];render();}
      else if(branch)refocus(branch.dataset.treeBranch);
      else if(crumb){trail=trail.slice(0,Number(crumb.dataset.trail)+1);focus=trail.at(-1);render();}
      else if(earlier)refocus(earlier.dataset.earlier);
      else if(person){selected=person.dataset.id;select(selected);onOpen(selected);}
      else if(control){if(control.dataset.zoom==='fit')fit();else centeredZoom(control.dataset.zoom==='in'?1.25:.8);}
    });
    vp.addEventListener('pointerdown',event=>{if(event.target.closest('.archive-tree-zoom')||event.button>0)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});moved=0;if(pointers.size===2){const[a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:scale,tx,ty,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};}});
    vp.addEventListener('pointermove',event=>{
      if(!pointers.has(event.pointerId))return;const previous=pointers.get(event.pointerId),current={x:event.clientX,y:event.clientY};pointers.set(event.pointerId,current);
      if(pointers.size===2&&pinch?.d){const[a,b]=[...pointers.values()];zoom(pinch.cx,pinch.cy,pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,pinch);moved=20;return;}
      const dx=current.x-previous.x,dy=current.y-previous.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>4){vp.classList.add('drag');if(!vp.hasPointerCapture(event.pointerId))vp.setPointerCapture(event.pointerId);tx+=dx;ty+=dy;apply();}
    });
    function release(event){pointers.delete(event.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size)vp.classList.remove('drag');}
    vp.addEventListener('pointerup',release);vp.addEventListener('pointercancel',release);vp.addEventListener('lostpointercapture',release);
    vp.addEventListener('wheel',event=>{if(!event.ctrlKey&&!event.metaKey)return;event.preventDefault();zoom(event.clientX,event.clientY,scale*Math.exp(-event.deltaY*.01));},{passive:false});
    vp.addEventListener('keydown',event=>{
      if(event.target!==vp)return;
      if(event.key==='+'||event.key==='='){event.preventDefault();centeredZoom(1.25);}
      else if(event.key==='-'){event.preventDefault();centeredZoom(.8);}
      else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();tx+=event.key==='ArrowLeft'?50:event.key==='ArrowRight'?-50:0;ty+=event.key==='ArrowUp'?50:event.key==='ArrowDown'?-50:0;apply();}
    });
    stage.addEventListener('focusin',event=>{const button=event.target.closest('button');if(!button)return;const r=button.getBoundingClientRect(),v=vp.getBoundingClientRect();tx+=r.left<v.left+12?v.left+12-r.left:r.right>v.right-12?v.right-12-r.right:0;ty+=r.top<v.top+12?v.top+12-r.top:r.bottom>v.bottom-12?v.bottom-12-r.bottom:0;apply();});
    new ResizeObserver(()=>{if(vp.clientWidth)fit();}).observe(vp);
    function select(id){selected=id;stage.querySelectorAll('.pc').forEach(card=>card.classList.toggle('sel',card.dataset.id===id));}
    return {show(id){if(id&&people[id]&&focus!==id)refocus(id);else if(!dims)render();else requestAnimationFrame(fit);},refocus,fit,select};
  }
  return {init};
})();
