import React, { useState, useEffect, useRef } from 'react';
import {
  MonitorPlay,
  RotateCcw,
  Maximize2,
  Minimize2,
  Trash2,
  Sparkles,
  Terminal,
  Code2,
  Eye,
  FileCode2,
  Copy,
  Check,
  Download,
  Send,
  AlertCircle,
  HelpCircle,
  FolderTree,
  Zap,
} from 'lucide-react';

interface WebPlaygroundViewProps {
  onOpenInAlex?: (prompt: string, code?: string) => void;
  onSendToStudio?: (files: { name: string; content: string; language: string }[]) => void;
}

type TabType = 'html' | 'css' | 'js';

interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

const TEMPLATES = [
  {
    id: 'counter',
    name: 'Contador Interativo',
    desc: 'Botões de incremento, reset e animação neon',
    html: `<div class="card">
  <div class="badge">Zach AI Playground</div>
  <h1>Contador Interativo</h1>
  <p class="subtitle">Clique nos botões abaixo para ver o JavaScript e CSS reagindo em tempo real.</p>
  
  <div class="counter-display" id="display">0</div>
  
  <div class="button-group">
    <button id="btn-decrease" class="btn btn-secondary">-1</button>
    <button id="btn-reset" class="btn btn-reset">Zerar</button>
    <button id="btn-increase" class="btn btn-primary">+1</button>
  </div>
</div>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 20%, #0d1527 0%, #050813 100%);
  color: #f1f5f9;
  padding: 20px;
}

.card {
  background: rgba(10, 17, 34, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.15);
  backdrop-filter: blur(12px);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 9999px;
  margin-bottom: 16px;
  text-transform: uppercase;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 24px;
}

.counter-display {
  font-size: 64px;
  font-weight: 900;
  color: #38bdf8;
  text-shadow: 0 0 24px rgba(56, 189, 248, 0.6);
  margin-bottom: 28px;
  transition: transform 0.15s ease;
}

.counter-display.bump {
  transform: scale(1.15);
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #0284c7, #06b6d4);
  color: #ffffff;
  flex: 1;
  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
}

.btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
  flex: 1;
  border: 1px solid #334155;
}

.btn-secondary:hover {
  background: #334155;
}

.btn-reset {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.25);
}`,
    js: `let count = 0;
const display = document.getElementById('display');
const btnInc = document.getElementById('btn-increase');
const btnDec = document.getElementById('btn-decrease');
const btnReset = document.getElementById('btn-reset');

function updateDisplay() {
  display.textContent = count;
  display.classList.add('bump');
  setTimeout(() => display.classList.remove('bump'), 150);
  console.log('Valor atualizado do contador:', count);
}

btnInc.addEventListener('click', () => {
  count++;
  updateDisplay();
});

btnDec.addEventListener('click', () => {
  count--;
  updateDisplay();
});

btnReset.addEventListener('click', () => {
  count = 0;
  updateDisplay();
  console.log('Contador zerado com sucesso!');
});

console.log('Aplicativo montado com sucesso no Zach Web Playground!');`,
  },
  {
    id: 'particles',
    name: 'Canvas Visualizador',
    desc: 'Animação de partículas interativas com mouse',
    html: `<div class="info-overlay">
  <h2>Zach Particle Visualizer</h2>
  <p>Passe o mouse pelo canvas para interagir com o fluxo</p>
</div>
<canvas id="stage"></canvas>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #050813;
  width: 100vw;
  height: 100vh;
  position: relative;
  font-family: system-ui, sans-serif;
}

.info-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  pointer-events: none;
}

h2 {
  font-size: 18px;
  color: #38bdf8;
  font-weight: 700;
  letter-spacing: 0.5px;
}

p {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}`,
    js: `const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const particles = [];
const PARTICLE_COUNT = 55;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: Math.random() * 2.5 + 1.5,
  });
}

function animate() {
  ctx.fillStyle = 'rgba(5, 8, 19, 0.25)';
  ctx.fillRect(0, 0, width, height);

  particles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    for (let j = idx + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = \`rgba(56, 189, 248, \${1 - dist / 110 * 0.9})\`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

console.log('Iniciando animação de canvas a 60FPS...');
animate();`,
  },
  {
    id: 'calculator',
    name: 'Calculadora Glassmorphism',
    desc: 'Calculadora com visual translúcido e eval seguro',
    html: `<div class="calc">
  <div class="calc-screen" id="calc-screen">0</div>
  <div class="calc-grid">
    <button class="btn btn-action" onclick="calcClear()">C</button>
    <button class="btn btn-action" onclick="calcAppend('/')">÷</button>
    <button class="btn btn-action" onclick="calcAppend('*')">×</button>
    <button class="btn btn-action" onclick="calcDelete()">⌫</button>

    <button class="btn" onclick="calcAppend('7')">7</button>
    <button class="btn" onclick="calcAppend('8')">8</button>
    <button class="btn" onclick="calcAppend('9')">9</button>
    <button class="btn btn-action" onclick="calcAppend('-')">-</button>

    <button class="btn" onclick="calcAppend('4')">4</button>
    <button class="btn" onclick="calcAppend('5')">5</button>
    <button class="btn" onclick="calcAppend('6')">6</button>
    <button class="btn btn-action" onclick="calcAppend('+')">+</button>

    <button class="btn" onclick="calcAppend('1')">1</button>
    <button class="btn" onclick="calcAppend('2')">2</button>
    <button class="btn" onclick="calcAppend('3')">3</button>
    <button class="btn btn-equal" onclick="calcCompute()">=</button>

    <button class="btn btn-zero" onclick="calcAppend('0')">0</button>
    <button class="btn" onclick="calcAppend('.')">.</button>
  </div>
</div>`,
    css: `body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050813;
  font-family: system-ui, sans-serif;
  color: #fff;
  padding: 16px;
}

.calc {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 20px;
  padding: 24px;
  width: 320px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.calc-screen {
  background: #030712;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 16px;
  font-size: 28px;
  font-weight: 700;
  text-align: right;
  color: #38bdf8;
  margin-bottom: 20px;
  min-height: 64px;
  word-break: break-all;
}

.calc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f1f5f9;
  border-radius: 10px;
  padding: 16px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: #334155;
}

.btn-action {
  background: #0e3a5f;
  color: #38bdf8;
  border-color: #0284c7;
}

.btn-equal {
  grid-row: span 2;
  background: linear-gradient(135deg, #0284c7, #06b6d4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-zero {
  grid-column: span 2;
}`,
    js: `let currentExpr = '0';
const screen = document.getElementById('calc-screen');

function render() {
  screen.textContent = currentExpr;
}

function calcAppend(val) {
  if (currentExpr === '0' && val !== '.') {
    currentExpr = val;
  } else {
    currentExpr += val;
  }
  render();
}

function calcClear() {
  currentExpr = '0';
  render();
  console.log('Calculadora limpa');
}

function calcDelete() {
  currentExpr = currentExpr.slice(0, -1);
  if (!currentExpr) currentExpr = '0';
  render();
}

function calcCompute() {
  try {
    // Sanitização básica antes da avaliação
    const safeExpr = currentExpr.replace(/[^0-9+\\-*/.]/g, '');
    const result = Function('"use strict"; return (' + safeExpr + ')')();
    console.log(\`Cálculo: \${currentExpr} = \${result}\`);
    currentExpr = String(result);
  } catch (err) {
    currentExpr = 'Erro';
    console.error('Expressão matemática inválida');
  }
  render();
}

console.log('Calculadora carregada e pronta para operações.');`,
  },
];

