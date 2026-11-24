import React from 'react';
import { Shield, Cpu, Cloud, Terminal, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span>Vercel MCP Architecture, Security & Scoping Guide</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          How Model Context Protocol operates between your local development environment and Vercel cloud infrastructure.
        </p>
      </div>

      {/* Visual Architectural Flow */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center">
          Vercel MCP Communication Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Node 1 */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-center">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white">AI Client / IDE</div>
            <p className="text-xs text-neutral-400">
              Cursor, Claude Desktop, Claude Code, Windsurf, or VS Code Copilot.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 bg-neutral-950 p-1.5 rounded border border-neutral-800">
              JSON-RPC 2.0 (stdio or SSE)
            </div>
          </div>

          {/* Node 2 */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 space-y-2 text-center relative">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-700 flex items-center justify-center mx-auto text-cyan-300">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white">Vercel MCP Server</div>
            <p className="text-xs text-neutral-400">
              Hosted securely at <code className="text-neutral-200">https://mcp.vercel.com</code>. Handles OAuth & tool catalog.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 bg-neutral-950 p-1.5 rounded border border-neutral-800">
              OAuth 2.0 / Bearer Auth
            </div>
          </div>

          {/* Node 3 */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-center">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white">Vercel Cloud Resources</div>
            <p className="text-xs text-neutral-400">
              Build log pipelines, Edge network, Serverless functions, Web Analytics, DNS.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950 p-1.5 rounded border border-neutral-800">
              Vercel REST API v6/v9
            </div>
          </div>
        </div>
      </div>

      {/* Two Scopes: Global vs Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <h4 className="text-sm font-bold text-white">Global Account Scope</h4>
          </div>
          <div className="text-xs font-mono text-neutral-300 bg-neutral-900 p-2 rounded border border-neutral-800">
            https://mcp.vercel.com
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Grants your AI assistant visibility across all teams and projects permitted by your token. Best for multi-project workflows where you want your agent to query various microservices or compare deployments.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <h4 className="text-sm font-bold text-white">Project Isolated Scope</h4>
          </div>
          <div className="text-xs font-mono text-neutral-300 bg-neutral-900 p-2 rounded border border-neutral-800">
            https://mcp.vercel.com/&lt;team&gt;/&lt;project&gt;
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Configured automatically when running <code className="text-neutral-300">vercel mcp --project</code>. Restricts tool queries exclusively to the specific repository, preventing cross-project pollution in AI context windows.
          </p>
        </div>
      </div>

      {/* Common Troubleshooting FAQ */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Common MCP Setup Troubleshooting</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
            <div className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>&quot;MCP server disconnected&quot; or red status in Cursor</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ensure you restarted Cursor completely or ran <code className="text-neutral-300">Developer: Reload Window</code> from the command palette. If using a personal token, confirm it has not expired in your Vercel Dashboard.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Tools not showing in Claude Desktop</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Claude Desktop reads <code className="text-neutral-300">claude_desktop_config.json</code> on cold boot only. Ensure the JSON syntax is valid with no trailing commas and restart Claude Desktop completely.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
            <div className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Token Permissions & RBAC</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Vercel MCP respects team roles. If your user is a &quot;Viewer&quot; on an enterprise team, MCP tools will only perform read operations (logs, project specs) and cannot trigger deployments or modify environment variables.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Using with Vercel AI SDK</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You can integrate Vercel MCP into custom web apps using <code className="text-neutral-300">@ai-sdk/mcp</code>. The model will automatically invoke MCP tools during <code className="text-neutral-300">streamText</code> multi-step workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
