(() => {
  const toggle = document.querySelector('#theme-toggle');
  toggle.addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; try {localStorage.setItem('marshuo-theme', theme);} catch {} });

  const motionButton = document.querySelector('#motion-toggle');
  if (motionButton) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = false;
    try { paused = localStorage.getItem('marshuo-motion') === 'paused'; } catch {}
    let inView = true;
    const syncMotion = () => {
      const off = paused || reduced.matches;
      document.body.dataset.motion = off || document.hidden || !inView ? 'off' : 'on';
      motionButton.setAttribute('aria-pressed', String(off));
      motionButton.setAttribute('aria-label', reduced.matches ? '系统已启用减少动态效果' : off ? '播放背景动画' : '暂停背景动画');
      motionButton.querySelector('.motion-label').textContent = reduced.matches ? '已减少动态' : off ? '播放动态' : '暂停动态';
      motionButton.querySelector('.motion-icon').textContent = off ? '▷' : 'Ⅱ';
      motionButton.disabled = reduced.matches;
    };
    motionButton.addEventListener('click', () => { paused = !paused; try {localStorage.setItem('marshuo-motion', paused ? 'paused' : 'on');} catch {} syncMotion(); });
    document.addEventListener('visibilitychange', syncMotion);
    reduced.addEventListener('change', syncMotion);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {inView = entries[0].isIntersecting;syncMotion();}, {threshold:0}).observe(document.querySelector('.twilight-hero'));
    syncMotion();
  }
  const dialog = document.querySelector('#search-dialog'), input = document.querySelector('#search-input'), results = document.querySelector('#search-results'), status = document.querySelector('#search-status');
  let articles;
  document.querySelector('#search-open').addEventListener('click', () => {dialog.showModal();input.focus();});
  document.querySelector('#search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {if(e.target === dialog && (e.clientX < dialog.getBoundingClientRect().left || e.clientX > dialog.getBoundingClientRect().right || e.clientY < dialog.getBoundingClientRect().top || e.clientY > dialog.getBoundingClientRect().bottom)) dialog.close();});
  input.addEventListener('input', async () => {
    const query = input.value.trim().toLocaleLowerCase(); results.replaceChildren();
    if(!query){status.textContent='从一个关键词开始。';return;}
    status.textContent='正在搜索…';
    try {
      articles = articles || await fetch('/search.json').then(r => {if(!r.ok) throw new Error();return r.json();});
      if(input.value.trim().toLocaleLowerCase() !== query) return;
      const matches = articles.filter(p => (p.title+' '+p.tags+' '+p.text).toLocaleLowerCase().includes(query));
      status.textContent=matches.length ? `找到 ${matches.length} 篇记录` : '暂时没有找到，试试其他关键词。';
      matches.forEach(post => {const a=document.createElement('a');a.href=post.url; const title=document.createElement('strong');title.textContent=post.title;const detail=document.createElement('span');detail.textContent=post.tags || '随笔';a.append(title,detail);results.append(a);});
    } catch {status.textContent='搜索暂时不可用，请稍后再试，或前往文章归档。';}
  });
})();