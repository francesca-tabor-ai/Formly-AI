
export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Question {
  id: string;
  form_id?: string;
  text: string;
  type: 'text' | 'choice' | 'scale';
  options?: string[];
  requiredEvidence?: string;
  segment_ids?: string[]; // New: Granular targeting
  order_index?: number;
}

export interface FormProject {
  id: string;
  organization_id: string;
  creator_id?: string;
  title: string;
  description: string;
  goal: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  questions: Question[];
  createdAt: string;
  responsesCount: number;
}

export interface Respondent {
  id: string;
  organization_id: string;
  email: string;
  segment_id?: string;
  metadata?: Record<string, any>;
}

export interface Response {
  id: string;
  form_id: string;
  respondent_id: string;
  question_id: string;
  answer_text?: string;
  answer_value?: number;
  comprehension_score: number;
  created_at: string;
}

export interface Weight {
  id: string;
  form_id: string;
  segment_id: string;
  weight_value: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

export interface Segment {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
}

export interface Report {
  id: string;
  form_id: string;
  title: string;
  content: string;
  created_at: string;
}

// EVIDENCE TYPES
export interface EvidenceDocument {
  id: string;
  organization_id: string;
  library_id?: string;
  title: string;
  file_path: string;
  mime_type: string;
  version: number;
  version_metadata: Record<string, any>;
  created_at: string;
}

export interface EvidenceAssignment {
  id: string;
  form_id: string;
  question_id?: string;
  document_id: string;
  created_at: string;
}

export interface ComprehensionScore {
  id: string;
  respondent_id: string;
  document_id: string;
  form_id: string;
  score: number; // 0 to 1
  metadata: Record<string, any>;
  created_at: string;
}

// CONVERSATIONAL & SEMANTIC TYPES
export interface Conversation {
  id: string;
  form_id: string;
  respondent_id: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  embedding?: number[]; // Vector data
  created_at: string;
}

export interface SemanticScore {
  id: string;
  message_id: string;
  score_type: 'alignment' | 'sentiment' | 'confidence' | 'risk';
  score_value: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TranscriptMetadata {
  id: string;
  conversation_id: string;
  duration_seconds?: number;
  audio_quality_score?: number;
  language_code?: string;
  word_count?: number;
  created_at: string;
}

// ANALYTICAL TYPES
export interface AlignmentScore {
  id: string;
  form_id: string;
  segment_id?: string; // Optional for global scores
  score_value: number;
  created_at: string;
}

export interface Outlier {
  id: string;
  form_id: string;
  respondent_id: string;
  message_id?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProjectInsight {
  id: string;
  form_id: string;
  category: string;
  title: string;
  content: string;
  impact_score: number;
  created_at: string;
}

export interface DecisionConfidence {
  id: string;
  form_id: string;
  confidence_score: number;
  explanation?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// PREDICTIVE & SIMULATION TYPES
export interface Scenario {
  id: string;
  form_id: string;
  title: string;
  description: string;
  variables: Record<string, any>;
  created_at: string;
}

export interface ModelConfig {
  id: string;
  organization_id: string;
  name: string;
  version: number;
  parameters: Record<string, any>; // weighting_strategy, sensitivity, etc.
  is_active: boolean;
  created_at: string;
}

export interface Simulation {
  id: string;
  scenario_id: string;
  model_config_id: string;
  predicted_alignment: number;
  predicted_risk: number;
  results: Record<string, any>;
  created_at: string;
}

export interface DecisionAudit {
  id: string;
  form_id: string;
  decision_maker_id: string;
  decision_text: string;
  rationale: string;
  associated_insight_ids: string[];
  simulation_id?: string; // Explicit link to simulation
  created_at: string;
}

// NEW SYSTEM TYPES
export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_hint: string; // e.g. "pk_live_..."
  last_used_at?: string;
  created_at: string;
}

export interface Benchmark {
  id: string;
  sector: string;
  metric_name: string;
  value: number;
  percentile: number;
  last_updated: string;
}

export interface AssessmentTemplate {
  id: string;
  organization_id?: string; // Null if global template
  creator_id?: string;
  title: string;
  description: string;
  goal: string;
  questions: any[];
  is_public: boolean;
  created_at: string;
}

export interface EvidenceLibrary {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SectorModel {
  id: string;
  sector_name: string;
  config: Record<string, any>;
  version: string;
  created_at: string;
}
