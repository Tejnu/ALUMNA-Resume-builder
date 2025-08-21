
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
    
    let extractedText = '';

    try {
      // Try to use pdf-parse with proper import
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer, {
        max: 0, // parse all pages
        version: 'default'
      });
      
      extractedText = result.text || '';
      console.log('PDF parse successful, text length:', extractedText.length);
      
    } catch (parseError) {
      console.error('PDF parsing with pdf-parse failed:', parseError);
      
      // Enhanced fallback methods
      try {
        // Method 1: Simple text extraction from buffer
        let textContent = buffer.toString('utf8');
        extractedText = textContent
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Method 2: Try latin1 encoding if utf8 fails
        if (extractedText.length < 50) {
          textContent = buffer.toString('latin1');
          extractedText = textContent
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        // Method 3: Extract text patterns from hex
        if (extractedText.length < 50) {
          const hexString = buffer.toString('hex');
          const textMatches = [];
          
          // Look for readable ASCII patterns in hex
          for (let i = 0; i < hexString.length; i += 2) {
            const hex = hexString.substr(i, 2);
            const char = String.fromCharCode(parseInt(hex, 16));
            if (char >= ' ' && char <= '~') {
              textMatches.push(char);
            } else if (char === '\n' || char === '\r' || char === '\t') {
              textMatches.push(char);
            }
          }
          
          extractedText = textMatches.join('')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        console.log('Fallback extraction result, text length:', extractedText.length);
        
      } catch (fallbackError) {
        console.error('All PDF extraction methods failed:', fallbackError);
        return new NextResponse(
          JSON.stringify({ 
            error: 'Unable to parse PDF. The file may be image-based, password-protected, or corrupted. Please try uploading a DOCX or TXT file instead.',
            details: parseError?.message || 'PDF parsing failed'
          }), 
          { status: 400, headers }
        );
      }
    }
    
    // Final validation
    if (!extractedText || extractedText.length < 10) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'No readable text found in PDF. The file may be image-based or corrupted. Please try a different format (DOCX or TXT).' 
        }), 
        { status: 400, headers }
      );
    }

    // Clean up the extracted text
    const cleanText = extractedText
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const response = {
      text: cleanText,
      pages: 1,
      info: {
        title: file.name || 'Resume',
        author: '',
        subject: ''
      }
    };

    return new NextResponse(
      JSON.stringify(response), 
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('PDF parsing API error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'PDF parsing service encountered an error. Please try uploading a DOCX or TXT file instead.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers }
    );
  }
}
