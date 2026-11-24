import React, { useState } from 'react';
import { McpTool, VercelProject, VercelDeployment } from '../types';
import {
  Play,
  Copy,
  Check,
  Search,
  Clock,
  Terminal,
  Code2,
  FileText,
  Boxes,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ToolsPlaygroundProps {
  tools: McpTool[];
  token: string;
  projects: VercelProject[];
  deployments: VercelDeployment[];
}

export const ToolsPlayground: React.FC<ToolsPlaygroundProps> = ({
  tools,
  token,
  projects,
  deployments
}) => {
  const [selectedToolName, setSelectedToolName] = useState<string>('search_documentation');
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({
    query: 'Edge Middleware routing'
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionLatency, setExecutionLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const selectedTool = tools.find(t => t.name === selectedToolName) || tools[0];

  const categories = ['All', ...Array.from(new Set(tools.map(t => t.category)))];

  const handleSelectTool = (tool: McpTool) => {
    setSelectedToolName(tool.name);
    setExecutionResult(null);

    // Populate smart default args
    switch (tool.name) {
      case 'search_documentation':
        setToolArgs({ query: 'Server Actions streaming and caching', topic: 'frameworks' });
        break;
      case 'list_projects':
        setToolArgs({ limit: 10 });
        break;
      case 'get_project':
        setToolArgs({ projectId: projects[0]?.name || 'nebula-ai-app' });
        break;
      case 'list_deployments':
        setToolArgs({ limit: 5 });
        break;
      case 'get_deployment_logs':
        setToolArgs({ deploymentId: deployments.find(d => d.state === 'ERROR')?.uid || deployments[0]?.uid || 'dpl_1f2e3d4c5b6a' });
        break;
      case 'query_web_analytics':
        setToolArgs({ projectId: projects[0]?.name || 'nebula-ai-app', timeframe: '24h' });
        break;
      case 'get_project_env':
        setToolArgs({ projectId: projects[0]?.name || 'nebula-ai-app' });
        break;
      case 'list_domains':
        setToolArgs({ projectId: projects[0]?.name || 'nebula-ai-app' });
        break;
      default:
        setToolArgs({});
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool.name,
          args: toolArgs,
          token
        })
      });
      const data = await res.json();
      setExecutionResult(data);
      setExecutionLatency(data.executionDurationMs || 32);
    } catch (err: any) {
      setExecutionResult({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTools = filterCategory === 'All'
    ? tools
    : tools.filter(t => t.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span>Vercel MCP Tools Catalog & Playground</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Test the exact tools that Claude, Cursor, and Windsurf execute when communicating with <code className="text-neutral-300">mcp.vercel.com</code>.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool List Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            Available Tools ({filteredTools.length})
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredTools.map((tool) => {
              const isSelected = selectedTool.name === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-white">
                      {tool.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Execution Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white font-mono">{selectedTool.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
                    {selectedTool.category}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Calling MCP...' : 'Execute Tool'}</span>
              </button>
            </div>

            {/* Parameter Fields */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-300">Tool Parameters (JSON-RPC Input):</div>

              {selectedTool.parameters.properties && Object.keys(selectedTool.parameters.properties).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedTool.parameters.properties).map(([propName, propDef]) => {
                    const isRequired = selectedTool.parameters.required?.includes(propName);
                    return (
                      <div key={propName} className="space-y-1">
                        <label className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
                          <span>
                            {propName} {isRequired && <span className="text-rose-400">*</span>}
                          </span>
                          <span className="text-neutral-500 text-[10px]">{propDef.type}</span>
                        </label>

                        {propDef.enum ? (
                          <select
                            value={toolArgs[propName] || propDef.enum[0]}
                            onChange={(e) => setToolArgs({ ...toolArgs, [propName]: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            {propDef.enum.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : propName === 'deploymentId' ? (
                          <select
                            value={toolArgs[propName] || ''}
                            onChange={(e) => setToolArgs({ ...toolArgs, [propName]: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            {deployments.map((d) => (
                              <option key={d.uid} value={d.uid}>
                                {d.uid} ({d.name} - {d.state})
                              </option>
                            ))}
                          </select>
                        ) : propName === 'projectId' ? (
                          <select
                            value={toolArgs[propName] || ''}
                            onChange={(e) => setToolArgs({ ...toolArgs, [propName]: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name} ({p.id})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={propDef.type === 'number' ? 'number' : 'text'}
                            value={toolArgs[propName] ?? ''}
                            onChange={(e) =>
                              setToolArgs({
                                ...toolArgs,
                                [propName]: propDef.type === 'number' ? Number(e.target.value) : e.target.value
                              })
                            }
                            placeholder={propDef.description}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        )}
                        {propDef.description && (
                          <p className="text-[10px] text-neutral-500">{propDef.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
                  This tool accepts optional parameters or no arguments.
                </div>
              )}
            </div>

            {/* Response Output Box */}
            <div className="rounded-lg border border-neutral-800 bg-black overflow-hidden flex flex-col">
              <div className="bg-neutral-900/80 px-3.5 py-2 border-b border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-neutral-300 font-medium">Tool Call Output</span>
                  {executionLatency !== null && (
                    <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{executionLatency}ms</span>
                    </span>
                  )}
                </div>

                {executionResult && (
                  <button
                    onClick={handleCopyResult}
                    className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy JSON</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="p-4 font-mono text-xs text-neutral-300 max-h-72 overflow-y-auto leading-relaxed">
                {isExecuting ? (
                  <div className="flex items-center space-x-2 text-neutral-400 py-4">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                    <span>Executing Model Context Protocol call on mcp.vercel.com...</span>
                  </div>
                ) : executionResult ? (
                  <pre>{JSON.stringify(executionResult, null, 2)}</pre>
                ) : (
                  <div className="text-neutral-500 py-4">
                    Click &quot;Execute Tool&quot; above to run this Vercel MCP capability and view structured output.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
