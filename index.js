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
            
            if (commentStart !== -1 && line.includes('TODO')) {
                const commentText = line.substring(commentStart).trim();
                todoComments.push({
                    line: index + 1,
                    text: commentText
                });
            }
        });
    });
    
    return todoComments;
}

function processCommand(command) {
    const arrayComment = getComment();
    const parts = command.split(' ');
    const cmd = parts[0];
    const username = parts[1];
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            for (const com of arrayComment) {
                console.log(com.text);
            }

            break;
        case 'important':
            for (const el of arrayComment){
                if (el.text.includes('!')){
                    console.log(el.text);
                }
            }

            break;
        case 'user':

        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!


