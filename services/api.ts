
import { 
  generateQuestionsFromGoal, 
  generateAdaptiveProbe, 
  getSemanticEmbedding, 
  extractNarrativeThemes, 
  detectStrategicOutliers, 
  analyzeResponses 
} from './geminiService';
import { Question, ChatMessage, ConversationMessage, AlignmentScore, Outlier, ProjectInsight, Simulation, ModelConfig } from '../types';
import { 
  logComprehension, 
  addConversationMessage, 
  addSemanticScore, 
  updateTranscriptMetadata, 
  addAlignmentScore, 
  addOutlier, 
  addProjectInsight, 
  updateDecisionConfidence,
  runSimulation,
  getSimulationsByScenario,
  getActiveModelConfig,
  logDecisionAudit
} from './supabaseService';
import { uploadEvidenceFile } from './storageService';

export type ApiStatus = 
  | 'idle' 
  | 'analyzing' 
  | 'synthesizing' 
  | 'mapping' 
  | 'finalizing' 
  | 'error' 
  | 'success'
  | 'scoring'
  | 'uploading'
  | 'transcribing'
  | 'embedding'
  | 'thematizing'
  | 'clustering'
  | 'indexing'
  | 'simulating'
  | 'persisting'
  | 'auditing';

/**
 * API Route: /api/run-simulation
 * Interacts with Simulation Microservice to generate predictive outcomes.
 */
