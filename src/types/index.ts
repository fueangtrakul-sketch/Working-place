export interface McpTool {
  name: string;
  category: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface VercelUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface VercelTeam {
  id: string;
  name: string;
  slug: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  updatedAt: number;
  latestDeployment?: {
    id: string;
    url: string;
    readyState: 'READY' | 'BUILDING' | 'ERROR' | 'CANCELED' | 'QUEUED';
    createdAt: number;
    commitMessage?: string;
  };
  domains?: string[];
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'READY' | 'BUILDING' | 'ERROR' | 'CANCELED' | 'QUEUED';
  created: number;
  creator?: { username: string };
  target?: string;
  meta?: {
    githubCommitRef?: string;
    githubCommitMessage?: string;
  };
}

export interface DeploymentLog {
  timestamp: number;
  type: 'stdout' | 'stderr' | 'system';
  text: string;
}

export type SupportedClient = 
  | 'cursor'
  | 'claude-desktop'
  | 'claude-code'
  | 'windsurf'
  | 'vscode'
  | 'cline'
  | 'ai-sdk';
