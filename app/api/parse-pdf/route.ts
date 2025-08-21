
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
      // Enhanced PDF text extraction using multiple methods
      extractedText = await extractTextFromPDF(buffer);
      
      if (!extractedText || extractedText.length < 10) {
        throw new Error('No readable text found');
      }
      
      console.log('PDF parse successful, text length:', extractedText.length);
      
    } catch (parseError) {
      console.error('PDF parsing failed:', parseError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unable to parse PDF. The file may be image-based or password-protected. Please try uploading a DOCX or TXT file instead.',
          details: parseError instanceof Error ? parseError.message : 'PDF parsing failed'
        }), 
        { status: 400, headers }
      );
    }

    // Clean up the extracted text
    const cleanText = cleanExtractedText(extractedText);

    // Use Gemini AI to structure the resume data
    const structuredData = await structureResumeWithAI(cleanText);

    const response = {
      text: cleanText,
      structuredData: structuredData,
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

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Try pdf-parse first
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer, {
      max: 0,
      version: 'default',
      normalizeWhitespace: true,
      disableCombineTextItems: false
    });
    
    if (result.text && result.text.length > 10) {
      return result.text;
    }
  } catch (error) {
    console.log('pdf-parse failed, using fallback methods');
  }

  // Advanced fallback extraction methods
  let extractedText = '';

  // Method 1: Extract text from PDF streams and objects
  const bufferString = buffer.toString('binary');
  const textChunks: string[] = [];

  // Look for text between parentheses (common PDF text format)
  const parenthesesRegex = /\(([^)]+)\)/g;
  let match;
  while ((match = parenthesesRegex.exec(bufferString)) !== null) {
    if (match[1] && match[1].length > 1) {
      textChunks.push(match[1]);
    }
  }

  // Look for text after Tj operators (PDF text showing operators)
  const tjRegex = /\s+([A-Za-z0-9\s.,;:!?'"()-]+)\s+Tj/g;
  while ((match = tjRegex.exec(bufferString)) !== null) {
    if (match[1] && match[1].trim().length > 1) {
      textChunks.push(match[1].trim());
    }
  }

  // Look for text in BT...ET blocks (Begin Text...End Text)
  const btEtRegex = /BT\s+(.*?)\s+ET/gs;
  while ((match = btEtRegex.exec(bufferString)) !== null) {
    if (match[1]) {
      const textContent = match[1].replace(/[^a-zA-Z0-9\s.,;:!?'"()-]/g, ' ');
      if (textContent.trim().length > 1) {
        textChunks.push(textContent.trim());
      }
    }
  }

  // Method 2: Extract readable ASCII sequences
  if (textChunks.length === 0) {
    const asciiText: string[] = [];
    let currentWord = '';
    
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      
      if ((byte >= 32 && byte <= 126)) {
        currentWord += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) {
        if (currentWord.trim().length > 0) {
          asciiText.push(currentWord.trim());
          currentWord = '';
        }
        asciiText.push('\n');
      } else if (byte === 9) {
        currentWord += ' ';
      } else {
        if (currentWord.trim().length > 0) {
          asciiText.push(currentWord.trim());
          currentWord = '';
        }
        if (asciiText.length > 0 && asciiText[asciiText.length - 1] !== ' ') {
          asciiText.push(' ');
        }
      }
    }
    
    if (currentWord.trim().length > 0) {
      asciiText.push(currentWord.trim());
    }
    
    extractedText = asciiText.join('');
  } else {
    extractedText = textChunks.join(' ');
  }

  // Method 3: UTF-8 with better filtering
  if (!extractedText || extractedText.length < 50) {
    try {
      let utf8Text = buffer.toString('utf8');
      extractedText = utf8Text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      console.log('UTF-8 extraction failed');
    }
  }

  if (!extractedText || extractedText.length < 10) {
    throw new Error('No readable text could be extracted from PDF');
  }

  return extractedText;
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/(.)\1{5,}/g, '$1') // Remove excessive repeated characters
    .trim();
}

async function structureResumeWithAI(text: string): Promise<any> {
  try {
    const apiKey = "AIzaSyCz2zg2PZ_QkmN8F18ov_RnhVP0T0PKM4A";
    if (!apiKey || text.length < 20) return null;

    const prompt = {
      contents: [{
        role: 'user',
        parts: [{
          text: `Extract resume information from this text and return ONLY valid JSON:

${text.slice(0, 15000)}

Return this exact structure:
{
  "personalInfo": {
    "fullName": "name_here",
    "email": "email_here", 
    "phone": "phone_here",
    "location": "location_here",
    "summary": "summary_here"
  },
  "workExperience": [
    {
      "company": "company_name",
      "position": "job_title", 
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "description": "job_description"
    }
  ],
  "skills": ["skill1", "skill2"],
  "education": [
    {
      "school": "school_name",
      "degree": "degree_type",
      "field": "field_of_study",
      "graduationDate": "YYYY-MM"
    }
  ]
}`
        }]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      console.log('Gemini API request failed:', response.status);
      return null;
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!aiText) return null;

    // Extract JSON from response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const structuredData = JSON.parse(jsonMatch[0]);
    console.log('AI structured data successfully');
    return structuredData;

  } catch (error) {
    console.log('AI structuring failed:', error);
    return null;
  }
}
