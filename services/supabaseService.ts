
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  FormProject, Question, Segment, Profile, 
  Organization, Response, Report, Weight,
  EvidenceDocument, EvidenceAssignment, ComprehensionScore,
  Conversation, ConversationMessage, SemanticScore, TranscriptMetadata,
  AlignmentScore, Outlier, ProjectInsight, DecisionConfidence,
  Scenario, ModelConfig, Simulation, DecisionAudit,
  ApiKey, Benchmark, AssessmentTemplate, EvidenceLibrary, SectorModel
} from '../types';

/**
 * Helper to wrap supabase calls with configuration checks and graceful fallbacks
 */
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

/**
 * API KEY MANAGEMENT
 */
export const getApiKeys = async (orgId: string): Promise<ApiKey[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data || [];
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId);
  if (error) throw error;
};

/**
 * BENCHMARK INTELLIGENCE
 */
export const getBenchmarks = async (sector?: string): Promise<Benchmark[]> => {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from('benchmarks').select('*');
  if (sector) query = query.eq('sector', sector);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * ASSESSMENT TEMPLATES
 */
export const getTemplates = async (orgId: string): Promise<AssessmentTemplate[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('assessment_templates')
    .select('*')
    .or(`is_public.eq.true,organization_id.eq.${orgId}`);
  if (error) throw error;
  return data || [];
};

export const createTemplate = async (template: Partial<AssessmentTemplate>): Promise<AssessmentTemplate> => {
  if (!isSupabaseConfigured()) throw new Error("Supabase unconfigured");
  const { data, error } = await supabase
    .from('assessment_templates')
    .insert([template])
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * EVIDENCE LIBRARIES
 */
export const getEvidenceLibraries = async (orgId: string): Promise<EvidenceLibrary[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('evidence_libraries')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data || [];
};

export const createEvidenceLibrary = async (library: Partial<EvidenceLibrary>): Promise<EvidenceLibrary> => {
  if (!isSupabaseConfigured()) throw new Error("Supabase unconfigured");
  const { data, error } = await supabase
    .from('evidence_libraries')
    .insert([library])
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * SECTOR MODELS
 */
export const getSectorModels = async (): Promise<SectorModel[]> => {
  if (!isSupabaseConfigured()) {
    return [
      { id: '1', sector_name: 'Tech & SaaS', config: {}, version: '1.0', created_at: '' },
      { id: '2', sector_name: 'Healthcare', config: {}, version: '1.2', created_at: '' },
      { id: '3', sector_name: 'Government', config: {}, version: '1.0', created_at: '' },
      { id: '4', sector_name: 'Retail', config: {}, version: '2.1', created_at: '' },
    ];
  }
  const { data, error } = await supabase
    .from('sector_models')
    .select('*');
  if (error) throw error;
  return data || [];
};

export const getSectorModelByName = async (name: string): Promise<SectorModel | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('sector_models')
    .select('*')
    .eq('sector_name', name)
    .maybeSingle();
  if (error) throw error;
  return data;
};

/**
 * EVIDENCE MANAGEMENT (Extended)
 */
export const getEvidenceDocuments = async (orgId: string, libraryId?: string): Promise<EvidenceDocument[]> => {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from('evidence_documents').select('*').eq('organization_id', orgId);
  if (libraryId) query = query.eq('library_id', libraryId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const createEvidenceDocument = async (doc: Partial<EvidenceDocument>): Promise<EvidenceDocument> => {
  if (!isSupabaseConfigured()) {
    return { ...doc, id: Math.random().toString() } as EvidenceDocument;
  }
  const { data, error } = await supabase
    .from('evidence_documents')
    .insert([doc])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const assignEvidenceToForm = async (assignment: Partial<EvidenceAssignment>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('evidence_assignments')
    .insert([assignment]);
  if (error) throw error;
};

export const getEvidenceForForm = async (formId: string): Promise<EvidenceDocument[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('evidence_assignments')
    .select('evidence_documents(*)')
    .eq('form_id', formId);
  if (error) throw error;
  return data?.map(item => item.evidence_documents) || [];
};

/**
 * COMPREHENSION TRACKING & ANALYTICS
 */
export const logComprehension = async (score: Partial<ComprehensionScore>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('comprehension_scores')
    .insert([score]);
  if (error) throw error;
};

export const getComprehensionStats = async (formId: string): Promise<any[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('comprehension_scores')
    .select('score, document_id, respondent_id')
    .eq('form_id', formId);
  if (error) throw error;
  return data || [];
};

/**
 * CONVERSATION & MESSAGE MANAGEMENT
 */
export const createConversation = async (conv: Partial<Conversation>): Promise<Conversation> => {
  if (!isSupabaseConfigured()) {
    return { ...conv, id: Math.random().toString(), created_at: new Date().toISOString() } as Conversation;
  }
  const { data, error } = await supabase
    .from('conversations')
    .insert([conv])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateConversationStatus = async (convId: string, status: Conversation['status']): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('conversations')
    .update({ status })
    .eq('id', convId);
  if (error) throw error;
};

export const addConversationMessage = async (msg: Partial<ConversationMessage>): Promise<ConversationMessage> => {
  if (!isSupabaseConfigured()) {
    return { ...msg, id: Math.random().toString(), created_at: new Date().toISOString() } as ConversationMessage;
  }
  const { data, error } = await supabase
    .from('conversation_messages')
    .insert([msg])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getConversationHistory = async (convId: string): Promise<ConversationMessage[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

/**
 * SEMANTIC SCORES & ANALYTICS
 */
export const addSemanticScore = async (score: Partial<SemanticScore>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('semantic_scores')
    .insert([score]);
  if (error) throw error;
};

export const getSemanticAnalysisForProject = async (formId: string): Promise<any[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('semantic_scores')
    .select('score_type, score_value, conversation_messages!inner(conversations!inner(form_id))')
    .eq('conversation_messages.conversations.form_id', formId);
  if (error) throw error;
  return data || [];
};

/**
 * TRANSCRIPT METADATA
 */
export const updateTranscriptMetadata = async (metadata: Partial<TranscriptMetadata>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('transcript_metadata')
    .upsert([metadata]);
  if (error) throw error;
};

/**
 * ANALYTICAL DATA CRUD
 */

export const addAlignmentScore = async (score: Partial<AlignmentScore>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('alignment_scores')
    .insert([score]);
  if (error) throw error;
};

export const getAlignmentScores = async (formId: string): Promise<AlignmentScore[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('alignment_scores')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addOutlier = async (outlier: Partial<Outlier>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('outliers')
    .insert([outlier]);
  if (error) throw error;
};

export const updateOutlierStatus = async (id: string, status: Outlier['status']): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('outliers')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};

export const getOutliers = async (formId: string): Promise<Outlier[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('outliers')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addProjectInsight = async (insight: Partial<ProjectInsight>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('project_insights')
    .insert([insight]);
  if (error) throw error;
};

export const getProjectInsights = async (formId: string): Promise<ProjectInsight[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('project_insights')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateDecisionConfidence = async (confidence: Partial<DecisionConfidence>): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('decision_confidence')
    .upsert([confidence]);
  if (error) throw error;
};

export const getDecisionConfidence = async (formId: string): Promise<DecisionConfidence | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('decision_confidence')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

/**
 * PREDICTIVE & SIMULATION CRUD (WITH VERSIONING)
 */

export const createScenario = async (scenario: Partial<Scenario>): Promise<Scenario> => {
  if (!isSupabaseConfigured()) {
    return { ...scenario, id: Math.random().toString() } as Scenario;
  }
  const { data, error } = await supabase
    .from('scenarios')
    .insert([scenario])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getScenarios = async (formId: string): Promise<Scenario[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * Saves a new version of a Model Config.
 */
export const saveNewModelConfigVersion = async (config: Partial<ModelConfig>): Promise<ModelConfig> => {
  if (!isSupabaseConfigured()) return { ...config, id: 'mock-config', version: 1 } as ModelConfig;
  // 1. Get current max version for this config name/org
  const { data: existing } = await supabase
    .from('model_configs')
    .select('version')
    .eq('organization_id', config.organization_id)
    .eq('name', config.name)
    .order('version', { ascending: false })
    .limit(1);

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

  // 2. Insert new version
  const { data, error } = await supabase
    .from('model_configs')
    .insert([{ ...config, version: nextVersion, is_active: false }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Applies a specific model version as the active one.
 */
export const applyModelConfigVersion = async (configId: string, orgId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  // 1. Deactivate all for this org
  await supabase
    .from('model_configs')
    .update({ is_active: false })
    .eq('organization_id', orgId);

  // 2. Activate specific version
  const { error } = await supabase
    .from('model_configs')
    .update({ is_active: true })
    .eq('id', configId);

  if (error) throw error;
};

export const getModelConfigs = async (orgId: string): Promise<ModelConfig[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('model_configs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getActiveModelConfig = async (orgId: string): Promise<ModelConfig | null> => {
  if (!isSupabaseConfigured()) return { id: 'default', name: 'Standard Model', version: 1, parameters: {}, is_active: true, created_at: '', organization_id: orgId };
  const { data, error } = await supabase
    .from('model_configs')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const runSimulation = async (sim: Partial<Simulation>): Promise<Simulation> => {
  if (!isSupabaseConfigured()) return { ...sim, id: Math.random().toString() } as Simulation;
  const { data, error } = await supabase
    .from('simulations')
    .insert([sim])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getSimulationsByScenario = async (scenarioId: string): Promise<Simulation[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('simulations')
    .select('*, model_configs(name, version)')
    .eq('scenario_id', scenarioId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * Formalizes a decision with a link to a specific simulation.
 */
export const logDecisionAudit = async (audit: Partial<DecisionAudit>): Promise<DecisionAudit> => {
  if (!isSupabaseConfigured()) return { ...audit, id: Math.random().toString() } as DecisionAudit;
  const { data, error } = await supabase
    .from('decision_audits')
    .insert([audit])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getDecisionAudits = async (formId: string): Promise<DecisionAudit[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('decision_audits')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * FORM & PROJECT MANAGEMENT
 */
export const getForms = async (): Promise<FormProject[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createForm = async (formData: Partial<FormProject>, questions: Partial<Question>[]): Promise<FormProject> => {
  if (!isSupabaseConfigured()) {
    return { ...formData, id: Math.random().toString(), questions: questions as Question[], status: 'active', responsesCount: 0, createdAt: 'Just now' } as FormProject;
  }
  const { data: form, error: formError } = await supabase
    .from('forms')
    .insert([formData])
    .select()
    .single();
  if (formError) throw formError;
  if (questions.length > 0) {
    const questionsToInsert = questions.map((q, index) => ({
      ...q,
      form_id: form.id,
      order_index: index
    }));
    const { error: qsError } = await supabase.from('questions').insert(questionsToInsert);
    if (qsError) throw qsError;
  }
  return form;
};
