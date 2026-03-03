const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getComment() {
    const todoComments = [];
    
    files.forEach(fileContent => {
        const lines = fileContent.split('\n');
        
        lines.forEach((line, index) => {
            const commentStart = line.indexOf('//');
            const todoIndex = line.indexOf('TODO', commentStart);
            
            if (commentStart !== -1 && todoIndex !== -1 && todoIndex >= commentStart) {
                const rawText = line.substring(commentStart).trim(); // Сырая строка: "// TODO ..."
                
                const contentStr = line.substring(todoIndex + 4).trim();
                
                let user = '';
                let date = '';
                let text = contentStr;
                
                const parts = contentStr.split(';');
                if (parts.length >= 3) {
                    user = parts[0].trim();
                    date = parts[1].trim();
                    text = parts.slice(2).join(';').trim(); 
                }
                
                const importance = (rawText.match(/!/g) || []).length;
                
                todoComments.push({
                    line: index + 1,
                    raw: rawText,    
                    user: user,     
                    date: date,     
                    text: text,      
                    importance: importance 
                });
            }
        });
    });
    
    return todoComments;
}

function processCommand(command) {
    const arrayComment = getComment();
    const parts = command.trim().split(' ');
    const cmd = parts[0]; 
    const arg = parts.slice(1).join(' ');

    switch (cmd) {
        case 'exit':
            process.exit(0);
            break;
            
        case 'show':
            arrayComment.forEach(com => console.log(com.raw));
            break;
            
        case 'important':
            arrayComment.filter(com => com.importance > 0)
                        .forEach(com => console.log(com.raw));
            break;
            
        case 'user':
            const targetUser = arg.toLowerCase();
            arrayComment.filter(com => com.user.toLowerCase() === targetUser)
                        .forEach(com => console.log(com.raw));
            break;
            
        case 'sort':
            let sorted = [...arrayComment]; 
            
            if (arg === 'importance') {
                sorted.sort((a, b) => b.importance - a.importance);
            } 
            else if (arg === 'user') {
                sorted.sort((a, b) => {
                    if (a.user && !b.user) return -1;
                    if (!a.user && b.user) return 1;
                    if (!a.user && !b.user) return 0;
                    return a.user.localeCompare(b.user); 
                });
            } 
            else if (arg === 'date') {
                sorted.sort((a, b) => {
                    if (a.date && !b.date) return -1;
                    if (!a.date && b.date) return 1;
                    if (!a.date && !b.date) return 0;
                    return b.date.localeCompare(a.date); 
                });
            }
            sorted.forEach(com => console.log(com.raw));
            break;
            
        case 'date':
            arrayComment.filter(com => com.date && com.date >= arg)
                        .forEach(com => console.log(com.raw));
            break;

        default:
            console.log('wrong command');
            break;
    }
}