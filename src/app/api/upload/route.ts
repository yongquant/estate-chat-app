import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper function to extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  try {
    if (fileType === 'text/plain') {
      return await file.text();
    }

    if (fileType === 'application/pdf') {
      // For PDFs, we'll use a simple approach for now
      // In production, you might want to use a proper PDF parser like pdf-lib or pdf-parse
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text || 'PDF content could not be extracted automatically. Please provide text summary.';
    }

    if (fileType.startsWith('image/')) {
      // For images, we'll let Gemini handle the image directly
      return `[Image file: ${file.name}]`;
    }

    if (fileType.includes('document') || fileType.includes('word')) {
      // For Word docs, basic text extraction
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text || 'Document content could not be extracted automatically. Please provide text summary.';
    }

    return `[File: ${file.name} - Type: ${fileType}]`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `[Error reading file: ${file.name}]`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const documentType = formData.get('documentType') as string;

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        // Extract text content for Supabase storage
        const textContent = await extractTextFromFile(file);

        // Convert file to base64 for Gemini processing
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          textContent,
          base64Data,
          documentType
        };
      })
    );

    // Store file metadata and text content in Supabase
    const { data: uploadedFiles, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert(
        processedFiles.map(file => ({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          document_type: file.documentType,
          text_content: file.textContent,
          created_at: new Date().toISOString()
        }))
      )
      .select();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      files: processedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        documentType: file.documentType,
        hasTextContent: Boolean(file.textContent),
        base64Data: file.base64Data // Include for immediate use with Gemini
      }))
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}
