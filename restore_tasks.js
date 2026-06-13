const fs = require('fs');

const plan = fs.readFileSync('implementationplan.md', 'utf8');
const lines = plan.split('\n');

// Find start and end of the task list
const startIdx = lines.findIndex(l => l.includes('المرحلة 1: Foundation'));
const endIdx = lines.findIndex(l => l.includes('10. بنية مجلدات المشروع'));

if (startIdx !== -1 && endIdx !== -1) {
    let taskLines = lines.slice(startIdx, endIdx);
    
    // Mark tasks up to Phase 5 as completed based on what we actually did.
    // We'll mark everything before Phase 6 as [x] since we delivered Phase 5.
    let inPhase6 = false;
    taskLines = taskLines.map(line => {
        if (line.includes('المرحلة 6: Launch')) {
            inPhase6 = true;
        }
        if (line.includes('- [ ]') && !inPhase6) {
            return line.replace('- [ ]', '- [x]');
        }
        return line;
    });

    const header = `# 🏟️ Yalla Book — قائمة المهام التفصيلية\n\n> مستخرجة من [Implementation Plan v2.0](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/implementationplan.md)\n> Database Schema: [Yalla_Book_Database_Schema.md](file:///d:/claude/projects/%D8%AD%D8%AC%D8%B2%20%D9%85%D9%84%D8%A7%D8%B9%D8%A8/Yalla_Book/Yalla_Book_Database_Schema.md)\n\n---\n\n## `;
    
    const finalContent = header + taskLines.join('\n');
    fs.writeFileSync('task.md', finalContent);
    console.log('Restored task.md successfully');
} else {
    console.log('Could not find boundaries');
}
