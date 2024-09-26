import { ChromaClient } from "chromadb";
import fs from "fs";

const client = new ChromaClient({ path: "http://localhost:8000" });

let collection = await client.getOrCreateCollection({ name: "testCollection" });

console.log(collection);

fs.readFile('contextfile.txt', (err, data) => {
    if (err) throw err;
    console.log(data.toString().split(',').map((x) => parseInt(x)));
})