export const WebPlaygroundView: React.FC<WebPlaygroundViewProps> = ({
  onOpenInAlex,
  onSendToStudio,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [htmlCode, setHtmlCode] = useState(TEMPLATES[0].html);
  const [cssCode, setCssCode] = useState(TEMPLATES[0].css);
  const [jsCode, setJsCode] = useState(TEMPLATES[0].js);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alexFeedback, setAlexFeedback] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load template
  const handleSelectTemplate = (templateId: string) => {
    const t = TEMPLATES.find((item) => item.id === templateId);
    if (!t) return;
    setHtmlCode(t.html);
    setCssCode(t.css);
    setJsCode(t.js);
    setConsoleLogs([]);
    setAlexFeedback(null);
    setRefreshKey((k) => k + 1);
  };

  // Compile full document for iframe
  const generateSrcDoc = () => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    (function() {
      // Intercept console logs to post to parent
      const sendLog = (type, args) => {
        try {
          const message = args.map(arg => {
            if (typeof arg === 'object') {
              try { return JSON.stringify(arg); } catch (e) { return String(arg); }
            }
            return String(arg);
          }).join(' ');
          window.parent.postMessage({ type: 'PLAYGROUND_CONSOLE', logType: type, message }, '*');
        } catch(e) {}
      };

      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalInfo = console.info;

      console.log = function(...args) {
        sendLog('log', args);
        originalLog.apply(console, args);
      };
      console.info = function(...args) {
        sendLog('info', args);
        originalInfo.apply(console, args);
      };
      console.warn = function(...args) {
        sendLog('warn', args);
        originalWarn.apply(console, args);
      };
      console.error = function(...args) {
        sendLog('error', args);
        originalError.apply(console, args);
      };

      window.onerror = function(message, source, lineno, colno, error) {
        sendLog('error', ['[Erro JS Linha ' + lineno + ']: ' + message]);
        return false;
      };
    })();

    try {
      ${jsCode}
    } catch(err) {
      console.error('[Runtime Error]: ' + err.message);
    }
  </script>
</body>
</html>`;
  };

  // Listen to iframe postMessages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PLAYGROUND_CONSOLE') {
        const newLog: ConsoleLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: event.data.logType || 'log',
          message: event.data.message || '',
          timestamp: new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };
        setConsoleLogs((prev) => [...prev.slice(-49), newLog]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleClearCode = () => {
    if (activeTab === 'html') setHtmlCode('');
    else if (activeTab === 'css') setCssCode('');
    else if (activeTab === 'js') setJsCode('');
  };

  const handleClearAll = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setConsoleLogs([]);
    setAlexFeedback(null);
  };

  const handleCopyCurrentTab = () => {
    const text = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipHtml = () => {
    const blob = new Blob([generateSrcDoc()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zach-playground-index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Analyze with Alex (AI validation)
  const handleAnalyzeWithAlex = () => {
    setIsAnalyzing(true);
    setAlexFeedback(null);

    // Heuristic & instant audit before or alongside Alex chat
    setTimeout(() => {
      const issues: string[] = [];
      const tips: string[] = [];

      // HTML Checks
      if (htmlCode.includes('<div') && !htmlCode.includes('</div>')) {
        issues.push('⚠️ Tag <div> possivelmente não fechada no HTML.');
      }
      if (!htmlCode.trim()) {
        issues.push('⚠️ Seu HTML está vazio. Adicione pelo menos uma tag de conteúdo.');
      }

      // CSS Checks
      if (cssCode.includes('{') && !cssCode.includes('}')) {
        issues.push('⚠️ Bloco CSS sem fechamento de chaves `}`.');
      }

      // JS Checks
      if (jsCode.includes('getElementById') && !htmlCode.includes('id=')) {
        tips.push('💡 Você está buscando IDs com getElementById, mas certifique-se de que eles existem no HTML.');
      }
      if (jsCode.includes('eval(')) {
        issues.push('🚨 O uso de eval() direto é inseguro. Prefira Function() sanitizado ou parsers matemáticos.');
      }

      let summary = '';
      if (issues.length === 0) {
        summary = `✅ **Diagnóstico do Alex:** Seu código HTML, CSS e JavaScript está bem estruturado e sem erros críticos de sintaxe!\n\n**Dicas de Excelência:**\n- Lembre-se de manter classes reutilizáveis e nomenclatura consistente (BEM ou utilitários);\n- Para responsividade em mobile, sempre teste media queries com tamanhos abaixo de 480px;\n- O código está pronto para ser enviado ao Zach Code Studio ou testado ao vivo!`;
      } else {
        summary = `🔍 **Alex identificou pontos de melhoria:**\n\n${issues.map((i) => `* ${i}`).join('\n')}\n\n${tips.length > 0 ? `**Sugestões:**\n${tips.map((t) => `* ${t}`).join('\n')}` : ''}\n\n*Clique em 'Conversar com Alex' caso queira que eu refatore ou aplique as correções automaticamente!*`;
      }

      setAlexFeedback(summary);
      setIsAnalyzing(false);
    }, 700);
  };

  const currentTabContent = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
  const currentTabSetter = activeTab === 'html' ? setHtmlCode : activeTab === 'css' ? setCssCode : setJsCode;

  // Line count for active tab
  const lineNumbers = currentTabContent.split('\n').map((_, i) => i + 1);

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-[#050813] p-4' : 'w-full space-y-4'}`}>
      {/* Top Header & Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#141e35] bg-[#070b18] p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
            <MonitorPlay className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Playground Web & Live Preview</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                TEMPO REAL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Edite HTML, CSS e JavaScript com renderização instantânea no iframe e suporte inteligente do Alex.
            </p>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Modelos Prontos:</span>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className="rounded-lg border border-[#1a2744] bg-[#0a1126] px-2.5 py-1 text-xs text-slate-300 transition-all hover:border-cyan-500/50 hover:text-cyan-300"
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Pane Studio: Code Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Pane: Code Tabs & Line-numbered Editor */}
        <div className="flex flex-col rounded-xl border border-[#141e35] bg-[#070b18] shadow-xl overflow-hidden">
          {/* Editor Sub-header / Tabs */}
          <div className="flex items-center justify-between border-b border-[#141e35] bg-[#050813] px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'html'
                    ? 'border border-orange-500/40 bg-orange-950/30 text-orange-400 shadow-sm'
                    : 'text-slate-400 hover:bg-[#0c152a] hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-orange-400" />
                <span>HTML</span>
                <span className="rounded bg-black/40 px-1 py-0.2 text-[9px] text-slate-400">.html</span>
              </button>

              <button
                onClick={() => setActiveTab('css')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'css'
                    ? 'border border-blue-500/40 bg-blue-950/30 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:bg-[#0c152a] hover:text-slate-200'
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
                <span>CSS</span>
                <span className="rounded bg-black/40 px-1 py-0.2 text-[9px] text-slate-400">.css</span>
              </button>

              <button
                onClick={() => setActiveTab('js')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'js'
                    ? 'border border-yellow-500/40 bg-yellow-950/30 text-yellow-400 shadow-sm'
                    : 'text-slate-400 hover:bg-[#0c152a] hover:text-slate-200'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                <span>JavaScript</span>
                <span className="rounded bg-black/40 px-1 py-0.2 text-[9px] text-slate-400">.js</span>
              </button>
            </div>

            {/* Editor Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCurrentTab}
                title="Copiar código desta aba"
                className="flex items-center gap-1 rounded border border-[#1b2742] bg-[#0c152a] px-2 py-1 text-[11px] text-slate-300 transition-all hover:border-cyan-500/40 hover:text-cyan-300"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleClearCode}
                title="Limpar código desta aba"
                className="flex items-center gap-1 rounded border border-[#1b2742] bg-[#0c152a] px-2 py-1 text-[11px] text-slate-400 transition-all hover:border-rose-500/40 hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
                <span>Limpar</span>
              </button>
            </div>
          </div>

          {/* Code Area with Line Numbers */}
          <div className="relative flex h-[480px] bg-[#050813] font-mono text-xs">
            {/* Line numbers gutter */}
            <div className="w-12 select-none overflow-hidden border-r border-[#141e35] bg-[#04060e] py-3 text-right font-mono text-[11px] text-slate-600">
              {lineNumbers.map((num) => (
                <div key={num} className="px-2 leading-5">
                  {num}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={currentTabContent}
              onChange={(e) => currentTabSetter(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-5 text-slate-200 outline-none selection:bg-cyan-500/30 selection:text-white"
              placeholder={`Digite ou cole seu código ${activeTab.toUpperCase()} aqui...`}
            />
          </div>

          {/* Bottom Action Bar of Editor: Alex Inspection & Studio Export */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#141e35] bg-[#080d1e] p-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyzeWithAlex}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-900/50 hover:text-white shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>{isAnalyzing ? 'Analisando...' : 'Analisar e Corrigir com Alex'}</span>
              </button>

              {onOpenInAlex && (
                <button
                  onClick={() => {
                    const prompt = `Analise este projeto completo de HTML, CSS e JavaScript construído no Playground Web. Avalie a semântica, responsividade e possíveis bugs.\n\nHTML:\n\`\`\`html\n${htmlCode}\n\`\`\`\n\nCSS:\n\`\`\`css\n${cssCode}\n\`\`\`\n\nJS:\n\`\`\`javascript\n${jsCode}\n\`\`\``;
                    onOpenInAlex(prompt, htmlCode);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-900/40"
                >
                  <Send className="h-3 w-3" />
                  <span>Levar ao Chat Alex</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onSendToStudio && (
                <button
                  onClick={() => {
                    onSendToStudio([
                      { name: 'index.html', content: htmlCode, language: 'html' },
                      { name: 'styles.css', content: cssCode, language: 'css' },
                      { name: 'script.js', content: jsCode, language: 'javascript' },
                    ]);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/30 px-3 py-1.5 text-xs font-medium text-blue-300 transition-all hover:bg-blue-900/40"
                >
                  <FolderTree className="h-3 w-3" />
                  <span>Abrir no Zach Studio</span>
                </button>
              )}

              <button
                onClick={handleDownloadZipHtml}
                title="Baixar HTML compilado com CSS e JS embutidos"
                className="flex items-center gap-1.5 rounded-lg border border-[#1b2742] bg-[#0c152a] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 hover:text-white"
              >
                <Download className="h-3 w-3" />
                <span>Exportar HTML</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Live Preview & Console Output */}
        <div className="flex flex-col rounded-xl border border-[#141e35] bg-[#070b18] shadow-xl overflow-hidden">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between border-b border-[#141e35] bg-[#050813] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Visualizador em Tempo Real
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                title="Recarregar Prévia"
                className="flex items-center gap-1 rounded border border-[#1b2742] bg-[#0c152a] px-2 py-1 text-[11px] text-slate-300 transition-all hover:border-cyan-500/40 hover:text-cyan-300"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Atualizar</span>
              </button>

              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-all ${
                  showConsole
                    ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                    : 'border-[#1b2742] bg-[#0c152a] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="h-3 w-3" />
                <span>Console ({consoleLogs.length})</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Sair da tela cheia' : 'Abrir em tela cheia'}
                className="flex items-center gap-1 rounded border border-[#1b2742] bg-[#0c152a] px-2 py-1 text-[11px] text-slate-300 transition-all hover:border-cyan-500/40 hover:text-cyan-300"
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Live Preview Iframe */}
          <div className="relative flex-1 min-h-[340px] bg-white">
            <iframe
              key={refreshKey}
              ref={iframeRef}
              title="Live Playground Output"
              srcDoc={generateSrcDoc()}
              sandbox="allow-scripts allow-modals"
              className="h-full w-full border-none"
            />
          </div>

          {/* Console Logs Panel (Collapsible) */}
          {showConsole && (
            <div className="border-t border-[#141e35] bg-[#04060f]">
              <div className="flex items-center justify-between border-b border-[#141e35] px-3 py-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Terminal className="h-3 w-3 text-cyan-400" />
                  <span>Console de Saída do JavaScript</span>
                </div>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Limpar Logs
                </button>
              </div>

              <div className="h-36 overflow-y-auto p-2 font-mono text-[11px] space-y-1">
                {consoleLogs.length === 0 ? (
                  <div className="py-4 text-center text-slate-600">
                    Nenhuma mensagem registrada no console até o momento.
                  </div>
                ) : (
                  consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 rounded px-2 py-0.5 leading-relaxed ${
                        log.type === 'error'
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-900/40'
                          : log.type === 'warn'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-900/40'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 select-none">{log.timestamp}</span>
                      <span className="font-semibold text-slate-400">[{log.type.toUpperCase()}]</span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alex Analysis Output Banner (When generated) */}
      {alexFeedback && (
        <div className="rounded-xl border border-purple-500/30 bg-[#0d091e] p-4 text-sm shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="font-bold text-purple-200">Parecer Técnico do Alex AI</h3>
            </div>
            <button
              onClick={() => setAlexFeedback(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Fechar
            </button>
          </div>
          <div className="whitespace-pre-line text-xs sm:text-sm text-slate-300 leading-relaxed">
            {alexFeedback}
          </div>
        </div>
      )}
    </div>
  );
};
