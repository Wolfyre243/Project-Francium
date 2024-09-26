import readline from 'readline-sync';
import { ChromaClient } from "chromadb";
import { Ollama } from 'ollama';
import fs from 'fs';

const client = new ChromaClient({ path: "http://localhost:8000" });
const ollama = new Ollama({ host: 'http://localhost:11434' })

let collection = await client.getOrCreateCollection({ name: "testCollection" });

let exit = false;
let context = [];
fs.readFile('contextfile.txt', (err, data) => {
    if (err) throw err;
    context = data.toString().split(',').map((x) => parseInt(x));
    //console.log(context);
})

while (!exit) {
    const userInput = readline.question('You:\n> ');
    if (userInput == 'exit') {
        console.log(context);
        fs.writeFile('contextfile.txt', context.toString(), (err) => {
            if (err) throw err;
            console.log('contextfile.txt has been created!');
        })
        exit = true;
    } else {

        // TODO: Implement embedding system
        /*
        const queryembed = (await ollama.embed({
            model: "nomic-embed-text",
            input: userInput
        })).embeddings[0]; */

        const relatedResources = (await collection.query({
            queryTexts: userInput,
            nResults: 3
        }));

        //console.log(relatedResources)

        //const prompt = userInput + " - Answer that question, using the following as extra resources: " + relatedResources;
        //console.log(prompt);

        /*
        const result = await fetch("http://localhost:11434/api/generate", {
            method: 'POST',
            body: JSON.stringify({
                model: "umbra-v0.2",
                prompt: `${userInput} - Answer that question, using the following as optional, extra resources: ${relatedResources}. Treat them as supplementary resources and you should never forcefully use them. Ignore them if you deem them irrelevant.`,
                stream: false,
                context: context
            }),
        });
        */

        const result = await ollama.generate({
            model: "umbra-v0.4",
            prompt: `${userInput} - Answer that question, using the following as optional, extra resources: ${relatedResources.documents[0]}. Treat them as supplementary resources and you should never forcefully use them. Ignore them if you deem them irrelevant. Do not verbosely describe how you ignored them.`,
            context: context,
            stream: true,
            keep_alive: "30m"
        })

        for await (const part of result) {
            process.stdout.write(part.response);
            if (part.done === true) {
                console.log("\n");
                context.push(...part.context);
            }
        }

        /*
        const resultJSON = await result.json();
        context = context.concat(resultJSON.context);

        console.log(resultJSON.response, "\n");
        */
    }
}

