import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' })

const context = [];

const output = await ollama.generate({
    model: "umbra-v0.2",
    prompt: "why is the sky blue?",
    stream: true
})

for await (const part of output) {
    process.stdout.write(part.response);

    if (part.done === true) {
        console.log(`first generate complete`);
        context.push(...part.context);
    }
}

const output2 = await ollama.generate({
    model: "umbra-v0.3",
    prompt: "can it be another?",
    context: context
})
console.log(output2.response);