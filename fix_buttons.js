const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldJSX = `    <button
    onClick={handleRestoreDefaults}
    className="text-xs font-mono font-extrabold px-3 py-1.5 rounded-none border border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase transition-all cursor-pointer"
    title="Върнете началните фабрични данни (Презаписва таблицата)"
    >
    Фабрични данни
    </button>
    <button
    onClick={handleNewUser}
    className="text-xs font-mono font-extrabold px-3 py-1.5 rounded-none border border-[#f43f5e]/50 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 uppercase transition-all cursor-pointer"
    title="Изтрийте всичко и започнете начисто (Нов потребител)"
    >
    Нов потребител (Изчисти)
    </button>`;

const newJSX = `    <button
    onClick={handleRestoreDefaults}
    className={\`text-xs font-mono font-extrabold px-3 py-1.5 rounded-none border uppercase transition-all cursor-pointer \${
      confirmRestore ? 'bg-amber-100 border-amber-400 text-amber-800' : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
    }\`}
    title="Върнете началните фабрични данни (Презаписва таблицата)"
    >
    {confirmRestore ? 'Сигурни ли сте?' : 'Фабрични данни'}
    </button>
    <button
    onClick={handleNewUser}
    className={\`text-xs font-mono font-extrabold px-3 py-1.5 rounded-none border uppercase transition-all cursor-pointer \${
      confirmClear ? 'bg-red-600 border-red-700 text-white' : 'border-[#f43f5e]/50 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20'
    }\`}
    title="Изтрийте всичко и започнете начисто (Нов потребител)"
    >
    {confirmClear ? 'Потвърди Изтриване!' : 'Нов потребител (Изчисти)'}
    </button>`;

content = content.replace(oldJSX, newJSX);
fs.writeFileSync('src/App.tsx', content);
