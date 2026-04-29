import fs from 'fs';
let content = fs.readFileSync('src/infrastructure/ui/App.tsx', 'utf-8');

content = content.replace(/dark:bg-slate-950 dark:bg-slate-950/g, 'dark:bg-slate-950');
content = content.replace(/dark:text-white dark:text-gray-100/g, 'dark:text-white');
content = content.replace(/dark:text-white dark:text-white/g, 'dark:text-white');
content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
content = content.replace(/dark:border-slate-800 dark:border-slate-800/g, 'dark:border-slate-800');
content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
content = content.replace(/dark:bg-slate-900 dark:bg-slate-700/g, 'dark:bg-slate-700');
content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
content = content.replace(/dark:text-slate-500 dark:text-slate-400/g, 'dark:text-slate-400');
content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
content = content.replace(/dark:bg-slate-800 dark:bg-slate-700/g, 'dark:bg-slate-700');

fs.writeFileSync('src/infrastructure/ui/App.tsx', content);
