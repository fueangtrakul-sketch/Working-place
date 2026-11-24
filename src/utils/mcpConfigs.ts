import { SupportedClient } from '../types';

export interface ClientConfigInfo {
  id: SupportedClient;
  name: string;
  category: 'Editor' | 'CLI' | 'Extension' | 'SDK';
  icon: string;
  filePathMacOS: string;
  filePathWindows: string;
  filePathLinux: string;
  docUrl: string;
  summary: string;
}

export const CLIENT_CONFIG_METADATA: Record<SupportedClient, ClientConfigInfo> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    category: 'Editor',
    icon: 'Terminal',
    filePathMacOS: '~/.cursor/mcp.json (or .cursor/mcp.json in workspace)',
    filePathWindows: '%USERPROFILE%\\.cursor\\mcp.json',
    filePathLinux: '~/.cursor/mcp.json',
    docUrl: 'https://docs.cursor.com/context/model-context-protocol',
    summary: 'Cursor connects directly to mcp.vercel.com to auto-debug deployments and query analytics in Composer.'
  },
  'claude-desktop': {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    category: 'Editor',
    icon: 'MessageSquare',
    filePathMacOS: '~/Library/Application Support/Claude/claude_desktop_config.json',
    filePathWindows: '%APPDATA%\\Claude\\claude_desktop_config.json',
    filePathLinux: '~/.config/Claude/claude_desktop_config.json',
    docUrl: 'https://modelcontextprotocol.io/quickstart/user',
    summary: 'Enables Claude Desktop on macOS and Windows to access your Vercel projects and documentation.'
  },
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code (CLI)',
    category: 'CLI',
    icon: 'Command',
    filePathMacOS: 'Run via terminal command or ~/.claude.json',
    filePathWindows: 'Run via PowerShell command or %USERPROFILE%\\.claude.json',
    filePathLinux: 'Run via terminal command or ~/.claude.json',
    docUrl: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code',
    summary: 'Anthropic\'s agentic terminal tool. Connects instantly using standard MCP add commands.'
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf (Codeium)',
    category: 'Editor',
    icon: 'Compass',
    filePathMacOS: '~/.codeium/windsurf/mcp_config.json',
    filePathWindows: '%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json',
    filePathLinux: '~/.codeium/windsurf/mcp_config.json',
    docUrl: 'https://docs.codeium.com/windsurf/mcp',
    summary: 'Allows Cascade to inspect Vercel deployments, check errors, and review live environments.'
  },
  vscode: {
    id: 'vscode',
    name: 'VS Code (GitHub Copilot / Continue)',
    category: 'Extension',
    icon: 'Code2',
    filePathMacOS: '.vscode/mcp.json or workspace settings.json',
    filePathWindows: '.vscode\\mcp.json or %APPDATA%\\Code\\User\\settings.json',
    filePathLinux: '.vscode/mcp.json or ~/.config/Code/User/settings.json',
    docUrl: 'https://code.visualstudio.com/docs/copilot/overview',
    summary: 'Standard VS Code MCP configuration for GitHub Copilot Chat and Continue extensions.'
  },
  cline: {
    id: 'cline',
    name: 'Cline / Roo Code',
    category: 'Extension',
    icon: 'Cpu',
    filePathMacOS: '~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
    filePathWindows: '%APPDATA%\\Code\\User\\globalStorage\\...\\cline_mcp_settings.json',
    filePathLinux: '~/.config/Code/User/globalStorage/.../cline_mcp_settings.json',
    docUrl: 'https://github.com/cline/cline',
    summary: 'Autonomous coding agent extension for VS Code with tool execution approval.'
  },
  'ai-sdk': {
    id: 'ai-sdk',
    name: 'Vercel AI SDK',
    category: 'SDK',
    icon: 'Boxes',
    filePathMacOS: 'src/app/api/chat/route.ts (or server module)',
    filePathWindows: 'src\\app\\api\\chat\\route.ts',
    filePathLinux: 'src/app/api/chat/route.ts',
    docUrl: 'https://sdk.vercel.ai/docs',
    summary: 'Direct programmatic usage in Next.js, Node.js, and serverless AI applications using streamText.'
  }
};

export function generateConfigForClient(
  client: SupportedClient,
  options: {
    token?: string;
    teamSlug?: string;
    projectSlug?: string;
    useProjectScope?: boolean;
  }
): { content: string; language: string; command?: string } {
  const { token = '', teamSlug = '', projectSlug = '', useProjectScope = false } = options;

  const endpoint = useProjectScope && teamSlug && projectSlug
    ? `https://mcp.vercel.com/${teamSlug}/${projectSlug}`
    : 'https://mcp.vercel.com';

  switch (client) {
    case 'cursor': {
      const config = {
        mcpServers: {
          vercel: {
            url: endpoint,
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
          }
        }
      };
      return {
        content: JSON.stringify(config, null, 2),
        language: 'json',
        command: useProjectScope
          ? `vercel mcp --project --clients "Cursor"`
          : `vercel mcp --clients "Cursor"`
      };
    }

    case 'claude-desktop': {
      // Claude desktop currently supports SSE or stdio bridges, or HTTP remote endpoints
      const config = {
        mcpServers: {
          vercel: {
            url: endpoint,
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
          }
        }
      };
      return {
        content: JSON.stringify(config, null, 2),
        language: 'json',
        command: `npx vercel mcp --clients "Claude Desktop"`
      };
    }

    case 'claude-code': {
      const cmd = token
        ? `claude mcp add vercel -- ${endpoint} --header "Authorization: Bearer ${token}"`
        : `claude mcp add vercel -- ${endpoint}`;

      const configJson = {
        mcpServers: {
          vercel: {
            url: endpoint,
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
          }
        }
      };

      return {
        content: JSON.stringify(configJson, null, 2),
        language: 'json',
        command: cmd
      };
    }

    case 'windsurf': {
      const config = {
        mcpServers: {
          vercel: {
            serverUrl: endpoint,
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
          }
        }
      };
      return {
        content: JSON.stringify(config, null, 2),
        language: 'json',
        command: `vercel mcp --clients "Windsurf"`
      };
    }

    case 'vscode': {
      const config = {
        "mcp.servers": {
          "vercel": {
            "type": "http",
            "url": endpoint,
            ...(token ? { "headers": { "Authorization": `Bearer ${token}` } } : {})
          }
        }
      };
      return {
        content: JSON.stringify(config, null, 2),
        language: 'json',
        command: `vercel mcp --clients "VS Code"`
      };
    }

    case 'cline': {
      const config = {
        mcpServers: {
          "vercel-mcp": {
            url: endpoint,
            disabled: false,
            autoApprove: [
              "search_documentation",
              "list_projects",
              "list_deployments",
              "get_deployment_logs"
            ],
            ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
          }
        }
      };
      return {
        content: JSON.stringify(config, null, 2),
        language: 'json'
      };
    }

    case 'ai-sdk': {
      const code = `import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createMcpClient } from '@ai-sdk/mcp';

// Connect to Vercel Model Context Protocol Server
const vercelMcp = await createMcpClient({
  transport: {
    type: 'http',
    url: '${endpoint}',
    headers: {
      Authorization: \`Bearer \${process.env.VERCEL_TOKEN}\`,
    },
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Retrieve tools from the Vercel MCP server dynamically
  const mcpTools = await vercelMcp.getTools();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      ...mcpTools,
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}`;
      return {
        content: code,
        language: 'typescript'
      };
    }
  }
}
