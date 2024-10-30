```ascii
 ╔═══════════════════════════════════════╗
 ║             🎮 LlamaRPG 🎮            ║
 ║     Local LLM-Powered RPG Adventure   ║
 ╚═══════════════════════════════════════╝
```

# 🚀 Quick Start Windows

## Windows
```bash
download ollama from ollama.com
in command line run:
ollama run llama3.2:latest
```
# 🚀 Quick Start Linux

## Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama3.2:latest
```
# 🚀 Quick Start Android

## Android
```bash
install termux from app store.
in termux run this command:

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

# Start adventure
node index.js
```

```ascii
  ⚔️  Happy Gaming! ⚔️
```
