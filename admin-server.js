/**
 * Hexo 博客在线编辑器 - 管理服务
 * 提供浏览器端撰写、文件上传、文章管理等功能
 */
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const iconv = require('iconv-lite');

const app = express();
const PORT = 4001;

// ============ 配置 ============
const BLOG_DIR = __dirname;
const SOURCE_DIR = path.join(BLOG_DIR, 'source');
const POSTS_DIR = path.join(SOURCE_DIR, '_posts');
const IMAGES_DIR = path.join(SOURCE_DIR, 'images');
const UPLOADS_DIR = path.join(SOURCE_DIR, 'uploads');
const DRAFTS_DIR = path.join(SOURCE_DIR, '_drafts');

// 确保目录存在
[POSTS_DIR, IMAGES_DIR, UPLOADS_DIR, DRAFTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 允许的文件类型映射
const ALLOWED_TYPES = {
  // 图片
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image',
  '.webp': 'image', '.svg': 'image', '.bmp': 'image', '.ico': 'image',
  // 文档
  '.md': 'document', '.pdf': 'document', '.txt': 'document', '.csv': 'document',
  '.doc': 'document', '.docx': 'document', '.xls': 'document', '.xlsx': 'document',
  '.ppt': 'document', '.pptx': 'document',
  // 压缩包
  '.zip': 'archive', '.rar': 'archive', '.7z': 'archive', '.tar': 'archive', '.gz': 'archive',
  // 代码
  '.json': 'code', '.xml': 'code', '.yaml': 'code', '.yml': 'code',
  '.js': 'code', '.ts': 'code', '.py': 'code', '.java': 'code', '.css': 'code',
  '.html': 'code', '.sh': 'code', '.bat': 'code',
  // 字体
  '.woff': 'font', '.woff2': 'font', '.ttf': 'font', '.eot': 'font',
};

// ============ 中间件 ============
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/vditor', express.static(path.join(BLOG_DIR, 'node_modules', 'vditor')));
app.use('/blog', express.static(path.join(BLOG_DIR, 'public')));
app.use('/images', express.static(IMAGES_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// ============ 文件上传 ============
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const type = ALLOWED_TYPES[ext] || 'other';
    // 图片存到 images 目录，其他存到 uploads
    const targetDir = type === 'image' ? IMAGES_DIR : UPLOADS_DIR;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // 保留原始文件名但加上时间戳前缀防止冲突
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^\w一-龥-]/g, '_')
      .substring(0, 80);
    const name = Date.now() + '-' + baseName;
    cb(null, name + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES[ext]) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型: ' + ext));
    }
  }
});

// ============ API 路由 ============

