'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import { ResumeData, Skill, WorkExperience, Education } from '@/types/resume';

// PDF text extraction temporarily disabled to ensure stable build. Prompt users to upload DOCX/TXT instead.

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import('mammoth');
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || '';
}

function extractTextFromTxt(file: File): Promise<string> {
  return file.text();
}

async function aiStructureFromText(rawText: string): Promise<Partial<ResumeData> | null> {
  try {
    const apiKey = "AIzaSyCz2zg2PZ_QkmN8F18ov_RnhVP0T0PKM4A";
    if (!apiKey || !rawText || rawText.length < 20) return null;

    // Clean and prepare the text for better parsing
    const cleanedText = rawText
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Remove non-printable characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/(.)\1{4,}/g, '$1') // Remove repeated characters
      .trim();

    // Split into chunks if text is too long
    const maxChunkSize = 25000;
    const textChunks = [];
    for (let i = 0; i < cleanedText.length; i += maxChunkSize) {
      textChunks.push(cleanedText.slice(i, i + maxChunkSize));
    }

    const prompt = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an EXPERT resume parser with 10+ years of experience. Your job is to intelligently extract and categorize resume information.

**INTELLIGENT PARSING STRATEGY:**
1. Scan the ENTIRE document for patterns
2. Use context clues to identify sections
3. Cross-reference information for accuracy
4. Handle various formatting styles
5. Prioritize structured data over raw text

**SECTION IDENTIFICATION PATTERNS:**

**PERSONAL INFORMATION (TOP PRIORITY):**
- Name: First 3 lines, proper capitalization, 2-4 words, no special characters
- Email: Unique @ pattern, .com/.org/.edu domains
- Phone: (XXX) XXX-XXXX, XXX-XXX-XXXX, +X-XXX-XXX-XXXX patterns
- Location: City, State | City, Country | State, ZIP patterns
- LinkedIn: linkedin.com/in/[username] patterns
- GitHub: github.com/[username] patterns
- Website: http/https domains excluding LinkedIn/GitHub
- Summary: Paragraph after contact info, 50-300 words, describes career

**WORK EXPERIENCE (CRITICAL SECTION):**
Look for these EXACT patterns:
- "Software Engineer at Google" → Position: Software Engineer, Company: Google
- "Google - Software Engineer" → Company: Google, Position: Software Engineer  
- "Senior Developer | Microsoft" → Position: Senior Developer, Company: Microsoft
- Date patterns: "2020-2023", "Jan 2020 - Present", "2019 to 2022", "June 2021 - Current"
- Bullet points starting with action verbs: Developed, Led, Managed, Implemented, Created, Built, Designed
- Achievement indicators: "increased by X%", "reduced by X", "managed team of X", "generated $X"

**SKILLS (TECHNICAL FOCUS):**
Extract ONLY these categories:
- Programming Languages: JavaScript, Python, Java, C++, C#, TypeScript, Go, Rust, Swift, Kotlin, Ruby, PHP, Scala, R, MATLAB
- Frontend: React, Angular, Vue.js, HTML5, CSS3, SASS, Bootstrap, Tailwind CSS, jQuery, Webpack, Next.js
- Backend: Node.js, Express, Django, Flask, Spring Boot, Laravel, ASP.NET, Ruby on Rails, FastAPI
- Databases: MySQL, PostgreSQL, MongoDB, Redis, Oracle, SQLite, DynamoDB, Firebase, Cassandra
- Cloud/DevOps: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, CI/CD, Terraform, Ansible
- Tools: Git, GitHub, GitLab, Jira, Linux, Docker, Figma, Photoshop, VS Code, IntelliJ

**EDUCATION (ACADEMIC DEGREES):**
- Degree patterns: "Bachelor of Science", "Master of Arts", "PhD in", "B.S.", "M.S.", "MBA"
- Institution indicators: "University", "College", "Institute", "School"
- Field patterns: "Computer Science", "Engineering", "Business Administration", "Information Technology"
- Date patterns: "2020", "2018-2022", "Graduated 2021"

**SMART EXTRACTION RULES:**
1. If name appears multiple times, use the most complete version
2. Prefer work experience with dates and company names
3. Extract skills from context, not just lists
4. Identify current job from "Present", "Current", or recent dates
5. Parse multi-line descriptions as single entries
6. Handle various bullet point styles (•, -, *, numbers)

**OUTPUT REQUIREMENTS:**
Return ONLY valid JSON. No explanations, no markdown, just pure JSON:

{
  "personalInfo": {
    "fullName": "extracted_full_name",
    "email": "extracted_email",
    "phone": "extracted_phone",
    "location": "extracted_location", 
    "linkedin": "extracted_linkedin_url",
    "website": "extracted_website_url",
    "summary": "extracted_summary_or_objective"
  },
  "workExperience": [
    {
      "id": "work_1",
      "company": "company_name",
      "position": "job_title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or empty if current",
      "isCurrentJob": true_or_false,
      "description": "comprehensive_description_with_achievements"
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "school": "institution_name",
      "degree": "degree_type",
      "field": "field_of_study",
      "graduationDate": "YYYY-MM"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": [
    {
      "id": "cert_1",
      "name": "certification_name",
      "issuer": "issuing_organization",
      "dateObtained": "YYYY-MM"
    }
  ],
  "projects": [
    {
      "id": "proj_1", 
      "name": "project_name",
      "description": "project_description",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

**RESUME TEXT TO ANALYZE:**
${textChunks[0].slice(0, 20000)}`
            }
          ]
        }
      ]
    };

    let resp, data, text, parsed: any = {};

    // Retry logic for API calls
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prompt),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!resp.ok) {
          throw new Error(`API request failed: ${resp.status}`);
        }

        data = await resp.json();
        text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!text) {
          throw new Error('Empty response from API');
        }

        // Enhanced JSON extraction
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Remove any text before the first {
        const jsonStart = text.indexOf('{');
        if (jsonStart > 0) {
          text = text.substring(jsonStart);
        }

        // Remove any text after the last }
        const jsonEnd = text.lastIndexOf('}');
        if (jsonEnd > 0) {
          text = text.substring(0, jsonEnd + 1);
        }

        parsed = JSON.parse(text);
        break; // Success, exit retry loop

      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error);
        if (attempt === 3) {
          console.log('All attempts failed, returning null');
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }

    // Enhanced data validation and cleaning
    const result: Partial<ResumeData> = {};

    // Personal Information with validation
    if (parsed.personalInfo && typeof parsed.personalInfo === 'object') {
      result.personalInfo = {
        fullName: (parsed.personalInfo.fullName || '').trim().slice(0, 100),
        email: (parsed.personalInfo.email || '').toLowerCase().trim(),
        phone: (parsed.personalInfo.phone || '').replace(/[^\d\-\(\)\+\s]/g, '').trim(),
        location: (parsed.personalInfo.location || '').trim().slice(0, 100),
        linkedin: (parsed.personalInfo.linkedin || '').trim(),
        website: (parsed.personalInfo.website || '').trim(),
        summary: (parsed.personalInfo.summary || '').trim().slice(0, 1000)
      } as any;
    }

    // Skills with deduplication and validation
    if (Array.isArray(parsed.skills)) {
      const uniqueSkills = [...new Set(parsed.skills
        .filter((skill: string) => typeof skill === 'string' && skill.trim().length > 0)
        .map((skill: string) => skill.trim())
      )];

      result.skills = uniqueSkills.slice(0, 30).map((name: string, i: number) => ({
        id: String(Date.now() + i),
        name: name.slice(0, 50),
        level: 'Intermediate' as const
      }));
    }

    // Work Experience with enhanced validation
    if (Array.isArray(parsed.workExperience)) {
      result.workExperience = parsed.workExperience
        .filter((w: any) => w && w.company && w.position)
        .slice(0, 8)
        .map((w: any, i: number) => ({
          id: w.id || `work_${Date.now()}_${i}`,
          company: (w.company || '').trim().slice(0, 100),
          position: (w.position || '').trim().slice(0, 100),
          startDate: (w.startDate || '').trim(),
          endDate: (w.endDate || '').trim(),
          isCurrentJob: Boolean(w.isCurrentJob),
          description: (w.description || '').trim().slice(0, 2000)
        }));
    }

    // Education with validation
    if (Array.isArray(parsed.education)) {
      result.education = parsed.education
        .filter((e: any) => e && (e.school || e.degree))
        .slice(0, 5)
        .map((e: any, i: number) => ({
          id: e.id || `edu_${Date.now()}_${i}`,
          school: (e.school || '').trim().slice(0, 100),
          degree: (e.degree || '').trim().slice(0, 100),
          field: (e.field || '').trim().slice(0, 100),
          graduationDate: (e.graduationDate || '').trim()
        }));
    }

    // Certifications with validation
    if (Array.isArray(parsed.certifications)) {
      result.certifications = parsed.certifications
        .filter((c: any) => c && c.name)
        .slice(0, 8)
        .map((c: any, i: number) => ({
          id: c.id || `cert_${Date.now()}_${i}`,
          name: (c.name || '').trim().slice(0, 100),
          description: (c.issuer || c.description || '').trim().slice(0, 500)
        }));
    }

    // Projects with validation
    if (Array.isArray(parsed.projects)) {
      result.projects = parsed.projects
        .filter((p: any) => p && p.name)
        .slice(0, 6)
        .map((p: any, i: number) => ({
          id: p.id || `proj_${Date.now()}_${i}`,
          name: (p.name || '').trim().slice(0, 100),
          description: (p.description || '').trim().slice(0, 1000)
        }));
    }

    console.log('AI Structured Data:', {
      personalInfo: result.personalInfo,
      workExperience: result.workExperience?.length,
      education: result.education?.length,
      skills: result.skills?.length,
      certifications: result.certifications?.length,
      projects: result.projects?.length
    });

    return result;
  } catch {
    return null;
  }
}

function convertDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr
    .replace(/Jan[uary]?/ig, '01').replace(/Feb[ruary]?/ig, '02').replace(/Mar[ch]?/ig, '03')
    .replace(/Apr[il]?/ig, '04').replace(/May/ig, '05').replace(/Jun[e]?/ig, '06')
    .replace(/Jul[y]?/ig, '07').replace(/Aug[ust]?/ig, '08').replace(/Sep[t]?[ember]?/ig, '09')
    .replace(/Oct[ober]?/ig, '10').replace(/Nov[ember]?/ig, '11').replace(/Dec[ember]?/ig, '12')
    .replace(/\s+/g, '-')
    .replace(/(\d{2})-(\d{4})/, '$2-$1');
}

function buildResumeDataFromText(text: string): Partial<ResumeData> {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const lowerText = text.toLowerCase();

  // Enhanced section detection patterns
  const sectionPatterns = {
    experience: /(?:work\s+)?(?:professional\s+)?experience|employment\s+(?:history|background)|career\s+(?:history|summary)|work\s+history/i,
    education: /education|academic\s+(?:background|qualifications)|qualifications|degrees?/i,
    skills: /(?:technical\s+)?skills|core\s+competencies|proficienc(?:y|ies)|technologies|expertise/i,
    projects: /projects?|portfolio|personal\s+projects|key\s+projects/i,
    certifications: /certifications?|licenses?|credentials|professional\s+development/i,
    summary: /(?:professional\s+)?(?:summary|profile|objective|about)/i
  };

  // Extract personal information with enhanced patterns
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[^\s\n]+/i);
  const githubMatch = text.match(/(https?:\/\/)?(www\.)?github\.com\/[^\s\n]+/i);
  const websiteMatch = text.match(/(https?:\/\/[^\s\n]+)/g);

  // Enhanced name extraction - look for capitalized words at the start
  let fullName = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line && line.length > 5 && line.length < 60) {
      // Check if it looks like a name (2+ words, properly capitalized, no special chars)
      const words = line.split(' ').filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(word => /^[A-Z][a-z]+$/.test(word)) &&
          !emailMatch?.[0]?.includes(line) && 
          !phoneMatch?.[0]?.includes(line)) {
        fullName = line;
        break;
      }
    }
  }

  // Enhanced location extraction
  const locationPatterns = [
    /([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?/, // City, State ZIP
    /([A-Za-z\s]+),\s*([A-Z]{2})/, // City, State
    /([A-Za-z\s]+),\s*([A-Za-z\s]+)/ // City, Country
  ];
  let location = '';
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      location = match[0];
      break;
    }
  }

  // Enhanced skills extraction with comprehensive patterns
  const skillPatterns = [
    /(?:technical\s+)?skills?[:\s]*([^\n]*(?:\n(?!\n)[^\n]*)*)/i,
    /(?:technologies|programming\s+languages?|tools?)[:\s]*([^\n]*(?:\n(?!\n)[^\n]*)*)/i,
    /(?:proficient\s+(?:in|with)|experienced\s+(?:in|with)|knowledge\s+of)[:\s]*([^\n]*)/i,
    /(?:core\s+competencies|technical\s+expertise)[:\s]*([^\n]*(?:\n(?!\n)[^\n]*)*)/i,
    /(?:software|platforms|frameworks)[:\s]*([^\n]*(?:\n(?!\n)[^\n]*)*)/i,
  ];

  const skills: Skill[] = [];
  const technicalSkills = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'Scala', 'Rust', 'R', 'MATLAB', 'Perl',
    // Frontend Technologies
    'React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'jQuery', 'Webpack', 'Vite', 'Next.js', 'Nuxt.js',
    // Backend Technologies
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'ASP.NET', 'Ruby on Rails', 'FastAPI', 'Gin', 'Echo',
    // Databases
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Oracle', 'SQLite', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible', 'Helm',
    // Tools & Software
    'Git', 'GitHub', 'GitLab', 'Jira', 'Linux', 'Windows', 'macOS', 'Figma', 'Photoshop', 'Illustrator', 'Sketch', 'InVision',
    // Data & Analytics
    'Machine Learning', 'AI', 'Data Science', 'Tableau', 'Power BI', 'Excel', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch',
    // Mobile Development
    'iOS', 'Android', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova',
    // Testing & Quality
    'Jest', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing', 'TDD', 'BDD',
    // Other Technical
    'GraphQL', 'REST API', 'Microservices', 'Blockchain', 'IoT', 'Agile', 'Scrum', 'Kanban', 'SOLID', 'Design Patterns'
  ];

  // Look for skills section
  for (const pattern of skillPatterns) {
    const match = text.match(pattern);
    if (match) {
      const skillsText = match[1];
      // Extract skills from the matched text
      const extractedSkills = skillsText.split(/[,•·|;]/).map(s => s.trim()).filter(s => s && s.length > 1 && s.length < 30);
      extractedSkills.forEach((skill, idx) => {
        if (skills.length < 15) {
          skills.push({
            id: String(Date.now() + idx),
            name: skill,
            level: 'Intermediate' as const
          });
        }
      });
      break;
    }
  }

  // If no skills found in dedicated section, look for common technical terms
  if (skills.length === 0) {
    technicalSkills.forEach((skill, idx) => {
      if (text.toLowerCase().includes(skill.toLowerCase()) && skills.length < 15) {
        skills.push({
          id: String(Date.now() + idx),
          name: skill,
          level: 'Intermediate' as const
        });
      }
    });
  }

  // Enhanced work experience extraction with smart pattern matching
  const workExperience: WorkExperience[] = [];
  const expSectionStart = text.search(sectionPatterns.experience);

  if (expSectionStart > -1) {
    let expSection = text.substring(expSectionStart);

    // Find the end of experience section (start of next major section)
    const nextSectionMatch = expSection.search(/(?:education|skills|projects|certifications)/i);
    if (nextSectionMatch > -1) {
      expSection = expSection.substring(0, nextSectionMatch);
    }

    const expLines = expSection.split('\n').map(l => l.trim()).filter(l => l);

    let currentJob: Partial<WorkExperience> = {};
    let descriptions: string[] = [];

    // Enhanced job title/company patterns
    const jobPatterns = [
      /^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[|•]\s*(.+?))?$/i,           // "Position at Company | Location"
      /^(.+?)\s*[-–—]\s*(.+?)(?:\s*[|•]\s*(.+?))?$/i,              // "Position - Company | Location"
      /^(.+?),\s*(.+?)(?:\s*[|•]\s*(.+?))?$/i,                     // "Position, Company | Location"
      /^(.+?)\s*\|\s*(.+?)(?:\s*[|•]\s*(.+?))?$/i                  // "Position | Company | Location"
    ];

    // Enhanced date patterns
    const datePatterns = [
      /(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)/i,   // "Jan 2020 - Dec 2023"
      /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)/i, // "01/2020 - 12/2023"
      /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i,               // "2020 - 2023"
      /(present|current)/i                                         // Just "Present"
    ];

    for (let i = 0; i < expLines.length && workExperience.length < 10; i++) {
      const line = expLines[i].trim();
      if (!line || line.length < 3) continue;

      // Check if this line matches job title/company pattern
      let jobMatch = null;
      for (const pattern of jobPatterns) {
        jobMatch = line.match(pattern);
        if (jobMatch) break;
      }

      // Check if this line contains dates
      let dateMatch = null;
      for (const pattern of datePatterns) {
        dateMatch = line.match(pattern);
        if (dateMatch) break;
      }

      if (jobMatch && line.length < 120) {
        // Save previous job if exists
        if (currentJob.position && currentJob.company) {
          workExperience.push({
            id: String(Date.now() + workExperience.length),
            company: currentJob.company,
            position: currentJob.position,
            startDate: convertDateToISO(currentJob.startDate || ''),
            endDate: currentJob.isCurrentJob ? '' : convertDateToISO(currentJob.endDate || ''),
            isCurrentJob: currentJob.isCurrentJob || false,
            description: descriptions.join('\n').substring(0, 500)
          });
        }

        // Start new job entry
        currentJob = {
          position: jobMatch[1].trim(),
          company: jobMatch[2].trim(),
          location: jobMatch[3]?.trim() || '',
          startDate: '',
          endDate: '',
          isCurrentJob: false
        };
        descriptions = [];

      } else if (dateMatch) {
        // Parse date information
        if (currentJob.position || currentJob.company) {
          currentJob.startDate = dateMatch[1] || '';
          if (dateMatch[2]) {
            const endDateStr = dateMatch[2].toLowerCase();
            currentJob.isCurrentJob = endDateStr.includes('present') || endDateStr.includes('current');
            currentJob.endDate = currentJob.isCurrentJob ? '' : dateMatch[2];
          }
        }

      } else if (line.match(/^[•\-\*]\s/) || (line.length > 15 && line.length < 300)) {
        // This looks like a job description or responsibility
        if (currentJob.position || currentJob.company) {
          descriptions.push(line.replace(/^[•\-\*]\s*/, '• '));
        }
      }
    }

    // Don't forget the last job
    if (currentJob.position && currentJob.company) {
      workExperience.push({
        id: String(Date.now() + workExperience.length),
        company: currentJob.company,
        position: currentJob.position,
        startDate: convertDateToISO(currentJob.startDate || ''),
        endDate: currentJob.isCurrentJob ? '' : convertDateToISO(currentJob.endDate || ''),
        isCurrentJob: currentJob.isCurrentJob || false,
        description: descriptions.join('\n').substring(0, 500)
      });
    }
  }

  // Enhanced education extraction
  const education: Education[] = [];
  const eduSectionPattern = /education|academic\s+background|qualifications/i;
  const eduSectionMatch = text.search(eduSectionPattern);

  if (eduSectionMatch > -1) {
    const eduSection = text.substring(eduSectionMatch);
    const eduLines = eduSection.split('\n').slice(1);

    for (let i = 0; i < eduLines.length && education.length < 3; i++) {
      const line = eduLines[i].trim();
      if (!line) continue;

      const degreePattern = /(bachelor|master|phd|doctorate|associate|certificate|diploma)/i;
      const schoolPattern = /(university|college|institute|school)/i;

      if (degreePattern.test(line) || schoolPattern.test(line)) {
        const parts = line.split(/[-–—|]/).map(p => p.trim());
        education.push({
          id: String(Date.now() + i),
          school: parts.find(p => schoolPattern.test(p)) || parts[parts.length - 1] || '',
          degree: parts.find(p => degreePattern.test(p)) || parts[0] || '',
          field: '',
          graduationDate: ''
        });
      }
    }
  }

  // Extract summary/objective
  const summaryPattern = /(?:summary|objective|about|profile)[:\s]*([^\n]*(?:\n(?!\n)[^\n]*)*)/i;
  const summaryMatch = text.match(summaryPattern);
  let summary = '';
  if (summaryMatch) {
    summary = summaryMatch[1].trim().substring(0, 500);
  } else {
    // Use first meaningful paragraph as summary
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
    if (paragraphs.length > 0) {
      summary = paragraphs[0].replace(/\n/g, ' ').substring(0, 300);
    }
  }

  // Create custom sections for raw data
  const customSections = [
    {
      id: String(Date.now() + 999),
      title: 'Original Resume Content',
      content: text.substring(0, 2000)
    }
  ];

  return {
    personalInfo: {
      fullName: fullName || '',
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      location: location || '',
      linkedin: linkedinMatch?.[0] || '',
      github: githubMatch?.[0] || '',
      website: websiteMatch?.find(url => !linkedinMatch?.[0]?.includes(url) && !githubMatch?.[0]?.includes(url)) || '',
      summary: summary
    },
    workExperience,
    education,
    skills,
    certifications: [],
    projects: [],
    customSections
  } as Partial<ResumeData>;
}

async function parseTextToResumeData(rawText: string): Promise<Partial<ResumeData>> {
  const extractedData = buildResumeDataFromText(rawText);
  const aiData = await aiStructureFromText(rawText);

  if (aiData) {
    return {
      ...extractedData,
      personalInfo: {
        ...extractedData.personalInfo,
        ...(aiData.personalInfo || {})
      } as any,
      workExperience: aiData.workExperience?.length ? aiData.workExperience : extractedData.workExperience,
      education: aiData.education?.length ? aiData.education : extractedData.education,
      skills: aiData.skills?.length ? aiData.skills : extractedData.skills,
      certifications: aiData.certifications?.length ? aiData.certifications : extractedData.certifications,
      projects: aiData.projects?.length ? aiData.projects : extractedData.projects
    } as Partial<ResumeData>;
  }

  return extractedData;
}


interface ResumeUploaderProps {
  onResumeExtracted: (resumeData: Partial<ResumeData>) => void;
  externalFile?: File | null;
  onExternalFileProcessed?: () => void;
}

export function ResumeUploader({ onResumeExtracted, externalFile, onExternalFileProcessed }: ResumeUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const processResumeFile = async (file: File) => {
    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    try {
      // Validate file type (fall back to extension when type is empty)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const lowerName = (file.name || '').toLowerCase();
      const ext = lowerName.split('.').pop() || '';
      const typeOk = allowedTypes.includes(file.type) || ['pdf','doc','docx','txt'].includes(ext);
      if (!typeOk) {
        throw new Error('Please upload a PDF, DOCX or TXT file');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Realistic processing steps with progress updates
      const steps = [
        { message: 'Initializing smart AI resume parser...', progress: 10, delay: 500 },
        { message: 'Extracting text from document...', progress: 20, delay: 800 },
        { message: 'Identifying personal information...', progress: 35, delay: 700 },
        { message: 'Parsing work experience and dates...', progress: 50, delay: 900 },
        { message: 'Analyzing skills and technologies...', progress: 65, delay: 800 },
        { message: 'Processing education and certifications...', progress: 80, delay: 700 },
        { message: 'Structuring resume sections...', progress: 90, delay: 600 },
        { message: 'Finalizing smart import...', progress: 100, delay: 400 }
      ];

      for (const step of steps) {
        setCurrentStep(step.message);
        await new Promise(resolve => setTimeout(resolve, step.delay));
        setProgress(step.progress);
      }

      // Extract actual text from the uploaded file
      let rawText = '';
      let extractedData: Partial<ResumeData> = {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          website: '',
          summary: ''
        },
        workExperience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        languages: [],
        references: [],
        customSections: []
      };

      const isPdf = file.type === 'application/pdf' || ext === 'pdf';
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx';
      const isTxt = file.type === 'text/plain' || ext === 'txt';

      if (isPdf) {
        const body = new FormData();
        body.append('file', file);

        try {
          const resp = await fetch('/api/parse-pdf', { 
            method: 'POST', 
            body
          });

          if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            throw new Error(errorData.error || `PDF parsing failed with status ${resp.status}`);
          }

          const data = await resp.json();
          rawText = data.text || '';

          if (!rawText || rawText.length < 10) {
            throw new Error('No text could be extracted from the PDF. Please try a DOCX or TXT file.');
          }

          // Use AI structured data if available
          if (data.structuredData) {
            const aiData = data.structuredData;
            extractedData = {
              personalInfo: {
                fullName: aiData.personalInfo?.fullName || '',
                email: aiData.personalInfo?.email || '',
                phone: aiData.personalInfo?.phone || '',
                location: aiData.personalInfo?.location || '',
                summary: aiData.personalInfo?.summary || ''
              },
              workExperience: (aiData.workExperience || []).map((w: any, i: number) => ({
                id: `work_${Date.now()}_${i}`,
                company: w.company || '',
                position: w.position || '',
                startDate: w.startDate || '',
                endDate: w.endDate || '',
                isCurrentJob: !w.endDate || w.endDate === '',
                description: w.description || ''
              })),
              education: (aiData.education || []).map((e: any, i: number) => ({
                id: `edu_${Date.now()}_${i}`,
                school: e.school || '',
                degree: e.degree || '',
                field: e.field || '',
                graduationDate: e.graduationDate || ''
              })),
              skills: (aiData.skills || []).map((skill: string, i: number) => ({
                id: `skill_${Date.now()}_${i}`,
                name: skill,
                level: 'Intermediate' as const
              })),
              certifications: [],
              projects: [],
              languages: [],
              references: [],
              customSections: []
            };
          }

          console.log('PDF parsed successfully, text length:', rawText.length);

        } catch (error) {
          console.error('PDF parsing error:', error);
          throw error instanceof Error ? error : new Error('Failed to parse PDF file');
        }
      } else if (isDocx) {
        rawText = await extractTextFromDocx(file);
      } else if (isTxt) {
        rawText = await extractTextFromTxt(file);
      } else if (file.type === 'application/msword') {
        throw new Error('Legacy .doc files are not supported in-browser. Please upload a PDF, DOCX, or TXT.');
      }

      // Heuristic parse first
      let heuristicData: Partial<ResumeData> = buildResumeDataFromText(rawText || '');

      // AI structuring to improve mapping
      const aiData = await aiStructureFromText(rawText);
      if (aiData) {
        extractedData = {
          ...heuristicData, // Start with heuristic data
          personalInfo: {
            ...heuristicData.personalInfo,
            ...(aiData.personalInfo || {})
          } as any,
          workExperience: aiData.workExperience?.length ? aiData.workExperience : heuristicData.workExperience,
          education: aiData.education?.length ? aiData.education : heuristicData.education,
          skills: aiData.skills?.length ? aiData.skills : heuristicData.skills,
          certifications: aiData.certifications?.length ? aiData.certifications : heuristicData.certifications,
          projects: aiData.projects?.length ? aiData.projects : heuristicData.projects
        } as Partial<ResumeData>;
      } else {
        // If we couldn't get structured data from AI, use basic text parsing
        extractedData = heuristicData;
      }

      // If still no meaningful data, use text summary
      if (!extractedData.personalInfo?.fullName && !extractedData.workExperience?.length) {
        extractedData.personalInfo!.summary = rawText.slice(0, 500);
      }

      // Ensure we have valid data structure
      const finalData: Partial<ResumeData> = {
        personalInfo: {
          fullName: extractedData.personalInfo?.fullName || '',
          email: extractedData.personalInfo?.email || '',
          phone: extractedData.personalInfo?.phone || '',
          location: extractedData.personalInfo?.location || '',
          linkedin: extractedData.personalInfo?.linkedin || '',
          website: extractedData.personalInfo?.website || '',
          summary: extractedData.personalInfo?.summary || ''
        },
        workExperience: extractedData.workExperience || [],
        education: extractedData.education || [],
        skills: extractedData.skills || [],
        certifications: extractedData.certifications || [],
        projects: extractedData.projects || [],
        languages: extractedData.languages || [],
        references: extractedData.references || [],
        customSections: extractedData.customSections || []
      };
      
      setStatus('success');
      setCurrentStep('Resume successfully imported!');
      onResumeExtracted(finalData);
      if (onExternalFileProcessed) {
        onExternalFileProcessed();
      }

      // Reset after success
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setCurrentStep('');
      }, 3000);

    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while processing the file');
      setCurrentStep('');
      console.error('Error processing resume:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (externalFile) {
      processResumeFile(externalFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      processResumeFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processResumeFile(file);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <div className="loading-spinner h-8 w-8"></div>;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return (
          <div className="relative">
            <Upload className="h-8 w-8 text-indigo-500" />
            <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return currentStep || 'Processing your resume...';
      case 'success':
        return 'Resume successfully imported with AI enhancement!';
      case 'error':
        return errorMessage || 'Error processing resume. Please try again.';
      default:
        return 'Import your existing resume and let AI enhance it instantly';
    }
  };

  const getContainerClasses = () => {
    let classes = 'transition-all duration-300 ';

    if (isDragOver) {
      classes += 'border-indigo-400 bg-indigo-50 scale-105 ';
    } else if (status === 'processing') {
      classes += 'border-indigo-300 bg-indigo-50 ';
    } else if (status === 'success') {
      classes += 'border-emerald-300 bg-emerald-50 ';
    } else if (status === 'error') {
      classes += 'border-red-300 bg-red-50 ';
    } else {
      classes += 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 ';
    }

    return classes;
  };

  return (
    <Card className={`card-modern ${getContainerClasses()}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">Smart Resume Import</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div 
          className="flex flex-col items-center space-y-6 p-12 rounded-2xl border-2 border-dashed transition-all duration-300"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ borderColor: isDragOver ? '#6366f1' : '#d1d5db' }}
        >
          {getStatusIcon()}

          <div className="max-w-md">
            <p className="text-lg font-medium mb-3 text-gray-800">
              {getStatusMessage()}
            </p>
            {status === 'idle' && (
              <p className="text-sm text-gray-600">
                Drag and drop your resume here, or click to browse. Our AI will extract and enhance your content automatically.
              </p>
            )}
          </div>

          {isProcessing && (
            <div className="w-full max-w-sm space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-indigo-600 font-medium">{progress}% complete</p>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button asChild className="btn-primary cursor-pointer text-base px-8 py-3">
                  <span>
                    <Upload className="h-5 w-5 mr-3" />
                    Choose File
                  </span>
                </Button>
              </label>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Supports PDF, DOC, DOCX, and TXT files</p>
                <p>Maximum file size: 10MB</p>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-600 font-medium">AI-Powered Enhancement</span>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <Button
              onClick={() => {
                setStatus('idle');
                setErrorMessage('');
                setProgress(0);
                setCurrentStep('');
              }}
              variant="outline"
              className="mt-4 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          )}

          {status === 'success' && (
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to customize your resume!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}