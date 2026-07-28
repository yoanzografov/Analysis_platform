const fs = require('fs');
let code = fs.readFileSync('src/components/StockTable.tsx', 'utf8');

// The garbage lines we want to remove
const garbageRegex = /className={`hover:bg-white\/5 transition-colors duration-75 group cursor-pointer \$\{\n  isEditing \? 'bg-bg rounded-2xl\/10' : ''\n  \} \$\{selectedRow === stock\.ticker \? 'bg-indigo-500\/10 outline-double outline-1 outline-indigo-500\/50' : ''\}`\}\n        return;\n      \}\n      e\.preventDefault\(\);\n      handleSaveClick\(stock\.ticker\);\n    \} else if \(e\.key === 'Escape'\) \{\n      e\.preventDefault\(\);\n      cancelInlineEdit\(\);\n    \}\n  \} : undefined\}\n  >/g;

const replacement = `className={\`hover:bg-white/5 transition-colors duration-75 group cursor-pointer \${
  isEditing ? 'bg-bg rounded-2xl/10' : ''
  } \${selectedRow === stock.ticker ? 'bg-indigo-500/10 outline-double outline-1 outline-indigo-500/50' : ''}\`}
  >`;

if (garbageRegex.test(code)) {
  code = code.replace(garbageRegex, replacement);
  fs.writeFileSync('src/components/StockTable.tsx', code);
  console.log("Fixed syntax error");
} else {
  console.log("Garbage regex not found");
}
