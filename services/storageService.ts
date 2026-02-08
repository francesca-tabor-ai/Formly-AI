
import { supabase } from '../supabaseClient';
import { createEvidenceDocument } from './supabaseService';

const BUCKET_NAME = 'evidence_vault';

/**
 * SECURE FILE UPLOAD
 * Logic: org_id / document_id / version_v1_filename
 */
export const uploadEvidenceFile = async (
  orgId: string,
  file: File,
  title: string
): Promise<{ success: boolean; doc?: any; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const tempId = crypto.randomUUID();
    const filePath = `${orgId}/${tempId}.${fileExt}`;

    // 1. Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) throw storageError;

    // 2. Register metadata in evidence_documents table
    const doc = await createEvidenceDocument({
      organization_id: orgId,
      title: title || file.name,
      file_path: storageData.path,
      mime_type: file.type,
      version: 1,
      version_metadata: {
        original_name: file.name,
        size: file.size,
        uploaded_at: new Date().toISOString()
      }
    });

    return { success: true, doc };
  } catch (err: any) {
    console.error("Storage Service Error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * DOWNLOAD SECURE LINK
 * Generates a short-lived signed URL for restricted viewing
 */
export const getSecureEvidenceLink = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 300); // 5 minute validity

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }
  return data.signedUrl;
};

/**
 * DELETE EVIDENCE
 * Removes from both storage and database metadata
 */
export const deleteEvidence = async (docId: string, filePath: string): Promise<boolean> => {
  // 1. Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);
  
  if (storageError) return false;

  // 2. Cascade delete will handle the database entry if configured, 
  // but we'll be explicit here for safety.
  const { error: dbError } = await supabase
    .from('evidence_documents')
    .delete()
    .eq('id', docId);

  return !dbError;
};
