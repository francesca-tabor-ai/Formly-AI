export type FormStatus = 'draft' | 'published' | 'closed'
export type QuestionType = 'likert' | 'multiple_choice' | 'short_text'

export interface Organisation {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  email: string
  organisation_id: string
  created_at: string
}

export interface Form {
  id: string
  organisation_id: string
  name: string
  description: string | null
  status: FormStatus
  created_by: string
  created_at: string
}

export interface Question {
  id: string
  form_id: string
  text: string
  type: QuestionType
  category: string | null
  default_weight: number
  options: string[] | null
  order_index: number
  created_at: string
}

export interface Segment {
  id: string
  form_id: string
  name: string
  weight: number
  created_at: string
}

export interface Respondent {
  id: string
  form_id: string
  segment_id: string | null
  email: string | null
  created_at: string
}

export interface Response {
  id: string
  form_id: string
  question_id: string
  respondent_id: string
  numeric_value: number | null
  text_value: string | null
  created_at: string
}

export interface ResponseFlag {
  id: string
  response_id: string
  flag_type: string
  details: string | null
  created_at: string
}

// Join types for queries
export interface QuestionWithResponses extends Question {
  responses: Response[]
}

export interface FormWithQuestions extends Form {
  questions: Question[]
}

export interface SegmentWithRespondents extends Segment {
  respondents: Respondent[]
}

export interface InsightSummary {
  form_id: string
  total_responses: number
  total_respondents: number
  overall_weighted_score: number
  questions: QuestionInsight[]
  segments: SegmentInsight[]
}

export interface QuestionInsight {
  question_id: string
  question_text: string
  question_type: QuestionType
  average_score: number | null
  weighted_average: number | null
  response_count: number
  outliers: string[]
}

export interface SegmentInsight {
  segment_id: string
  segment_name: string
  average_score: number
  weighted_average: number
  response_count: number
}
