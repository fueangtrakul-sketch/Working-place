import React, { useState } from 'react';
import { SupportedClient, VercelUser, VercelTeam, VercelProject } from '../types';
import { CLIENT_CONFIG_METADATA, generateConfigForClient } from '../utils/mcpConfigs';
import {
  Check,
  Copy,
  Download,
  Terminal,
  ExternalLink,
  Shield,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound
} from 'lucide-react';

interface ConnectWizardProps {
  user: VercelUser | null;
  token: string;
  setToken: (t: string) => void;
  teams: VercelTeam[];
  selectedTeam: string;
  setSelectedTeam: (t: string) => void;
  projects: VercelProject[];
  selectedProject: string;
  setSelectedProject: (p: string) => void;
  onVerifyToken: (tok: string) => Promise<boolean>;
  isVerifying: boolean;
  onUseSandbox: () => void;
  onSwitchToTools: () => void;
}

export const ConnectWizard: React.FC<ConnectWizardProps> = ({
  user,
  token,
  setToken,
  teams,
  selectedTeam,
  setSelectedTeam,
  projects,
  selectedProject,
  setSelectedProject,
  onVerifyToken,
  isVerifying,
  onUseSandbox,
  onSwitchToTools
}) => {
  const [selectedClient, setSelectedClient] = useState<SupportedClient>('cursor');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState<string>(token);
  const [useProjectScope, setUseProjectScope] = useState<boolean>(false);
  const [activeTabMethod, setActiveTabMethod] = useState<'cli' | 'config' | 'token'>('cli');

  const selectedTeamObj = teams.find(t => t.id === selectedTeam);
  const selectedProjObj = projects.find(p => p.id === selectedProject);

  const clientMeta = CLIENT_CONFIG_METADATA[selectedClient];
  const generated = generateConfigForClient(selectedClient, {
    token,
    teamSlug: selectedTeamObj?.slug || selectedTeam,
    projectSlug: selectedProjObj?.name || selectedProject,
    useProjectScope
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    const filename = selectedClient === 'cursor' ? 'mcp.json' :
      selectedClient === 'claude-desktop' ? 'claude_desktop_config.json' :
      selectedClient === 'windsurf' ? 'mcp_config.json' : 'mcp-config.json';
    const blob = new Blob([generated.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    await onVerifyToken(inputToken.trim());
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-xs text-neutral-300 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Official Vercel Model Context Protocol (MCP) Server</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Connect Vercel to Your AI Assistants
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed mb-6">
            Hook your local coding agents—like <span className="text-white font-medium">Cursor</span>, <span className="text-white font-medium">Claude Desktop</span>, <span className="text-white font-medium">Claude Code</span>, <span className="text-white font-medium">Windsurf</span>, and <span className="text-white font-medium">VS Code Copilot</span>—directly into Vercel’s infrastructure to debug deployment build logs, query analytics, and read documentation contextually.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTabMethod('cli')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTabMethod === 'cli'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Method 1: Vercel CLI (`vercel mcp`)</span>
            </button>

            <button
              onClick={() => setActiveTabMethod('config')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTabMethod === 'config'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Method 2: Client Config Snippets</span>
            </button>

            <button
              onClick={() => setActiveTabMethod('token')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTabMethod === 'token'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Method 3: Connect Account Token</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scope Settings Bar */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-neutral-800 text-neutral-200">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              MCP Server Endpoint
            </div>
            <div className="text-sm font-mono text-neutral-300 flex items-center space-x-2">
              <span>
                {useProjectScope && selectedTeamObj && selectedProjObj
                  ? `https://mcp.vercel.com/${selectedTeamObj.slug}/${selectedProjObj.name}`
                  : 'https://mcp.vercel.com'}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                {useProjectScope ? 'Project Scoped' : 'Global Scope'}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Scoping */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useProjectScope}
              onChange={(e) => setUseProjectScope(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-0"
            />
            <span>Scope to specific project</span>
          </label>

          {useProjectScope && (
            <div className="flex items-center space-x-2">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-neutral-900 text-xs text-neutral-200 border border-neutral-700 rounded-md px-2 py-1"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-neutral-900 text-xs text-neutral-200 border border-neutral-700 rounded-md px-2 py-1"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* METHOD 1: CLI */}
      {activeTabMethod === 'cli' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Recommended: Automatic CLI Setup</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Fastest
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Vercel includes a native CLI command that discovers your installed AI IDEs and automatically registers the remote MCP server with OAuth authentication.
              </p>

              {/* Terminal Box 1 */}
              <div className="space-y-2">
                <div className="text-xs text-neutral-400 font-medium">1. Run the interactive setup in any terminal:</div>
                <div className="relative group rounded-lg bg-black border border-neutral-800 p-3.5 font-mono text-xs text-neutral-200 flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold">$ <span className="text-neutral-100">vercel mcp</span></span>
                  <button
                    onClick={() => handleCopy('vercel mcp', 'cmd-basic')}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'cmd-basic' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terminal Box 2 */}
              <div className="space-y-2">
                <div className="text-xs text-neutral-400 font-medium">2. Or scope directly to your current project repository:</div>
                <div className="relative group rounded-lg bg-black border border-neutral-800 p-3.5 font-mono text-xs text-neutral-200 flex items-center justify-between">
                  <span className="text-cyan-400 font-semibold">$ <span className="text-neutral-100">vercel mcp --project</span></span>
                  <button
                    onClick={() => handleCopy('vercel mcp --project', 'cmd-project')}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'cmd-project' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terminal Box 3 */}
              <div className="space-y-2">
                <div className="text-xs text-neutral-400 font-medium">3. Non-interactive direct IDE configuration:</div>
                <div className="relative group rounded-lg bg-black border border-neutral-800 p-3.5 font-mono text-xs text-neutral-200 flex items-center justify-between">
                  <span className="text-purple-400 font-semibold">$ <span className="text-neutral-100">vercel mcp --clients &quot;Cursor,Claude Code&quot;</span></span>
                  <button
                    onClick={() => handleCopy('vercel mcp --clients "Cursor,Claude Code"', 'cmd-noninteractive')}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'cmd-noninteractive' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800/80 text-xs text-neutral-400 space-y-1">
                <div className="text-neutral-200 font-medium flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>What happens when you run this:</span>
                </div>
                <p>1. Authenticates your browser session with Vercel OAuth.</p>
                <p>2. Automatically locates your IDE settings files (e.g. Cursor or Claude).</p>
                <p>3. Writes the connection URL and enables instant tool execution.</p>
              </div>
            </div>
          </div>

          {/* Terminal Interactive Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl flex flex-col h-full">
              <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-neutral-400">Terminal — vercel mcp</span>
                <span className="w-6" />
              </div>

              <div className="p-4 font-mono text-xs space-y-2 text-neutral-300 bg-black flex-1 overflow-y-auto">
                <div className="text-neutral-500"># Run in your project root:</div>
                <div className="text-white">$ vercel mcp</div>
                <div className="text-neutral-400">Vercel CLI 39.2.0</div>
                <div className="text-cyan-400">? Select clients to configure:</div>
                <div className="text-emerald-400 pl-2">● [x] Cursor (~/.cursor/mcp.json)</div>
                <div className="text-emerald-400 pl-2">● [x] Claude Code (~/.claude.json)</div>
                <div className="text-neutral-500 pl-2">○ [ ] Claude Desktop</div>
                <div className="text-neutral-500 pl-2">○ [ ] Windsurf</div>
                <div className="text-neutral-400 mt-2">Authenticating with Vercel... <span className="text-emerald-400">Done</span></div>
                <div className="text-neutral-300">Target server: <span className="text-yellow-400">https://mcp.vercel.com</span></div>
                <div className="text-emerald-400 font-semibold mt-1">✓ Successfully configured 2 MCP clients.</div>
                <div className="text-neutral-500 mt-1">Restart Cursor / Claude to activate Vercel tools!</div>
              </div>

              <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Want to test the tools immediately?</span>
                <button
                  onClick={onSwitchToTools}
                  className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center space-x-1"
                >
                  <span>Open Tool Playground</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 2: CONFIG GENERATOR */}
      {activeTabMethod === 'config' && (
        <div className="space-y-6">
          {/* Client Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CLIENT_CONFIG_METADATA) as SupportedClient[]).map((clientId) => {
              const meta = CLIENT_CONFIG_METADATA[clientId];
              const isSelected = selectedClient === clientId;
              return (
                <button
                  key={clientId}
                  onClick={() => setSelectedClient(clientId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                    isSelected
                      ? 'bg-neutral-800 text-white border-neutral-600 shadow-md'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span>{meta.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                    {meta.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Config Instructions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Configuring {clientMeta.name}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {clientMeta.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-300">Configuration File Locations:</div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      <span className="text-neutral-500 block text-[10px] uppercase font-sans">macOS:</span>
                      {clientMeta.filePathMacOS}
                    </div>
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      <span className="text-neutral-500 block text-[10px] uppercase font-sans">Windows:</span>
                      {clientMeta.filePathWindows}
                    </div>
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      <span className="text-neutral-500 block text-[10px] uppercase font-sans">Linux:</span>
                      {clientMeta.filePathLinux}
                    </div>
                  </div>
                </div>

                {generated.command && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-neutral-300">Quick CLI Alternative:</div>
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-cyan-400">
                      <span className="truncate">{generated.command}</span>
                      <button
                        onClick={() => handleCopy(generated.command || '', 'cmd-client')}
                        className="ml-2 p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                      >
                        {copiedKey === 'cmd-client' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-800">
                  <a
                    href={clientMeta.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    <span>View official {clientMeta.name} MCP docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Code Box */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col h-full">
                <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-neutral-300 font-semibold">
                      {selectedClient === 'cursor' ? 'mcp.json' :
                       selectedClient === 'claude-desktop' ? 'claude_desktop_config.json' :
                       selectedClient === 'windsurf' ? 'mcp_config.json' :
                       selectedClient === 'ai-sdk' ? 'route.ts' : 'config.json'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                      {generated.language}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(generated.content, 'code-box')}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center space-x-1 transition-colors"
                    >
                      {copiedKey === 'code-box' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    {generated.language === 'json' && (
                      <button
                        onClick={handleDownload}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center space-x-1 transition-colors"
                        title="Download JSON file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-black font-mono text-xs text-neutral-300 overflow-x-auto flex-1 leading-relaxed">
                  <pre>{generated.content}</pre>
                </div>

                <div className="px-4 py-2.5 bg-neutral-900/60 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>After updating config, restart your client or run &quot;Reload Window&quot;.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 3: CONNECT VERCEL ACCESS TOKEN */}
      {activeTabMethod === 'token' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Connect with Vercel Personal Access Token</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Provide your Vercel Access Token to test live deployments, execute real MCP tools, and inspect deployment logs directly within this studio.
                </p>
              </div>

              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Vercel Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="e.g. 7q8w9e0r..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-neutral-500">
                      Tokens are stored in-memory during this session only.
                    </span>
                    <a
                      href="https://vercel.com/account/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <span>Create Token in Vercel Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying || !inputToken.trim()}
                    className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isVerifying ? 'Verifying with Vercel API...' : 'Verify & Connect Token'}
                  </button>

                  <button
                    type="button"
                    onClick={onUseSandbox}
                    className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold transition-colors flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try Sandbox Developer Account</span>
                  </button>
                </div>
              </form>

              {user && (
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div className="text-xs">
                      <span className="text-emerald-300 font-medium">Currently connected as: </span>
                      <span className="text-white font-mono font-semibold">{user.username}</span>
                      <span className="text-emerald-400/80 ml-1.5">({user.email})</span>
                    </div>
                  </div>
                  <button
                    onClick={onSwitchToTools}
                    className="text-xs font-medium text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Inspect Tools</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-white text-sm font-semibold">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Security & Permissions</span>
              </div>
              <ul className="text-xs text-neutral-400 space-y-2 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>OAuth & Token Isolation:</strong> The official <code className="text-neutral-300">mcp.vercel.com</code> server adheres to standard OAuth token exchange and respects team role privileges.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Read vs Mutate:</strong> MCP assistants can inspect error logs and configuration without altering production traffic unless specifically authorized.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Project Isolation:</strong> By passing <code className="text-neutral-300">--project</code>, tools are restricted only to the current repo repository.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Automated Error Log Retrieval</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            When a preview or production deployment fails, your AI assistant can query real-time build logs via MCP, detect the exact root cause, and write the fix in your IDE.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-cyan-400">
            <Server className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Live Web Analytics & Insights</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Ask Claude or Cursor to &quot;check my visitor traffic over the last 7 days&quot; or &quot;compare latency on our checkout routes&quot; using Vercel Web Analytics tools.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Zero Configuration Switching</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Works out of the box with personal hobby accounts and large enterprise teams with multiple microservices, monorepos, and subdomains.
          </p>
        </div>
      </div>
    </div>
  );
};