export const apiRunSimulation = async (
  params: {
    formId: string;
    orgId: string;
    scenarioId: string;
    variables: Record<string, any>;
    weights: Record<string, any>;
  },
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{ success: boolean; data?: Simulation; error?: string }> => {
  const { formId, orgId, scenarioId, variables, weights } = params;

  try {
    onStatusUpdate?.('analyzing');

    // 1. Fetch the currently active model configuration
    const activeConfig = await getActiveModelConfig(orgId);
    if (!activeConfig) throw new Error("No active model configuration found for this organization.");

    onStatusUpdate?.('simulating');

    // MOCK: In a real environment, this calls the Python microservice
    // with activeConfig.parameters + scenario variables
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockMicroserviceResult = {
      predicted_alignment: Math.floor(Math.random() * 30) + 60,
      predicted_risk: Math.floor(Math.random() * 40) + 10,
      results: {
        riskTrend: [
          { name: 'Q1', val: 10 }, { name: 'Q2', val: 25 }, { name: 'Q3', val: 18 },
          { name: 'Q4', val: 45 }
        ],
        radarData: [
          { subject: 'Alignment', A: Math.floor(Math.random() * 40) + 60, B: 70 },
          { subject: 'Risk', A: Math.floor(Math.random() * 30) + 20, B: 40 },
          { subject: 'Velocity', A: Math.floor(Math.random() * 50) + 50, B: 30 },
          { subject: 'Cost', A: Math.floor(Math.random() * 40) + 40, B: 50 },
          { subject: 'Resilience', A: Math.floor(Math.random() * 40) + 60, B: 60 },
        ],
        roi_multiplier: (Math.random() * 2 + 2).toFixed(1),
        confidence: 94
      }
    };

    onStatusUpdate?.('persisting');

    // 2. Store simulation result linked to the active model version
    const simRecord = await runSimulation({
      scenario_id: scenarioId,
      model_config_id: activeConfig.id,
      predicted_alignment: mockMicroserviceResult.predicted_alignment,
      predicted_risk: mockMicroserviceResult.predicted_risk,
      results: mockMicroserviceResult.results
    });

    onStatusUpdate?.('auditing');

    // 3. Automatically log an audit trail entry for this simulation activity
    await logDecisionAudit({
      form_id: formId,
      decision_maker_id: '00000000-0000-0000-0000-000000000000', // Mock system user ID
      decision_text: `Automated Simulation Run: ${activeConfig.name} (v${activeConfig.version})`,
      rationale: `System initiated Monte Carlo synthesis based on scenario parameters: ${JSON.stringify(variables)}`,
      simulation_id: simRecord.id
    });

    onStatusUpdate?.('success');
    return { success: true, data: simRecord };
  } catch (err: any) {
    console.error("Simulation API Error:", err);
    onStatusUpdate?.('error');
    return { success: false, error: err.message || "Simulation engine failure." };
  }
};

/**
 * API Route: /api/get-predictions
 * Fetches historical and current predictive outcomes for a specific scenario.
 */
export const apiGetPredictions = async (
  scenarioId: string,
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{ success: boolean; data?: Simulation[]; error?: string }> => {
  try {
    onStatusUpdate?.('analyzing');
    const simulations = await getSimulationsByScenario(scenarioId);
    onStatusUpdate?.('success');
    return { success: true, data: simulations };
  } catch (err: any) {
    console.error("Get Predictions API Error:", err);
    onStatusUpdate?.('error');
    return { success: false, error: "Failed to retrieve predictive data." };
  }
};

/**
 * API Route: /api/recompute-insights
 * Orchestrates Phase 4 analytics: re-clustering, outlier detection, and insight synthesis.
 */
export const apiRecomputeInsights = async (
  formId: string,
  goal: string,
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    onStatusUpdate?.('analyzing');
    // 1. Fetch all processed responses/messages for this form (Simplified mock fetch)
    const responses = [
      "We need more engineering resources for Q4.",
      "The roadmap is too aggressive for our regional team.",
      "Completely aligned with the decentralization goal.",
      "Concerns about brand consistency if we decentralize fully."
    ];

    // 2. Perform Thematic Clustering / Outlier Detection
    onStatusUpdate?.('clustering');
    const outliersFound = await detectStrategicOutliers(goal, responses);
    
    onStatusUpdate?.('mapping');
    for (const outlier of outliersFound) {
      await addOutlier({
        form_id: formId,
        respondent_id: 'auto-detected',
        reason: outlier.reason,
        status: 'pending',
        metadata: { risk_level: outlier.risk }
      });
    }

    // 3. Re-synthesize Executive Insights
    onStatusUpdate?.('synthesizing');
    const fullSynthesis = await analyzeResponses(goal, responses.map(r => ({ text: r })));
    
    await addProjectInsight({
      form_id: formId,
      category: 'executive_summary',
      title: 'Regenerated Synthesis',
      content: fullSynthesis,
      impact_score: 85
    });

    // 4. Update Global Alignment Score
    onStatusUpdate?.('scoring');
    const globalScore = Math.floor(Math.random() * 20) + 70; // Mock calculation
    await addAlignmentScore({
      form_id: formId,
      score_value: globalScore
    });

    await updateDecisionConfidence({
      form_id: formId,
      confidence_score: globalScore + 5,
      explanation: "Calculated from recent semantic re-clustering and outlier analysis."
    });

    onStatusUpdate?.('success');
    return { success: true };
  } catch (err: any) {
    console.error("Recompute Insights API Error:", err);
    onStatusUpdate?.('error');
    return { success: false, error: err.message };
  }
};

/**
 * API Route: /api/analyze-response
 * Deeply analyzes a single response for themes, embeddings, and semantic scores.
 */
export const apiAnalyzeResponse = async (
  params: {
    messageId: string;
    text: string;
  },
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{ success: boolean; themes: any[]; scores: any[]; error?: string }> => {
  const { messageId, text } = params;

  try {
    onStatusUpdate?.('thematizing');
    // 1. Extract Themes via Gemini
    const themes = await extractNarrativeThemes(text);

    // 2. Generate Semantic Scores (Sentiment, Confidence, etc.)
    onStatusUpdate?.('scoring');
    const scores = [
      { type: 'alignment' as const, value: Math.random() * 0.4 + 0.6 },
      { type: 'sentiment' as const, value: Math.random() * 0.5 + 0.2 },
      { type: 'confidence' as const, value: Math.random() * 0.3 + 0.7 },
      { type: 'risk' as const, value: Math.random() * 0.4 - 0.2 }
    ];

    // 3. Persist to Supabase
    for (const score of scores) {
      await addSemanticScore({
        message_id: messageId,
        score_type: score.type,
        score_value: score.value,
        metadata: { analyzed_at: new Date().toISOString() }
      });
    }

    onStatusUpdate?.('success');
    return { success: true, themes, scores };
  } catch (err: any) {
    console.error("Analysis API Error:", err);
    onStatusUpdate?.('error');
    return { success: false, themes: [], scores: [], error: err.message };
  }
};

/**
 * API Route: /api/chat-interview
 * Handles adaptive questioning logic and stores messages in Supabase with semantic scores.
 */
export const apiChatInterview = async (
  params: {
    conversationId: string;
    goal: string;
    history: ChatMessage[];
    currentQuestion: string;
    userResponse: string;
  },
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{ success: boolean; adaptiveResponse?: string; error?: string }> => {
  const { conversationId, goal, history, currentQuestion, userResponse } = params;

  try {
    onStatusUpdate?.('analyzing');
    
    // 1. Store user message in Supabase
    const userMsg = await addConversationMessage({
      conversation_id: conversationId,
      role: 'user',
      content: userResponse,
      embedding: await getSemanticEmbedding(userResponse)
    });

    // 2. Perform real-time semantic scoring
    onStatusUpdate?.('mapping');
    await addSemanticScore({
      message_id: userMsg.id,
      score_type: 'alignment',
      score_value: Math.random() * 2 - 1, // Simulated alignment score
      metadata: { processed_at: new Date().toISOString() }
    });

    // 3. Generate adaptive AI follow-up
    onStatusUpdate?.('synthesizing');
    const adaptiveResponse = await generateAdaptiveProbe(goal, history, currentQuestion);

    // 4. Store AI response
    await addConversationMessage({
      conversation_id: conversationId,
      role: 'model',
      content: adaptiveResponse
    });

    onStatusUpdate?.('success');
    return { success: true, adaptiveResponse };
  } catch (err: any) {
    console.error("Chat Interview API Error:", err);
    onStatusUpdate?.('error');
    return { success: false, error: "AI Negotiation failed. Please retry your submission." };
  }
};

/**
 * API Route: /api/upload-voice
 * Orchestrates file upload, triggers mock transcription background service.
 */
export const apiUploadVoice = async (
  params: {
    orgId: string;
    conversationId: string;
    audioFile: File;
  },
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{ success: boolean; transcription?: string; error?: string }> => {
  const { orgId, conversationId, audioFile } = params;

  try {
    onStatusUpdate?.('uploading');
    
    // 1. Secure Upload to Storage
    const uploadResult = await uploadEvidenceFile(orgId, audioFile, `Voice_Insight_${Date.now()}`);
    if (!uploadResult.success) throw new Error(uploadResult.error);

    // 2. Trigger Mock Background Transcription
    onStatusUpdate?.('transcribing');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transcription delay
    
    const mockTranscription = "I believe the current strategic roadmap is slightly optimistic regarding engineering capacity, but aligned with our Q4 targets.";
    
    // 3. Store Transcription & Metadata
    onStatusUpdate?.('embedding');
    const embedding = await getSemanticEmbedding(mockTranscription);
    
    const msg = await addConversationMessage({
      conversation_id: conversationId,
      role: 'user',
      content: `[VOICE TRANSCRIPTION]: ${mockTranscription}`,
      embedding
    });

    await updateTranscriptMetadata({
      conversation_id: conversationId,
      duration_seconds: 12,
      audio_quality_score: 0.94,
      word_count: mockTranscription.split(' ').length
    });

    onStatusUpdate?.('success');
    return { success: true, transcription: mockTranscription };
  } catch (err: any) {
    console.error("Voice Pipeline Error:", err);
    onStatusUpdate?.('error');
    return { success: false, error: "Voice synthesis pipeline interrupted." };
  }
};

/**
 * Simulates a Next.js API Route (/api/generate-questions)
 */
export const apiGenerateQuestions = async (
  prompt: string, 
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{
  success: boolean;
  data?: Question[];
  error?: string;
}> => {
  if (!prompt || prompt.trim().length < 10) {
    return {
      success: false,
      error: "Strategic goals must be at least 10 characters to generate high-quality inquiries."
    };
  }

  try {
    onStatusUpdate?.('analyzing');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onStatusUpdate?.('synthesizing');
    const questions = await generateQuestionsFromGoal(prompt);
    
    onStatusUpdate?.('mapping');
    await new Promise(resolve => setTimeout(resolve, 600));

    if (!questions || questions.length === 0) {
      onStatusUpdate?.('error');
      return {
        success: false,
        error: "Our intelligence engine couldn't map questions to that specific goal. Please refine your prompt."
      };
    }

    onStatusUpdate?.('finalizing');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    onStatusUpdate?.('success');
    return {
      success: true,
      data: questions
    };
  } catch (err: any) {
    console.error("Formly AI Engine Error:", err);
    onStatusUpdate?.('error');
    return {
      success: false,
      error: "Communication with the AI cluster was interrupted. Please check your connectivity."
    };
  }
};

/**
 * Simulates a Next.js API Route (/api/score-comprehension)
 */
export const apiScoreComprehension = async (
  params: {
    respondentId: string;
    documentId: string;
    formId: string;
    answers: Record<string, number>;
  },
  onStatusUpdate?: (status: ApiStatus) => void
): Promise<{
  success: boolean;
  score?: number;
  error?: string;
}> => {
  const { respondentId, documentId, formId, answers } = params;

  try {
    onStatusUpdate?.('scoring');
    await new Promise(resolve => setTimeout(resolve, 1200));

    const MOCK_CORRECT_ANSWERS: Record<string, number> = {
      'q1': 0, 
      'q2': 1, 
    };

    const questionIds = Object.keys(MOCK_CORRECT_ANSWERS);
    let correctCount = 0;

    questionIds.forEach(qId => {
      if (answers[qId] === MOCK_CORRECT_ANSWERS[qId]) {
        correctCount++;
      }
    });

    const score = correctCount / questionIds.length;

    if (process.env.SUPABASE_URL) {
      await logComprehension({
        respondent_id: respondentId,
        document_id: documentId,
        form_id: formId,
        score,
        metadata: { 
          processed_at: new Date().toISOString(),
          answer_map: answers
        }
      });
    }

    onStatusUpdate?.('success');
    return {
      success: true,
      score
    };
  } catch (err: any) {
    console.error("Scoring API Error:", err);
    onStatusUpdate?.('error');
    return {
      success: false,
      error: "Failed to validate comprehension credentials."
    };
  }
};
