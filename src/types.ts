export type NavigationTab = 
  | 'home'
  | 'chat'
  | 'agent'
  | 'converter'
  | 'playground'
  | 'generator'
  | 'studio'
  | 'practice'
  | 'projects'
  | 'languages'
  | 'refactor'
  | 'analyze'
  | 'fix-errors'
  | 'history'
  | 'profile'
  | 'admin'
  | 'settings';

export interface GeneratedFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export interface PlanStep {
  stepNumber: number;
  title: string;
  description: string;
  targetFiles: string[];
  completed?: boolean;
}

export interface ArchitecturePlan {
  id: string;
  title: string;
  summary: string;
  scope: {
    objectives: string[];
    coreFeatures: string[];
    recommendedTech: string[];
  };
  fileArchitecture: Array<{
    path: string;
    purpose: string;
    layer: 'ui' | 'state' | 'service' | 'types' | 'backend' | 'config';
  }>;
  roadmapSteps: PlanStep[];
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  createdAt: string;
}

export type ExecutionMode = 'direct' | 'planning' | 'agent';

export interface AgentSubtask {
  id: string;
  number: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  category: 'plan' | 'model' | 'service' | 'ui' | 'test' | 'deploy';
  targetFiles: string[];
  logs: string[];
  outputSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  explanation?: string;
  durationMs?: number;
  progressPercentage?: number;
}

export interface AgentExecutionPlan {
  id: string;
  prompt: string;
  title: string;
  summary: string;
  framework?: string;
  totalTasks: number;
  completedTasks: number;
  status: 'idle' | 'decomposing' | 'running' | 'paused' | 'completed' | 'failed';
  subtasks: AgentSubtask[];
  startedAt?: string;
  completedAt?: string;
  activeTaskId?: string;
  generatedFiles?: GeneratedFile[];
}

export interface ProjectMemoryEntry {
  id: string;
  timestamp: string;
  type: 'architecture_decision' | 'file_modified' | 'dependency_added' | 'plan_approved';
  title: string;
  details: string;
  relatedFiles?: string[];
}

export interface ProjectMemoryState {
  projectName: string;
  architectureSummary?: string;
  primaryFramework?: string;
  decisions: ProjectMemoryEntry[];
  modifiedFiles: Array<{
    path: string;
    purpose?: string;
    lastModified: string;
  }>;
  lastUpdated: string;
}

export interface GeneratedProjectStructure {
  projectName: string;
  summary: string;
  architecture: string;
  framework: string;
  features: string[];
  files: GeneratedFile[];
  runInstructions?: string[];
  plan?: ArchitecturePlan;
}

export type LanguageCategory =
  | 'all'
  | 'web'
  | 'backend'
  | 'mobile'
  | 'data-ai'
  | 'systems'
  | 'database'
  | 'scripts'
  | 'blockchain'
  | 'other';

export type LanguageKind =
  | 'programming'
  | 'markup'
  | 'styling'
  | 'query'
  | 'shell'
  | 'smart-contract';

export interface LanguageQuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
}

export interface LanguageItem {
  id: string;
  name: string;
  category: Exclude<LanguageCategory, 'all'>;
  kind: LanguageKind;
  extensions: string[];
  description: string;
  popularUses: string;
  syntaxExample?: string;
  executionStatus: string;
  quiz?: LanguageQuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  imageAttachment?: {
    dataUrl: string;
    name?: string;
    mimeType?: string;
  };
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
  plan?: ArchitecturePlan;
  agentPlan?: AgentExecutionPlan;
  timestamp: string;
  isDemonstrationNotice?: boolean;
}

export interface AlexDiagnosisResult {
  rootCause: string;
  explanation: string;
  correctedCode: {
    language: string;
    code: string;
    filename?: string;
  };
  goldenTip: string;
  identifiedLine?: string;
  detectedInImage?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  category: 'site' | 'explanation' | 'error' | 'general';
  lastUpdated: string;
  preview: string;
  messages: ChatMessage[];
}

