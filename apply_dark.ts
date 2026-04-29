import fs from 'fs';
let content = fs.readFileSync('src/infrastructure/ui/App.tsx', 'utf-8');

// Use more specific replaces to avoid duplicate dark classes
content = content.replace(/bg-white([^A-Za-z0-9])/g, "bg-white dark:bg-slate-900$1");
content = content.replace(/bg-slate-50([^A-Za-z0-9])/g, "bg-slate-50 dark:bg-slate-950$1");
content = content.replace(/bg-slate-100([^A-Za-z0-9])/g, "bg-slate-100 dark:bg-slate-800$1");
content = content.replace(/border-slate-200/g, "border-slate-200 dark:border-slate-800");

// Text colors
content = content.replace(/text-slate-800([^A-Za-z0-9])/g, "text-slate-800 dark:text-slate-200$1");
content = content.replace(/text-slate-500/g, "text-slate-500 dark:text-slate-400");
content = content.replace(/text-slate-600([^A-Za-z0-9])/g, "text-slate-600 dark:text-slate-400$1");
content = content.replace(/text-slate-900 /g, "text-slate-900 dark:text-white ");

fs.writeFileSync('src/infrastructure/ui/App.tsx', content);
