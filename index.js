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
                const rawText = line.substring(commentStart).trim();
                
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
                
                let importance = 0;
                for (let i = 0; i < rawText.length; i++) {
                    if (rawText[i] === '!') {
                        importance++;
                    }
                }
                
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

function formatTable(comments) {
    const colWidths = {
        importance: 1,
        user: 10,
        date: 10,
        text: 50
    };
    
    const rows = comments.map(com => {
        const importance = com.importance > 0 ? '!' : ' ';
        
        const formatCell = (value, maxWidth) => {
            if (!value) 
                value = '';
            const strValue = String(value);
            if (strValue.length <= maxWidth) {
                return strValue.padEnd(maxWidth);
            } else {
                return strValue.substring(0, maxWidth - 3) + '...';
            }
        };
        
        const formattedUser = formatCell(com.user, colWidths.user);
        const formattedDate = formatCell(com.date, colWidths.date);
        const formattedText = formatCell(com.text, colWidths.text);
        
        return `  ${importance}  |  ${formattedUser}  |  ${formattedDate}  |  ${formattedText}`;
    });
    
    return rows.join('\n');
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
            console.log(formatTable(arrayComment));
            break;
            
        case 'important':
            const importantComments = arrayComment.filter(com => com.importance > 0);
            console.log(formatTable(importantComments));
            break;
            
        case 'user':
            const trueUser = arg.toLowerCase();
            const userComments = [];

            for (const com of arrayComment) {
                if (com.user.toLowerCase() === trueUser) {
                    userComments.push(com);
                }
            }
            
            if (userComments.length > 0) {
                console.log(formatTable(userComments));
            } else {
                console.log(`Нет комментариев от пользователя ${arg}`);
            }
            break;
            
        case 'sort':
            let sorted = [...arrayComment]; 
            
            if (arg === 'importance') {
                sorted.sort((a, b) => b.importance - a.importance);
                console.log(formatTable(sorted));
            } 
            else if (arg === 'user') {
                sorted.sort((a, b) => {
                    if (a.user && !b.user) 
                        return -1;
                    if (!a.user && b.user) 
                        return 1;
                    if (!a.user && !b.user) 
                        return 0;
                    return a.user.localeCompare(b.user); 
                });
                console.log(formatTable(sorted));
            } 
            else if (arg === 'date') {
                sorted.sort((a, b) => {
                    if (a.date && !b.date) 
                        return -1;
                    if (!a.date && b.date) 
                        return 1;
                    if (!a.date && !b.date) 
                        return 0;
                    return b.date.localeCompare(a.date); 
                });
                console.log(formatTable(sorted));
            }
            else {
                console.log("Неправильная команда");
            }
            break;
            
        case 'date':
            const dateComments = arrayComment.filter(com => com.date && com.date >= arg);
            console.log(formatTable(dateComments));
            break;

        default:
            console.log('wrong command');
            break;
    }
}