export interface CodeAnalysisResult {
  score: number;
  summary: string;
  metrics: {
    complexity: string;
    maintainability: string;
    securityIssues: number;
    performanceAlerts: number;
  };
  recommendations: Array<{
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    diffSnippet?: string;
  }>;
  optimizedCode: string;
}

export interface ErrorDiagnosticResult {
  errorType: string;
  rootCause: string;
  explanation: string;
  fixSnippet: {
    language: string;
    code: string;
    fileHint?: string;
  };
  preventionTips: string[];
}

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
  stack: string[];
  stars: number;
  structure: string[];
  samplePrompt: string;
}

export type AppTheme = 'neon-blue' | 'cyber-purple' | 'emerald-green';

export interface AppSettings {
  preferredModel: string;
  responseDetail: 'concise' | 'balanced' | 'comprehensive';
  indentSize: 2 | 4;
  showLineNumbers: boolean;
  autoCopyCode: boolean;
  highContrast: boolean;
  language: string;
  theme: AppTheme;
  enableRgbBorder: boolean;
}

export interface RefactoringSmell {
  id: string;
  smell: string;
  category: 'readability' | 'complexity' | 'dry' | 'solid' | 'typing' | 'performance';
  severity: 'high' | 'medium' | 'low';
  description: string;
  solutionApplied: string;
  linesAffected?: string;
}

export interface RefactoringResult {
  readabilityScoreBefore: number;
  readabilityScoreAfter: number;
  cyclomaticComplexityBefore: string;
  cyclomaticComplexityAfter: string;
  smellsDetected: RefactoringSmell[];
  refactoredCode: string;
  appliedPractices: string[];
  behaviorGuaranteed: boolean;
  summary: string;
  language: string;
}

export interface CodeConversionRequest {
  sourceCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  idiomaticConversion?: boolean;
  preserveComments?: boolean;
}

export interface TypeMappingItem {
  sourceType: string;
  targetType: string;
  explanation: string;
}

export interface CodeConversionResult {
  convertedCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  notes: string[];
  typeMappings: TypeMappingItem[];
  equivalentLibraries: Array<{
    sourceLib: string;
    targetLib: string;
    purpose: string;
  }>;
  summary: string;
}

// ==========================================
// User, Authentication & Supreme Owner Types
// ==========================================

export type UserRole = 'supreme_owner' | 'admin' | 'user' | 'visitor';

export interface UserProfile {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isSupremeOwner: boolean;
  credits: number;
  maxCredits?: number;
  totalCreditsUsed: number;
  generationsCount: number;
  subscriptionPlanId?: string;
  subscriptionActive?: boolean;
  joinedAt: string;
  lastLoginAt: string;
  visitorDailyGenerationsRemaining?: number;
  lastDailyResetDate?: string;
}

// ==========================================
// Credit Economy, Plans & Checkout Types
// ==========================================

export interface CreditPlan {
  id: 'free' | 'daily' | 'weekly' | 'monthly' | 'annual';
  name: string;
  price: number;
  priceFormatted: string;
  credits: number;
  creditsFormatted: string;
  billingPeriod: string;
  popularBadge?: string;
  highlight?: boolean;
  features: string[];
}

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card';

export interface CheckoutCustomerData {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  postalCode?: string;
  street?: string;
  city?: string;
  state?: string;
}

export interface CreditCardData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
  cardBrand?: 'visa' | 'mastercard' | 'elo' | 'hipercard' | 'other';
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  creditsAwarded: number;
  method: PaymentMethod;
  status: 'approved' | 'pending' | 'failed';
  pixCode?: string;
  pixQrCodeUrl?: string;
  createdAt: string;
  cardLast4?: string;
}

export interface WithdrawalRequest {
  id: string;
  requestedBy: string;
  amount: number;
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
  pixKey: string;
  status: 'completed' | 'processing';
  requestedAt: string;
  completedAt?: string;
  transactionCode: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCreditsUsed: number;
  totalGenerations: number;
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  availableBalanceForWithdrawal: number;
  recentTransactions: PaymentTransaction[];
  withdrawals: WithdrawalRequest[];
}



