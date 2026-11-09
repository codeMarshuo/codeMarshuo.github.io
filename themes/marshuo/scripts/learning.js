const tracks = require('../../../source/_data/learning.json');
hexo.extend.helper.register('learning_tracks', () => tracks);
hexo.extend.helper.register('learning_track', name => tracks.find(t => t.name === name));
hexo.extend.helper.register('learning_categories', function () {
  const existing = this.site.categories.toArray();
  return tracks.map(t => ({name:t.name,path:`categories/${t.slug}/`,length:existing.find(c=>c.name===t.name)?.length || 0}))
    .concat(existing.filter(c => !tracks.some(t=>t.name===c.name)));
});
// Hexo does not generate empty categories. Keep these routes until the first post
// is published; the standard category generator then takes over automatically.
hexo.extend.generator.register('learning-categories', locals => tracks
  .filter(t => !locals.categories.toArray().some(c => c.name === t.name))
  .map(t => ({path:`categories/${t.slug}/index.html`,layout:'learning-category',data:{title:t.name,track:t}})));