// 通用文件上传
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }
  const ext = path.extname(req.file.originalname).toLowerCase();
  const type = ALLOWED_TYPES[ext] || 'other';
  const url = type === 'image' ? `/images/${req.file.filename}` : `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    type
  });
});

// base64/粘贴方式上传图片
app.post('/api/upload/base64', (req, res) => {
  const { base64 } = req.body;
  if (!base64) {
    return res.status(400).json({ error: '没有数据' });
  }

  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: '无效的 base64 图片数据' });
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = Buffer.from(matches[2], 'base64');
  const name = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.' + ext;
  const filePath = path.join(IMAGES_DIR, name);

  fs.writeFileSync(filePath, data);
  res.json({
    success: true,
    url: `/images/${name}`,
    filename: name
  });
});

// 获取文件列表
app.get('/api/files', (req, res) => {
  try {
    const type = req.query.type || 'all'; // image | document | archive | all

    const getFiles = (dir, baseUrl) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(f => {
          const ext = path.extname(f).toLowerCase();
          const fileType = ALLOWED_TYPES[ext] || 'other';
          if (type !== 'all' && fileType !== type) return false;
          // 忽略非文件条目
          return fs.statSync(path.join(dir, f)).isFile();
        })
        .map(f => {
          const stats = fs.statSync(path.join(dir, f));
          return {
            filename: f,
            url: baseUrl + '/' + f,
            size: stats.size,
            modified: stats.mtime,
            ext: path.extname(f).toLowerCase()
          };
        })
        .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    };

    const images = getFiles(IMAGES_DIR, '/images');
    const uploads = getFiles(UPLOADS_DIR, '/uploads');
    const allFiles = [...images, ...uploads].sort((a, b) => new Date(b.modified) - new Date(a.modified));

    res.json({ success: true, files: allFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除文件
app.delete('/api/files/:dir/:filename', (req, res) => {
  try {
    const { dir, filename } = req.params;
    // 防止路径穿越攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: '非法的文件名' });
    }
    let filePath;
    if (dir === 'images') {
      filePath = path.join(IMAGES_DIR, filename);
    } else if (dir === 'uploads') {
      filePath = path.join(UPLOADS_DIR, filename);
    } else {
      return res.status(400).json({ error: '非法的目录' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取文章列表
app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(POSTS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const fullPath = path.join(POSTS_DIR, f);
        const content = readFileWithEncoding(fullPath);
        const stats = fs.statSync(fullPath);
        const meta = parseFrontMatter(content);
        return {
          filename: f,
          title: meta.title || f.replace('.md', ''),
          date: meta.date || stats.mtime,
          updated: stats.mtime,
          tags: meta.tags || [],
          categories: meta.categories || [],
          size: stats.size,
          excerpt: (meta.description || content.substring(0, 200)).replace(/[#*`\[\]]/g, '').trim()
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, posts: files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单篇文章
app.get('/api/posts/:filename', (req, res) => {
  try {
    const filePath = path.join(POSTS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文章不存在' });
    }
    const content = readFileWithEncoding(filePath);
    res.json({ success: true, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建/更新文章
app.post('/api/posts', (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: '缺少 filename 或 content' });
    }

    const safeFilename = filename.endsWith('.md') ? filename : filename + '.md';
    const filePath = path.join(POSTS_DIR, safeFilename);

    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true, filename: safeFilename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除文章
app.delete('/api/posts/:filename', (req, res) => {
  try {
    const filePath = path.join(POSTS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文章不存在' });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 触发 Hexo 重新构建
app.post('/api/build', (req, res) => {
  try {
    const result = execSync('npx hexo generate', {
      cwd: BLOG_DIR,
      encoding: 'utf-8',
      timeout: 60000
    });
    res.json({ success: true, output: result });
  } catch (err) {
    res.status(500).json({ error: err.message, output: err.stdout || '' });
  }
});

// ============ 管理页面 ============
app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.get(['/admin', '/admin/{*path}'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-ui', 'index.html'));
});

// ============ 启动 ============
app.listen(PORT, () => {
  console.log(`\n  ✨ Hexo 在线编辑器已启动 ✨`);
  console.log(`  ─────────────────────────────`);
  console.log(`  📝 管理后台: http://localhost:${PORT}/admin`);
  console.log(`  📂 文件上传: http://localhost:${PORT}/api/upload`);
  console.log(`  📋 文章目录: ${POSTS_DIR}`);
  console.log(`  🖼️  图片目录: ${IMAGES_DIR}`);
  console.log(`  📁 上传目录: ${UPLOADS_DIR}`);
  console.log(`  ─────────────────────────────`);
  console.log(`  ⚡ 提示: 确保 Hexo server 也在运行 (npm run server)`);
  console.log(`  📖 博客地址: http://localhost:4000\n`);
});

// ============ 辅助函数 ============
// 读取文件，自动检测编码（UTF-8/GBK）
function readFileWithEncoding(filePath) {
  const raw = fs.readFileSync(filePath);
  // 先尝试 UTF-8 解码
  let content = iconv.decode(raw, 'utf-8');
  // 检查是否包含替换字符（U+FFFD），有则说明编码不对，尝试 GBK
  if (content.indexOf("�") !== -1) {
    try {
      const gbkContent = iconv.decode(raw, 'gbk');
      if (gbkContent.indexOf("�") === -1) {
        content = gbkContent;
      }
    } catch (e) {
      // GBK 解码失败，保留 UTF-8 结果
    }
  }
  return content;
}

function parseFrontMatter(content) {
  const result = { title: '', date: '', tags: [], categories: [] };
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    try {
      const parsed = yaml.load(match[1]);
      Object.assign(result, parsed);
    } catch (e) {
      match[1].split('\n').forEach(line => {
        const [key, ...vals] = line.split(':');
        const val = vals.join(':').trim();
        const k = key.trim();
        if (k === 'title') result.title = val.replace(/['"]/g, '');
        if (k === 'date') result.date = val.replace(/['"]/g, '');
        if (k === 'tags') {
          result.tags = val.replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/['"]/g, ''));
        }
        if (k === 'categories') {
          result.categories = val.replace(/[\[\]]/g, '').split(',').map(c => c.trim().replace(/['"]/g, ''));
        }
      });
    }
  }
  return result;
}
