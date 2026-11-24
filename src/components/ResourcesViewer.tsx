import React, { useState } from 'react';
import { VercelProject, VercelDeployment, DeploymentLog } from '../types';
import {
  FolderGit2,
  Rocket,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  Bug
} from 'lucide-react';

interface ResourcesViewerProps {
  projects: VercelProject[];
  deployments: VercelDeployment[];
  selectedDeployment: VercelDeployment | null;
  setSelectedDeployment: (d: VercelDeployment) => void;
  logs: DeploymentLog[];
  isLoadingLogs: boolean;
  onRefreshLogs: (id: string) => void;
  token: string;
}

export const ResourcesViewer: React.FC<ResourcesViewerProps> = ({
  projects,
  deployments,
  selectedDeployment,
  setSelectedDeployment,
  logs,
  isLoadingLogs,
  onRefreshLogs,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'deployments' | 'projects'>('deployments');
  const [searchQuery, setSearchQuery] = useState('');

  const currentDep = selectedDeployment || deployments[0];

  const filteredDeployments = deployments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            <span>Vercel Projects & Deployment Log Inspector</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Browse linked infrastructure that your MCP client queries. Inspect build error logs to see how AI assistants debug deployments automatically.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter deployments or projects..."
              className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 w-56 font-mono"
            />
          </div>

          <div className="flex rounded-lg bg-neutral-900 p-1 border border-neutral-800">
            <button
              onClick={() => setActiveTab('deployments')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'deployments'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Deployments
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Projects ({projects.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'deployments' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deployments List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
              Recent Deployments ({filteredDeployments.length})
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredDeployments.map((dep) => {
                const isSelected = currentDep?.uid === dep.uid;
                const isError = dep.state === 'ERROR';
                const isReady = dep.state === 'READY';

                return (
                  <button
                    key={dep.uid}
                    onClick={() => setSelectedDeployment(dep)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-neutral-900 border-neutral-600 shadow-md ring-1 ring-neutral-600'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-mono">{dep.name}</span>
                        <span className="text-[10px] font-mono text-neutral-400">{dep.uid}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1 ${
                          isReady
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isError
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isReady ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                        <span>{dep.state}</span>
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono truncate mb-2">
                      https://{dep.url}
                    </div>

                    {dep.meta?.githubCommitMessage && (
                      <div className="text-[11px] text-neutral-400 line-clamp-1 italic bg-neutral-900/60 p-1.5 rounded border border-neutral-800/80">
                        &quot;{dep.meta.githubCommitMessage}&quot;
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Log Console & AI MCP Debugger */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-white">
                      Build & Runtime Logs: {currentDep?.uid}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Fetched via MCP tool: <code className="text-cyan-400">get_deployment_logs</code>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => currentDep && onRefreshLogs(currentDep.uid)}
                    className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Refresh logs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Logs Content */}
              <div className="p-4 bg-black font-mono text-xs text-neutral-300 space-y-1.5 overflow-y-auto max-h-96 min-h-[280px]">
                {isLoadingLogs ? (
                  <div className="flex items-center space-x-2 text-neutral-500 py-6">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
                    <span>Streaming logs from Vercel infrastructure...</span>
                  </div>
                ) : logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-2 leading-relaxed ${
                        log.type === 'stderr' ? 'text-rose-400 font-semibold' : 'text-neutral-300'
                      }`}
                    >
                      <span className="text-neutral-600 select-none text-[10px] pt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{log.text}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 py-6">No build logs available for this deployment.</div>
                )}
              </div>

              {/* AI Assistant Context Highlight */}
              {currentDep?.state === 'ERROR' && (
                <div className="p-4 bg-rose-950/20 border-t border-rose-900/30 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                    <Bug className="w-4 h-4" />
                    <span>How Claude / Cursor Resolves This Error via MCP:</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Because your IDE is connected to <code className="text-rose-300">mcp.vercel.com</code>, when this build fails, you can prompt in Cursor Composer: <strong className="text-white">&quot;Why did my last deployment fail and how do I fix it?&quot;</strong> The AI calls <code className="text-cyan-400">get_deployment_logs</code>, diagnoses the 50MB bundle size limit, and modifies your Next.js config to externalize heavy packages!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Projects List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white font-mono">{proj.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase font-mono">
                  {proj.framework || 'nextjs'}
                </span>
              </div>

              {proj.latestDeployment && (
                <div className="space-y-1 text-xs">
                  <span className="text-neutral-500 text-[11px] block">Production URL:</span>
                  <a
                    href={`https://${proj.latestDeployment.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-mono truncate flex items-center space-x-1"
                  >
                    <span>{proj.latestDeployment.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}

              {proj.domains && proj.domains.length > 0 && (
                <div className="space-y-1">
                  <span className="text-neutral-500 text-[11px] block">Domains:</span>
                  <div className="flex flex-wrap gap-1">
                    {proj.domains.map((dom) => (
                      <span
                        key={dom}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 font-mono"
                      >
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
