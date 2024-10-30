# llamaRPG
local llm ai RPG game
local npc agents

get ollama:

curl -fsSL https://ollama.com/install.sh | sh

ollama run llama3.2:latest

or switch model to what ever you want: 

 const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2:latest',
                    prompt: prompt,
                    stream: false,
                    temperature: 0.7,
                    system: "You are a logic engine that only responds with valid JSON objects. Never include explanations or additional text."
                })
            });

run:

node index.js

with errors?

npm init -y
npm install chalk
node index.js

