const fs = require('fs');
const files = [
  'app/guide/gif-marketing-seo/page.tsx',
  'app/guide/high-quality-gif/page.tsx',
  'app/guide/naver-blog-limit/page.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<p>([\s\S]*?)<\/p>/g, (m, p1) => '<p>' + p1.replace(/'/g, '&apos;').replace(/"/g, '&quot;') + '</p>');
  content = content.replace(/<li>([\s\S]*?)<\/li>/g, (m, p1) => '<li>' + p1.replace(/'/g, '&apos;').replace(/"/g, '&quot;') + '</li>');
  content = content.replace(/<strong>([\s\S]*?)<\/strong>/g, (m, p1) => '<strong>' + p1.replace(/'/g, '&apos;').replace(/"/g, '&quot;') + '</strong>');
  fs.writeFileSync(f, content, 'utf8');
});
