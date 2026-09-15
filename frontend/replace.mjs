import fs from 'fs';
import path from 'path';

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace MedVault with MedIksha
  content = content.replace(/MedVault/g, 'MedIksha');

  // Replace AESIX with MedIksha
  content = content.replace(/AESIX/g, 'MedIksha');

  // Replace ShieldIcon with the logo
  content = content.replace(/<ShieldIcon \/>/g, '<img src="/mediksha.png" alt="MedIksha" style={{ width: "100%", height: "100%", objectFit: "contain" }} />');

  // Replace Heart icon in the auth logo badge with the mediksha logo
  content = content.replace(/<Heart size=\{24\} fill="[^"]+" \/>/g, '<img src="/mediksha.png" alt="MedIksha" style={{ width: "100%", height: "100%", objectFit: "contain" }} />');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
