const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/module/user/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace dashboard button in nav menu
  const updated = content.replace(/<button\s+onClick=\{\(\)\s*=>\s*navigate\('\/dashboard'\)\}\s+className="sih-nav-btn[^"]*">\s*<span\s+className="sih-nav-icon">🏠<\/span>\s*Dashboard\s*<\/button>\s*/g, '');
  
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Removed Dashboard button from:', f);
  }
});
