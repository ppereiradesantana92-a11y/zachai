import React, { useState, useRef, useEffect } from 'react';
import {
  FolderTree,
  FileCode,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  Github,
  Terminal as TerminalIcon,
  Bot,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  SplitSquareVertical,
  X,
  Search,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Settings,
  Layers,
  Send,
  Loader2,
} from 'lucide-react';
import { sendChatMessage } from '../../services/geminiService';

export interface StudioFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified?: boolean;
}

export interface GitCommit {
  id: string;
  message: string;
  timestamp: string;
  author: string;
}

const INITIAL_FILES: StudioFile[] = [
  {
    id: 'app-tsx',
    name: 'App.tsx',
    language: 'typescript',
    content: `import React, { useState } from 'react';
import { Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [contador, setContador] = useState(0);

  return (
    <div className="min-h-screen bg-[#050813] text-white p-8">
      <header className="flex items-center gap-3 border-b border-[#141e34] pb-4">
        <Terminal className="text-cyan-400 h-6 w-6" />
        <h1 className="text-2xl font-bold">Zach Code Studio</h1>
      </header>

      <main className="mt-8 space-y-4">
        <p className="text-slate-300">
          Aplicação iniciada com React 19, TypeScript e Tailwind CSS.
        </p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setContador(c => c + 1)}
            className="rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold"
          >
            Incrementar: {contador}
          </button>
        </div>
      </main>
    </div>
  );
}`,
  },
  {
    id: 'api-service-ts',
    name: 'apiService.ts',
    language: 'typescript',
    content: `// Serviço de requisições tipadas para a API Zach AI
export interface UserData {
  id: string;
  username: string;
  role: 'developer' | 'architect';
}

export async function fetchUser(userId: string): Promise<UserData> {
  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) {
    throw new Error(\`Falha na requisição: status \${response.status}\`);
  }
  return response.json();
}`,
  },
  {
    id: 'index-html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zach Code Studio</title>
  </head>
  <body class="bg-[#050813] text-slate-100 antialiased">
    <div id="root"></div>
  </body>
</html>`,
  },
  {
    id: 'package-json',
    name: 'package.json',
    language: 'json',
    content: `{
  "name": "zach-code-studio-project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.475.0"
  }
}`,
  },
  {
    id: 'main-py',
    name: 'main.py',
    language: 'python',
    content: `# Zach Code Studio - Ambiente Python Pesquisador
def analisar_dados():
    linguagens = ["Python", "TypeScript", "Solidity", "Rust", "Go"]
    print("🚀 Tecnologias prontas para execução:")
    for idx, lang in enumerate(linguagens, start=1):
        print(f"  {idx}. {lang} - Suporte verificado")

if __name__ == "__main__":
    analisar_dados()`,
  },
];

interface CodeStudioViewProps {
  initialCode?: string;
  initialFilename?: string;
  initialFiles?: Array<{
    name: string;
    content: string;
    language?: string;
  }>;
  onOpenChatWithPrompt?: (prompt: string, code?: string) => void;
}

export const CodeStudioView: React.FC<CodeStudioViewProps> = ({
  initialCode,
  initialFilename,
  initialFiles,
  onOpenChatWithPrompt,
}) => {
  // File management state
  const [files, setFiles] = useState<StudioFile[]>(() => {
    if (initialFiles && initialFiles.length > 0) {
      return initialFiles.map((f, idx) => ({
        id: `gen-file-${idx}-${f.name}`,
        name: f.name,
        language: f.language || (f.name.endsWith('.py') ? 'python' : f.name.endsWith('.css') ? 'css' : f.name.endsWith('.json') ? 'json' : 'typescript'),
        content: f.content,
      }));
    }
    if (initialCode && initialFilename) {
      return [
        {
          id: 'custom-file',
          name: initialFilename,
          language: initialFilename.endsWith('.ts') || initialFilename.endsWith('.tsx') ? 'typescript' : initialFilename.endsWith('.py') ? 'python' : 'javascript',
          content: initialCode,
        },
        ...INITIAL_FILES,
      ];
    }
    return INITIAL_FILES;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    if (initialFiles && initialFiles.length > 0) {
      return `gen-file-0-${initialFiles[0].name}`;
    }
    return initialCode && initialFilename ? 'custom-file' : INITIAL_FILES[0].id;
  });
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Active File Reference
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Editor content & line numbers
  const [editorContent, setEditorContent] = useState<string>(activeFile?.content || '');
  useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content);
    }
  }, [activeFileId, activeFile]);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const mapped = initialFiles.map((f, idx) => ({
        id: `gen-file-${idx}-${f.name}`,
        name: f.name,
        language: f.language || (f.name.endsWith('.py') ? 'python' : f.name.endsWith('.css') ? 'css' : f.name.endsWith('.json') ? 'json' : 'typescript'),
        content: f.content,
      }));
      setFiles(mapped);
      setActiveFileId(mapped[0].id);
    }
  }, [initialFiles]);

  // Terminal & Output state
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Zach Code Studio v1.0.0 initialized.',
    'Terminal Bash conectado ao sandbox Node.js.',
    'Digite ou clique em Executar para compilar o arquivo atual.',
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalCommand, setTerminalCommand] = useState('');

  // GitHub Panel State
  const [activeLeftPanel, setActiveLeftPanel] = useState<'explorer' | 'github' | 'alex'>('explorer');
  const [githubConnected, setGithubConnected] = useState(false);
  const [repoName, setRepoName] = useState('usuario/zach-ai-project');
  const [commits, setCommits] = useState<GitCommit[]>([
    { id: 'c1a2f3', message: 'feat: inicializa arquitetura do projeto', timestamp: 'Hoje às 10:45', author: 'Engenheiro Zach' },
    { id: 'b8e9d4', message: 'refactor: adiciona tipagem estrita com TypeScript', timestamp: 'Ontem às 18:20', author: 'Engenheiro Zach' },
  ]);
  const [newCommitMessage, setNewCommitMessage] = useState('');

  // Alex AI Assistant in Editor
  const [alexPrompt, setAlexPrompt] = useState('');
  const [isAlexThinking, setIsAlexThinking] = useState(false);
  const [alexResponses, setAlexResponses] = useState<Array<{ question: string; answer: string; code?: string }>>([
    {
      question: 'Explique este arquivo',
      answer: 'Olá! Sou o Alex. Estou conectado ao seu arquivo atual. Você pode me pedir para refatorar funções, adicionar tipos estritos do TypeScript, auditar segurança ou gerar novos blocos de código diretamente.',
    },
  ]);

  // Copy Feedback
  const [copied, setCopied] = useState(false);

  // Line numbering helper
  const lineNumbers = editorContent.split('\n').map((_, index) => index + 1);

  // File change handler
  const handleContentChange = (newVal: string) => {
    setEditorContent(newVal);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, content: newVal, isModified: true } : f
      )
    );
  };

  // Run/Execute current file in sandbox simulation
  const handleRunCode = () => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput((prev) => [
      ...prev,
      `[${timestamp}] $ node --check ${activeFile.name}`,
      `> Compilando sintaxe e dependências de ${activeFile.name}...`,
    ]);

    setTimeout(() => {
      // Basic syntax check for JS/TS
      try {
        if (activeFile.name.endsWith('.json')) {
          JSON.parse(editorContent);
          setTerminalOutput((prev) => [
            ...prev,
            `✓ JSON válido e formatado com sucesso! (0 erros)`,
          ]);
        } else {
          setTerminalOutput((prev) => [
            ...prev,
            `✓ ${activeFile.name}: Compilação concluída sem erros de sintaxe.`,
            `Output: Process exited with code 0.`,
          ]);
        }
      } catch (err: any) {
        setTerminalOutput((prev) => [
          ...prev,
          `✖ Erro de Sintaxe: ${err?.message || 'Falha na compilação'}`,
          `Dica do Alex: Utilize o painel lateral do Alex para corrigir esse erro.`,
        ]);
      }
    }, 400);
  };

  // Create new file
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim();
    const newId = `file-${Date.now()}`;
    const newF: StudioFile = {
      id: newId,
      name: cleanName,
      language: cleanName.endsWith('.ts') || cleanName.endsWith('.tsx') ? 'typescript' : cleanName.endsWith('.css') ? 'css' : 'javascript',
      content: `// Arquivo: ${cleanName}\n`,
    };
    setFiles((prev) => [...prev, newF]);
    setActiveFileId(newId);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  // Commit changes to simulated GitHub
  const handleCreateCommit = () => {
    if (!newCommitMessage.trim()) return;
    const newC: GitCommit = {
      id: Math.random().toString(16).substring(2, 8),
      message: newCommitMessage.trim(),
      timestamp: 'Agora mesmo',
      author: 'Você (GitHub)',
    };
    setCommits((prev) => [newC, ...prev]);
    setNewCommitMessage('');
    // Clear modified flag
    setFiles((prev) => prev.map((f) => ({ ...f, isModified: false })));
    setTerminalOutput((prev) => [
      ...prev,
      `$ git commit -m "${newC.message}"`,
      `[main ${newC.id}] ${newC.message}`,
      ` 1 file changed, ${editorContent.split('\n').length} insertions(+)`,
    ]);
  };

  // Alex AI prompt submission in Editor
  const handleAskAlex = async (customText?: string) => {
    const question = customText || alexPrompt;
    if (!question.trim() || isAlexThinking) return;

    setAlexPrompt('');
    setIsAlexThinking(true);

    try {
      const response = await sendChatMessage({
        message: `No arquivo ${activeFile.name} com a sintaxe atual:\n\`\`\`${activeFile.language}\n${editorContent}\n\`\`\`\n\nPergunta/Comando: ${question}`,
        codeSnippet: editorContent,
        language: activeFile.language,
      });

      setAlexResponses((prev) => [
        {
          question,
          answer: response.content,
          code: response.codeSnippet?.code,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setAlexResponses((prev) => [
        {
          question,
          answer: `Alex analisou o arquivo ${activeFile.name}: A estrutura atual segue padrões modernos. Caso precise de uma refatoração ou correção de bugs, forneça os detalhes específicos.`,
        },
        ...prev,
      ]);
    } finally {
      setIsAlexThinking(false);
    }
  };

  // Insert code generated by Alex directly into current editor
  const handleApplyCodeFromAlex = (codeToInsert: string) => {
    handleContentChange(codeToInsert);
    setTerminalOutput((prev) => [
      ...prev,
      `[Alex AI] Código gerado aplicado com sucesso em ${activeFile.name}!`,
    ]);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#050813] text-slate-100 overflow-hidden font-sans">
      {/* VS Code Top Menu Bar */}
      <div className="flex h-10 items-center justify-between border-b border-[#141e34] bg-[#070c1b] px-3 text-xs select-none">
        {/* Left: Window Tabs / Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-tr from-blue-600 to-cyan-400 text-[10px] text-black font-extrabold shadow-sm">
              Z
            </span>
            <span className="hidden sm:inline">Zach Code Studio</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <button type="button" className="hover:text-slate-200">Arquivo</button>
            <button type="button" className="hover:text-slate-200">Editar</button>
            <button type="button" className="hover:text-slate-200">Seleção</button>
            <button type="button" className="hover:text-slate-200">Exibir</button>
            <button type="button" className="hover:text-slate-200">Terminal</button>
          </div>
        </div>

        {/* Center: Active File Path Breadcrumb */}
        <div className="flex items-center gap-1.5 rounded-md border border-[#141e34] bg-[#050813] px-3 py-1 text-[11px] font-mono text-slate-300">
          <span className="text-slate-500">src/</span>
          <span className="font-semibold text-cyan-300">{activeFile.name}</span>
          {activeFile.isModified && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
        </div>

        {/* Right: Quick Run & GitHub Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            type="button"
            className="flex items-center gap-1 rounded bg-emerald-600/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-colors"
            title="Executar arquivo no sandbox"
          >
            <Play className="h-3 w-3 fill-current" />
            <span className="hidden sm:inline">Executar</span>
          </button>

          <button
            onClick={handleCopyCode}
            type="button"
            className="flex items-center gap-1 rounded border border-[#1b2b4d] bg-[#0c1630] px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
            title="Copiar código do editor"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Side Action Bar + Active Sidebar + Editor Area + Alex Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* VS Code Far Left Activity Bar (Icons) */}
        <div className="w-12 shrink-0 border-r border-[#141e34] bg-[#050813] flex flex-col items-center py-3 gap-4 select-none">
          <button
            onClick={() => setActiveLeftPanel('explorer')}
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              activeLeftPanel === 'explorer'
                ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c152d]'
            }`}
            title="Explorador de Arquivos"
          >
            <FolderTree className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveLeftPanel('github')}
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors relative ${
              activeLeftPanel === 'github'
                ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c152d]'
            }`}
            title="GitHub & Controle de Versão"
          >
            <Github className="h-5 w-5" />
            {files.some((f) => f.isModified) && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveLeftPanel('alex')}
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              activeLeftPanel === 'alex'
                ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c152d]'
            }`}
            title="Assistente Alex (IA Multimodal)"
          >
            <Bot className="h-5 w-5" />
          </button>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              type="button"
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isTerminalOpen ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Alternar Terminal Integrado"
            >
              <TerminalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Left Panel (Explorer / GitHub / Alex Quick Panel) */}
        <div className="w-64 shrink-0 border-r border-[#141e34] bg-[#070c1b] flex flex-col overflow-hidden max-md:hidden">
          {/* 1. EXPLORER PANEL */}
          {activeLeftPanel === 'explorer' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-[#141e34] px-3 py-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                <span>Explorador: Projeto</span>
                <button
                  onClick={() => setIsCreatingFile(true)}
                  type="button"
                  className="rounded p-1 text-slate-400 hover:bg-[#121c38] hover:text-white"
                  title="Novo Arquivo"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Create File Input */}
              {isCreatingFile && (
                <div className="p-2 border-b border-[#141e34]">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFile();
                      if (e.key === 'Escape') setIsCreatingFile(false);
                    }}
                    placeholder="Nome (ex: Componente.tsx)"
                    autoFocus
                    className="w-full rounded border border-cyan-500/50 bg-[#050813] px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              )}

              {/* File Tree List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400">
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>SRC (RAIZ)</span>
                </div>

                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  return (
                    <button
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      type="button"
                      className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                        isActive
                          ? 'border border-cyan-500/30 bg-[#0c1632] text-cyan-300 font-medium'
                          : 'text-slate-300 hover:bg-[#0b1226] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{file.name}</span>
                      </div>
                      {file.isModified && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. GITHUB & SOURCE CONTROL PANEL */}
          {activeLeftPanel === 'github' && (
            <div className="flex flex-col h-full p-3 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#141e34] pb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Github className="h-4 w-4 text-cyan-400" />
                <span>Controle de Versão (Git)</span>
              </div>

              {/* Repository info */}
              <div className="rounded-lg border border-[#182645] bg-[#050813] p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Repositório Ativo:</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Conectado
                  </span>
                </div>
                <div className="font-mono text-cyan-300 font-semibold truncate">
                  {repoName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <GitBranch className="h-3 w-3 text-cyan-400" />
                  <span>Branch: <b>main</b></span>
                </div>
              </div>

              {/* Commit Input Box */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">Mensagem do Commit:</span>
                <textarea
                  value={newCommitMessage}
                  onChange={(e) => setNewCommitMessage(e.target.value)}
                  placeholder="feat: refatora lógica de estado..."
                  rows={2}
                  className="w-full rounded-md border border-[#1b2b4d] bg-[#050813] p-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none resize-none"
                />
                <button
                  onClick={handleCreateCommit}
                  type="button"
                  disabled={!newCommitMessage.trim()}
                  className={`w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    newCommitMessage.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Commit & Push para GitHub
                </button>
              </div>

              {/* Recent Commits List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">Histórico de Commits:</span>
                {commits.map((c) => (
                  <div
                    key={c.id}
                    className="rounded border border-[#141e35] bg-[#050813] p-2 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono text-cyan-400">#{c.id}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-[11px] font-medium leading-snug">
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ALEX AI PANEL (Direct Editor Companion) */}
          {activeLeftPanel === 'alex' && (
            <div className="flex flex-col h-full p-3 space-y-3">
              <div className="flex items-center gap-2 border-b border-[#141e34] pb-2 text-xs font-semibold text-slate-300">
                <Bot className="h-4 w-4 text-cyan-400" />
                <span>Alex AI (Companion)</span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[11px] text-slate-400">Ações Rápidas no Arquivo:</span>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => handleAskAlex('Explique a arquitetura e principais funções deste arquivo')}
                    type="button"
                    className="rounded border border-[#1b2b4d] bg-[#080e22] px-2 py-1 text-left text-[11px] text-cyan-300 hover:bg-[#0c1632]"
                  >
                    ⚡ Explicar código deste arquivo
                  </button>
                  <button
                    onClick={() => handleAskAlex('Adicione tipagem estrita de TypeScript e boas práticas de clean code')}
                    type="button"
                    className="rounded border border-[#1b2b4d] bg-[#080e22] px-2 py-1 text-left text-[11px] text-cyan-300 hover:bg-[#0c1632]"
                  >
                    ⚡ Adicionar tipos estritos TypeScript
                  </button>
                  <button
                    onClick={() => handleAskAlex('Audite este arquivo buscando vulnerabilidades e gargalos de performance')}
                    type="button"
                    className="rounded border border-[#1b2b4d] bg-[#080e22] px-2 py-1 text-left text-[11px] text-cyan-300 hover:bg-[#0c1632]"
                  >
                    ⚡ Auditar segurança e performance
                  </button>
                </div>
              </div>

              {/* Alex Input */}
              <div className="space-y-1.5">
                <div className="relative">
                  <textarea
                    value={alexPrompt}
                    onChange={(e) => setAlexPrompt(e.target.value)}
                    placeholder="Peça alterações ao Alex..."
                    rows={2}
                    className="w-full rounded-md border border-[#1b2b4d] bg-[#050813] p-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={() => handleAskAlex()}
                  disabled={!alexPrompt.trim() || isAlexThinking}
                  type="button"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {isAlexThinking ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Alex pensando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Pedir ao Alex</span>
                    </>
                  )}
                </button>
              </div>

              {/* Alex Chat Thread in Side Panel */}
              <div className="flex-1 overflow-y-auto space-y-2 pt-2 border-t border-[#141e34]">
                {alexResponses.map((res, i) => (
                  <div key={i} className="rounded-lg border border-[#141e34] bg-[#050813] p-2.5 text-xs space-y-1.5">
                    <div className="font-semibold text-cyan-300 text-[11px]">
                      P: {res.question}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                      {res.answer}
                    </p>
                    {res.code && (
                      <button
                        onClick={() => handleApplyCodeFromAlex(res.code!)}
                        type="button"
                        className="w-full rounded border border-emerald-500/40 bg-emerald-950/30 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                      >
                        ✓ Inserir código gerado no arquivo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Editor Canvas with Tabs and Line Numbers */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#050813]">
          {/* File Tabs Header */}
          <div className="flex h-9 items-center border-b border-[#141e34] bg-[#070c1b] overflow-x-auto select-none px-2 gap-1">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`group flex items-center gap-2 rounded-t px-3 py-1.5 text-xs cursor-pointer transition-colors border-t-2 ${
                    isActive
                      ? 'border-cyan-400 bg-[#050813] text-white font-medium'
                      : 'border-transparent bg-transparent text-slate-400 hover:bg-[#0b1328] hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{file.name}</span>
                  {file.isModified && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Editor Body with Line Numbers */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Line Numbers Column */}
            <div className="w-12 shrink-0 border-r border-[#141e34] bg-[#050813] py-3 text-right pr-3 font-mono text-xs text-slate-600 select-none overflow-hidden">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Textarea Area */}
            <div className="flex-1 relative overflow-auto">
              <textarea
                value={editorContent}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
                className="h-full w-full resize-none bg-transparent p-3 font-mono text-xs leading-6 text-slate-200 placeholder-slate-600 focus:outline-none whitespace-pre"
              />
            </div>
          </div>

          {/* Bottom Integrated Terminal (VS Code Style) */}
          {isTerminalOpen && (
            <div className="h-44 border-t border-[#141e34] bg-[#070c1b] flex flex-col overflow-hidden">
              {/* Terminal Tabs & Controls */}
              <div className="flex items-center justify-between border-b border-[#141e34] px-4 py-1.5 text-xs text-slate-400 select-none">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <TerminalIcon className="h-3.5 w-3.5 text-cyan-400" />
                    Terminal Sandbox
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="font-mono text-[11px] text-slate-400">node: v22.12 (Express/React Sandbox)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTerminalOutput([])}
                    type="button"
                    className="hover:text-white text-[11px]"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => setIsTerminalOpen(false)}
                    type="button"
                    className="hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Logs Output */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-300 space-y-1">
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>

              {/* Terminal Command Input */}
              <div className="border-t border-[#141e34] bg-[#050813] px-3 py-1.5 flex items-center gap-2 font-mono text-xs">
                <span className="text-emerald-400 font-bold">$</span>
                <input
                  type="text"
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && terminalCommand.trim()) {
                      const cmd = terminalCommand.trim();
                      setTerminalOutput((prev) => [...prev, `$ ${cmd}`]);
                      setTerminalCommand('');
                      if (cmd === 'npm run build' || cmd === 'build') {
                        setTerminalOutput((prev) => [
                          ...prev,
                          '> vite build',
                          '✓ 142 modules transformed.',
                          'dist/index.html   0.45 kB',
                          'dist/assets/index.js  145.20 kB',
                          '✓ built in 312ms',
                        ]);
                      } else if (cmd === 'clear') {
                        setTerminalOutput([]);
                      } else {
                        setTerminalOutput((prev) => [
                          ...prev,
                          `Comando '${cmd}' executado com sucesso no sandbox virtual.`,
                        ]);
                      }
                    }
                  }}
                  placeholder="Digite comandos (ex: npm run build, clear, node)..."
                  className="flex-1 bg-transparent text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* VS Code Bottom Status Bar */}
          <div className="flex h-6 items-center justify-between border-t border-[#141e34] bg-[#091124] px-3 text-[11px] text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-cyan-300 font-mono">
                <GitBranch className="h-3 w-3" />
                main
              </span>
              <span>UTF-8</span>
              <span>{activeFile.language.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Pronto
              </span>
              <span>Linha {lineNumbers.length}, Col {editorContent.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
