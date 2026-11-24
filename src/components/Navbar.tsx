import React from 'react';
import { VercelUser } from '../types';
import { ShieldCheck, Sparkles, Terminal, Activity, Key, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'connect' | 'tools' | 'resources' | 'inspector' | 'architecture';
  setActiveTab: (tab: 'connect' | 'tools' | 'resources' | 'inspector' | 'architecture') => void;
  user: VercelUser | null;
  isSandbox: boolean;
  onOpenConnectModal: () => void;
  onDisconnect: () => void;
  latencyMs: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isSandbox,
  onOpenConnectModal,
  onDisconnect,
  latencyMs,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              {/* Vercel Geometric Triangle Logo */}
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shadow-inner">
                <svg
                  className="w-4 h-4 text-white fill-current"
                  viewBox="0 0 76 65"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-bold tracking-tight text-white text-base">Vercel</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                  MCP
                </span>
              </div>
            </div>

            {/* MCP Server Live Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">mcp.vercel.com</span>
              {latencyMs !== null && (
                <span className="text-neutral-500 font-mono text-[10px]">
                  ({latencyMs}ms)
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('connect')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'connect'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Connect & Setup
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'tools'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              MCP Tools
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Live Resources & Logs
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'inspector'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              JSON-RPC 2.0
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Architecture
            </button>
          </nav>

          {/* User Account / Connection Status */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-full pl-1 pr-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden text-xs font-semibold text-neutral-200">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-neutral-200 leading-none">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-neutral-400 leading-none mt-0.5">
                      {isSandbox ? 'Sandbox Mode' : 'Connected Vercel Token'}
                    </span>
                  </div>
                  {isSandbox && (
                    <span className="ml-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                      DEMO
                    </span>
                  )}
                </div>

                <button
                  onClick={onDisconnect}
                  title="Disconnect account"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenConnectModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white text-black hover:bg-neutral-200 font-medium text-xs transition-colors shadow-sm"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Connect Token</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-2 border-t border-neutral-800/60 no-scrollbar">
          {(['connect', 'tools', 'resources', 'inspector', 'architecture'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:bg-neutral-900'
              }`}
            >
              {tab === 'connect' && 'Connect & Setup'}
              {tab === 'tools' && 'MCP Tools'}
              {tab === 'resources' && 'Resources & Logs'}
              {tab === 'inspector' && 'JSON-RPC'}
              {tab === 'architecture' && 'Architecture'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
