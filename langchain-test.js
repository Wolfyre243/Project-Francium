// Import stuff
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import readline from "readline-sync";
import fs from "fs";

const ollama = new Ollama({
    baseUrl: 'http://host.docker.internal:11434',
    model: "umbra-v0.4",
    keepAlive: "30m"
})

// Create a simple prompt template
const basePrompt = PromptTemplate.fromTemplate("Chat History: {chat_history}\nuser: {message}");

// A helper formatting function to format messages for storage
const formatMessage = (role, messageContent) => {
    return `${role}: ${messageContent}`;
}

// Read chat history from file and add it to the initial chat history
let chatHistory = fs.readFileSync(
    'messagehistory.txt',
    { encoding: 'utf8' }
)

while (true) {

    // Create a new chain with updated context
    const chain = basePrompt.pipe(ollama).pipe(new StringOutputParser());

    const userInput = readline.question("You:\n>> ");
    //messages.push(formatMessage("User", userInput)); // User: bla bla bla
    chatHistory = chatHistory.concat('\n', formatMessage("User", userInput), '\n');
    //chatHistory += '\n' + formatMessage("User", userInput);

    const result = await chain.stream({ 
        chat_history: chatHistory,
        message: userInput 
    });

    let finalResult= '';
    for await (const part of result) {
        process.stdout.write(part);
        finalResult += part;
    }
    console.log("\n")
    //messages.push(formatMessage("Assistant", finalResult)); // Assistant: bla bla bla
    chatHistory = chatHistory.concat('\n', formatMessage("Assistant", finalResult), '\n');

    //chatHistory += '\n' + formatMessage("Assistant", finalResult);
    //console.log(messages);
    console.log(chatHistory)
    fs.writeFileSync('messagehistory.txt', chatHistory, (err) => {
        //if (err) throw err;
        console.log('Error writing message history');
    })
}