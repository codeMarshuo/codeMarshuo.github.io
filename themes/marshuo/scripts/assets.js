const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const versions = new Map();
hexo.extend.helper.register('asset_version', function(file) {
  if (!versions.has(file)) versions.set(file, crypto.createHash('sha256').update(fs.readFileSync(path.join(hexo.theme_dir, 'source', file))).digest('hex').slice(0, 10));
  return versions.get(file);
});
