import fs from 'fs';
const files = fs.readdirSync('/home/aumanh/Workspace/YuiChat/YuiChat_Frontend/public/avatars');
console.log(JSON.stringify(files.map(f => `/avatars/${f}`)));
