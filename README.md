# DevBoard X 🚀

DevBoard X is a centralized, terminal-native dashboard designed for builders. It provides an isolated environment to execute code, manage complex project workflows, and orchestrate deployments seamlessly in a fully integrated workspace.

## ✨ Features

- **Project Management**: Organize tasks, resources, and project scopes in one dashboard.
- **Task Editor & Workspace**: An integrated code editor (Monaco) and workspace interface for handling project files and sandbox execution.
- **Isolated Snippets**: Save, manage, and duplicate code snippets to be used securely across your workflows.
- **Terminal-Native Theme**: A sleek, dark-mode first design crafted with a custom Tailwind CSS v4 setup.
- **Real-time Synchronization**: Powered by Convex to ensure your tasks and project analytics update instantaneously across all sessions.
- **Robust Authentication**: Secured entirely by Clerk with GitHub OAuth integration.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Backend & Database**: [Convex](https://www.convex.dev/)
- **Authentication**: [Clerk](https://clerk.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: Framer Motion, Lucide React, Recharts

## 🚀 Getting Started

Follow these steps to set up DevBoard X locally on your machine.

### Prerequisites
Make sure you have Node.js installed.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/devboard-x.git
cd "DevBoard X/devboard-x"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the `devboard-x` directory and add the following keys:
```env
# Convex URL (Run `npx convex dev` to generate this automatically)
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_ISSUER_URL=your_clerk_issuer_url

# GitHub OAuth Integration (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN_ENCRYPTION_KEY=a_32_character_encryption_key
```

### 4. Start the Development Server
You need to run both Next.js and Convex concurrently.

Terminal 1 (Convex Backend):
```bash
npx convex dev
```

Terminal 2 (Next.js Frontend):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🚢 Deployment

The easiest way to deploy DevBoard X is to use [Vercel](https://vercel.com).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Install the **Convex Vercel Integration** from the Vercel marketplace to automatically link your production database.
4. Add your Clerk environment variables to Vercel's settings.
5. Hit **Deploy**!

## 🛡️ Danger Zone
DevBoard X includes a built-in *Danger Zone* in the settings page to wipe all projects, tasks, and code from the application if you ever need a clean slate. Use it carefully!

---

*Designed & built with 💚 for the modern developer.*
