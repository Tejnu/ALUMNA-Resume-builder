import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    
    if (!file) {
      return new NextResponse(
        JSON.stringify({ error: 'No file provided' }), 
        { status: 400, headers }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid file type. Please upload a PDF file.' }), 
        { status: 400, headers }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse(
        JSON.stringify({ error: 'File too large. Please upload a file smaller than 10MB.' }), 
        { status: 400, headers }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Try to use pdf-parse with better error handling
    let result;
    try {
      const pdfParse = await import('pdf-parse').then(module => module.default || module);
      
      result = await pdfParse(buffer, {
        max: 0, // parse all pages
        version: 'default'
      });
      
      console.log('PDF parse successful, text length:', result.text?.length || 0);
      
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError?.message || parseError);
      
      // Enhanced fallback: try multiple extraction methods
      try {
        // Method 1: Try extracting raw text from buffer
        let textContent = buffer.toString('utf8');
        let cleanText = textContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Method 2: If that fails, try latin1 encoding
        if (cleanText.length < 50) {
          textContent = buffer.toString('latin1');
          cleanText = textContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        // Method 3: Try to find text patterns in hex representation
        if (cleanText.length < 50) {
          const hexString = buffer.toString('hex');
          const textMatches = hexString.match(/[a-fA-F0-9]{2}/g);
          if (textMatches) {
            cleanText = textMatches
              .map(hex => String.fromCharCode(parseInt(hex, 16)))
              .join('')
              .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
        
        if (cleanText.length > 20) {
          result = {
            text: cleanText,
            numpages: 1,
            info: { Title: 'Extracted Resume' }
          };
          console.log('Fallback extraction successful, text length:', cleanText.length);
        } else {
          throw new Error('No readable text found in PDF');
        }
      } catch (fallbackError) {
        console.error('Fallback extraction failed:', fallbackError);
        return new NextResponse(
          JSON.stringify({ 
            error: 'Unable to parse PDF. The file may be image-based, password-protected, or corrupted. Please try uploading a DOCX or TXT file instead.',
            details: parseError?.message || 'PDF parsing failed'
          }), 
          { status: 400, headers }
        );
      }
    }
    
    const text = (result.text || '').trim();
    
    if (!text || text.length < 10) {
      return new NextResponse(
        JSON.stringify({ error: 'No readable text found in PDF. The file may be image-based or corrupted.' }), 
        { status: 400, headers }
      );
    }

    const response = {
      text: text,
      pages: result.numpages || 0,
      info: {
        title: result.info?.Title || '',
        author: result.info?.Author || '',
        subject: result.info?.Subject || ''
      }
    };

    return new NextResponse(
      JSON.stringify(response), 
      { status: 200, headers }
    );
  } catch (e: any) {
    console.error('PDF parsing error:', e);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'PDF parsing service encountered an error. Please try uploading a DOCX or TXT file instead.' 
      }), 
      { status: 500, headers }
    );
  }
}