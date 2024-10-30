```ascii
 ╔═══════════════════════════════════════╗
 ║             🎮 LlamaRPG 🎮            ║
 ║     Local LLM-Powered RPG Adventure   ║
 ╚═══════════════════════════════════════╝
```

# 🚀 Quick Start

## Install Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama2:latest
```

## 🔧 Configuration
```javascript
const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'llama2:latest',
        prompt: prompt,
        stream: false,
        temperature: 0.7,
        system: "You are a logic engine that only responds with valid JSON objects."
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
     \             /
      \  |  |  |  /
       \_________/
         |     |
         |_____|
```
