import React, { useState } from 'react';
import { Terminal, Send, Check, Copy, Code, Sparkles, RefreshCw } from 'lucide-react';

export const ProtocolInspector: React.FC = () => {
  const [method, setMethod] = useState<'initialize' | 'tools/list' | 'tools/call'>('initialize');
  const [toolName, setToolName] = useState<string>('list_projects');
  const [customPayload, setCustomPayload] = useState<string>(
    JSON.stringify(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'Cursor-Composer', version: '0.45.0' }
        }
      },
      null,
      2
    )
  );
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (presetMethod: 'initialize' | 'tools/list' | 'tools/call') => {
    setMethod(presetMethod);
    let payload: any = {};
    if (presetMethod === 'initialize') {
      payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'Claude-Desktop', version: '1.2.0' }
        }
      };
    } else if (presetMethod === 'tools/list') {
      payload = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
    } else if (presetMethod === 'tools/call') {
      payload = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: { limit: 5 }
        }
      };
    }
    setCustomPayload(JSON.stringify(payload, null, 2));
  };

  const handleSendRpc = async () => {
    setIsSending(true);
    setResponseOutput(null);
    try {
      let parsed = JSON.parse(customPayload);
      const res = await fetch('/api/mcp/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setResponseOutput(data);
    } catch (err: any) {
      setResponseOutput({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${err.message}` }
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Code className="w-6 h-6 text-purple-400" />
          <span>MCP JSON-RPC 2.0 Protocol Frame Inspector</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Inspect raw Model Context Protocol handshakes, tool listing schemas, and frame execution payloads between your AI client and <code className="text-neutral-300">mcp.vercel.com</code>.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-400 font-semibold mr-1">Presets:</span>
        <button
          onClick={() => handleSelectPreset('initialize')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
            method === 'initialize'
              ? 'bg-neutral-800 text-white border-neutral-600'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          initialize (Handshake)
        </button>
        <button
          onClick={() => handleSelectPreset('tools/list')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
            method === 'tools/list'
              ? 'bg-neutral-800 text-white border-neutral-600'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          tools/list (Tool Catalog)
        </button>
        <button
          onClick={() => handleSelectPreset('tools/call')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
            method === 'tools/call'
              ? 'bg-neutral-800 text-white border-neutral-600'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          tools/call (Execute)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Frame */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col">
          <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-200">
              Client Request Frame (JSON-RPC 2.0)
            </span>
            <button
              onClick={handleSendRpc}
              disabled={isSending}
              className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send Frame'}</span>
            </button>
          </div>

          <div className="p-3 bg-black flex-1">
            <textarea
              rows={14}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              className="w-full h-full bg-transparent font-mono text-xs text-neutral-200 resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Response Frame */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col">
          <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-200">
              Server Response Frame
            </span>
            {responseOutput && (
              <button
                onClick={handleCopy}
                className="px-2 py-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs flex items-center space-x-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-4 bg-black font-mono text-xs text-neutral-300 flex-1 overflow-auto max-h-[420px] leading-relaxed">
            {isSending ? (
              <div className="text-neutral-500 py-6">Transmitting JSON-RPC frame...</div>
            ) : responseOutput ? (
              <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
            ) : (
              <div className="text-neutral-500 py-6">
                Click &quot;Send Frame&quot; to execute this JSON-RPC handshake against the local MCP server endpoint.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
