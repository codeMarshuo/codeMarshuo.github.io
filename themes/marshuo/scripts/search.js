hexo.extend.generator.register('journal-search', function(locals) {
  return {path: 'search.json', data: JSON.stringify(locals.posts.sort('-date').toArray().map(post => ({title: post.title, url: '/' + post.path, tags: post.tags.map(tag => tag.name).join(' '), text: post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0,20000)})))};
});