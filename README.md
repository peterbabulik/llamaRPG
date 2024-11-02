```ascii
 ╔═══════════════════════════════════════╗
 ║             🎮 LlamaRPG 🎮            ║
 ║     Local LLM-Powered RPG Adventure   ║
 ╚═══════════════════════════════════════╝
```

[listen to notebookLM about project](https://notebooklm.google.com/notebook/deffedb1-a968-438c-b613-e7f9ac845cd4/audio)


# 🚀 Quick Start 

## Windows
```bash
download ollama from ollama.com
in command line run:
ollama run llama3.2:latest
```


## Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama3.2:latest
```


## Android
```bash
install termux from app store.
in termux run this command:

apt install proot-distro
proot-distro install ubuntu
proot-distro login ubuntu

curl -fsSL https://ollama.com/install.sh | sh
ollama serve

now open new terminal (swipe from left and click on + icon)
in new terminal run:

proot-distro login ubuntu
ollama run llama3.2:latest
```

## 🔧 you can change llama3.2:latest to other ollama model in /src/npc.js 
```javascript
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
```

## 🏃‍♂️ Run the Game
```bash
# Initialize project
npm init -y
npm install chalk
npm install node-fetch

# Start adventure
node index.js
```

```ascii
  ⚔️  Happy Gaming! ⚔️
```
