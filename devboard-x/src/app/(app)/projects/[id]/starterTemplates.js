// Task starter template definitions

const templates = {
  HTML: [
    {
      name: "index.html",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML/CSS/JS Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header style="text-align: center; padding: 20px; background: #2563eb; color: white; border-radius: 8px;">
    <h1>Web Starter Project</h1>
  </header>
  <main style="max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p id="message" style="font-size: 1.1rem; color: #4b5563;">Loading script...</p>
    <button id="btn" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Click Me</button>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
      output: ""
    },
    {
      name: "style.css",
      code: `body {
  background-color: #f3f4f6;
  color: #1f2937;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
}
main {
  text-align: center;
}`,
      output: ""
    },
    {
      name: "app.js",
      code: `document.addEventListener('DOMContentLoaded', () => {
  const msg = document.getElementById('message');
  const btn = document.getElementById('btn');
  
  msg.textContent = "Hello! JavaScript is fully connected and working.";
  
  btn.addEventListener('click', () => {
    console.log("Button clicked!");
    msg.textContent = "You clicked the button! Console logged a message.";
  });
  
  console.log("Web project initialized successfully.");
});`,
      output: ""
    },
    {
      name: "assets",
      isFolder: true,
      children: []
    }
  ],

  React: [
    {
      name: "package.json",
      code: `{
  "name": "react-starter",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
      output: ""
    },
    {
      name: "src",
      isFolder: true,
      children: [
        {
          name: "components",
          isFolder: true,
          children: []
        },
        {
          name: "App.jsx",
          code: `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#61dafb', padding: '20px', borderRadius: '12px', color: '#20232a' }}>
        <h1 style={{ margin: 0 }}>Hello, React!</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Welcome to your live React simulation.</p>
      </div>
      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3>Interactive Component</h3>
        <p>Edit src/App.jsx text contents to dynamically see updates here!</p>
      </div>
    </div>
  );
}`,
          output: ""
        },
        {
          name: "main.jsx",
          code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          output: ""
        },
        {
          name: "index.css",
          code: `body {
  margin: 0;
  background-color: #fafafa;
  color: #333;
}`,
          output: ""
        }
      ]
    },
    {
      name: "public",
      isFolder: true,
      children: []
    }
  ],

  "Next.js": [
    {
      name: "package.json",
      code: `{
  "name": "nextjs-starter",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
      output: ""
    },
    {
      name: "next.config.js",
      code: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig`,
      output: ""
    },
    {
      name: "app",
      isFolder: true,
      children: [
        {
          name: "components",
          isFolder: true,
          children: []
        },
        {
          name: "layout.js",
          code: `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  )
}`,
          output: ""
        },
        {
          name: "page.js",
          code: `export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to Next.js App Router!</h1>
      <p>This is a starter Next.js project layout structure.</p>
    </main>
  )
}`,
          output: ""
        }
      ]
    }
  ],

  "Node.js": [
    {
      name: "package.json",
      code: `{
  "name": "nodejs-basic",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`,
      output: ""
    },
    {
      name: "index.js",
      code: `console.log("Initializing Node.js Task Application...");
const a = 12;
const b = 30;
console.log(\`Calculated sum is: \${a + b}\`);`,
      output: ""
    },
    {
      name: "routes",
      isFolder: true,
      children: []
    },
    {
      name: "controllers",
      isFolder: true,
      children: []
    }
  ],

  Express: [
    {
      name: "package.json",
      code: `{
  "name": "express-server",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}`,
      output: ""
    },
    {
      name: "server.js",
      code: `const express = require('express');
const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.send('Express Development Server Running.');
});

app.listen(PORT, () => {
  console.log(\`Server listening on http://localhost:\${PORT}\`);
});`,
      output: ""
    },
    {
      name: "routes",
      isFolder: true,
      children: []
    },
    {
      name: "controllers",
      isFolder: true,
      children: []
    },
    {
      name: "middleware",
      isFolder: true,
      children: []
    }
  ]
}

export function getTemplateFiles(templateName) {
  const template = templates[templateName] || templates.HTML
  // Deep clone the template object so tasks don't share instances
  return JSON.parse(JSON.stringify(template))
}
