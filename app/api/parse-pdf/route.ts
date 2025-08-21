
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
      // Try to use pdf-parse with enhanced error handling
      let pdfParse;
      try {
        pdfParse = (await import('pdf-parse')).default;
      } catch (importError) {
        console.log('PDF-parse import failed, using fallback');
        throw new Error('PDF library unavailable');
      }
      
      const result = await pdfParse(buffer, {
        max: 0, // parse all pages
        version: 'default',
        normalizeWhitespace: true,
        disableCombineTextItems: false
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
        
        // Method 3: Advanced pattern extraction from buffer
        if (extractedText.length < 50) {
          const bufferString = buffer.toString('binary');
          const textPatterns = [];
          
          // Extract text between common PDF markers
          const textRegex = /\(([^)]+)\)/g;
          let match;
          while ((match = textRegex.exec(bufferString)) !== null) {
            if (match[1] && match[1].length > 2) {
              textPatterns.push(match[1]);
            }
          }
          
          // Extract text after 'Tj' operators (PDF text operators)
          const tjRegex = /\s+([A-Za-z0-9\s.,;:!?'"()-]+)\s+Tj/g;
          while ((match = tjRegex.exec(bufferString)) !== null) {
            if (match[1] && match[1].trim().length > 1) {
              textPatterns.push(match[1].trim());
            }
          }
          
          extractedText = textPatterns.join(' ')
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        // Method 4: Look for readable ASCII sequences
        if (extractedText.length < 50) {
          const asciiText = [];
          for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
              asciiText.push(String.fromCharCode(byte));
            } else if (asciiText.length > 0 && asciiText[asciiText.length - 1] !== ' ') {
              asciiText.push(' ');
            }
          }
          
          extractedText = asciiText.join('')
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
