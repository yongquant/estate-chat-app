import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const documentType = formData.get('documentType');

    if (!files?.length) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process each file
    const fileContents = await Promise.all(
      files.map(async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();

        return {
          type: 'file',
          name: file.name,
          mimeType: file.type,
          data: Buffer.from(arrayBuffer).toString('base64'),
          documentType
        };
      })
    );

    // Return the processed files
    return new Response(JSON.stringify({
      files: fileContents,
      message: 'Files processed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return new Response(JSON.stringify({ error: 'Failed to process files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
