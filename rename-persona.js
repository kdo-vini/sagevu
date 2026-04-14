const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/Persona(s?)/g, 'Specialist$1');
    content = content.replace(/persona(s?)/g, 'specialist$1');
    content = content.replace(/PERSONA(S?)/g, 'SPECIALIST$1');
    
    // Fix imports that might have been mapped to specific components if renaming fails
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
};

const renameItem = (oldPath, newPath) => {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldPath} -> ${newPath}`);
    return newPath;
}

const walkAndReplace = (currentDir) => {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        let stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            let nextPath = fullPath;
            if (item.toLowerCase().includes('persona')) {
                const newItem = item.replace(/Persona/g, 'Specialist').replace(/persona/g, 'specialist');
                nextPath = path.join(currentDir, newItem);
                renameItem(fullPath, nextPath);
            }
            walkAndReplace(nextPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
            replaceInFile(fullPath);
            if (item.toLowerCase().includes('persona')) {
                const newItem = item.replace(/Persona/g, 'Specialist').replace(/persona/g, 'specialist');
                renameItem(fullPath, path.join(currentDir, newItem));
            }
        }
    }
};

walkAndReplace(dir);
console.log('Renaming complete.');
