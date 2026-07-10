const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldJSX = `    <button
    onClick={handleNewUser}
    className="text-xs font-mono font-extrabold px-3 py-1.5 rounded-none border border-[#f43f5e]/50 bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 uppercase transition-all cursor-pointer"
    title="Изтрийте всичко и започнете начисто (Нов потребител)"
    >
    Нов потребител (Изчисти)
    </button>`;

content = content.replace(oldJSX, "");
fs.writeFileSync('src/App.tsx', content);
