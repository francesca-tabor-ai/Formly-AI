
-- Enable the vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ... [Previously defined core tables would be here] ...

-- 26. API Keys: For secure programmatic access
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Never store raw keys
  key_hint TEXT NOT NULL, -- e.g. "fmly_live_..."
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. Benchmarks: Industry standard performance metrics
CREATE TABLE benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. Evidence Libraries: Shared organizational repositories
CREATE TABLE evidence_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing evidence_documents to reference libraries
ALTER TABLE evidence_documents ADD COLUMN library_id UUID REFERENCES evidence_libraries(id) ON DELETE SET NULL;

-- 29. Assessment Templates: Reusable form structures
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for public/global
  creator_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. Sector Models: Pre-configured weights for industry verticals
CREATE TABLE sector_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES FOR EXTENDED ECOSYSTEM
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_models ENABLE ROW LEVEL SECURITY;

-- API Keys: Only admins of an org can see/manage keys
CREATE POLICY "Admins can manage org api keys" ON api_keys
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND organization_id = api_keys.organization_id 
    AND role = 'admin'
  ));

-- Benchmarks: Read-only for everyone in an org
CREATE POLICY "Everyone can view benchmarks" ON benchmarks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Evidence Libraries: Org-scoped access
CREATE POLICY "Org members can view libraries" ON evidence_libraries
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Org admins can manage libraries" ON evidence_libraries
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()) 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Templates: Org members can see public or their own org's templates
CREATE POLICY "Viewable templates" ON assessment_templates
  FOR SELECT USING (
    is_public = true OR 
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Manage templates" ON assessment_templates
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Sector Models: Read-only global access
CREATE POLICY "Everyone can view sector models" ON sector_models
  FOR SELECT USING (auth.uid() IS NOT NULL);
