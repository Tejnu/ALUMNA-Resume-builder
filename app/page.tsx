'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { GuidedWizard } from '@/components/GuidedWizard';
import { ResumeForm } from '@/components/ResumeForm';
import { ResumePreview } from '@/components/ResumePreview';
import { TemplateSelector } from '@/components/TemplateSelector';
import { Header } from '@/components/Header';
import { AIAssistant } from '@/components/AIAssistant';
import { ResumeAnalyzer } from '@/components/ResumeAnalyzer';
import { JobMatchAnalyzer } from '@/components/JobMatchAnalyzer';
import { ResumeUploader } from '@/components/ResumeUploader';
import { ResumeData } from '@/types/resume';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const initialResumeData: ResumeData = {
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
  customSections: [],
  selectedTemplate: 'modern'
};

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showUploader, setShowUploader] = useState(true);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardData, setWizardData] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Load data from localStorage on component mount
    const savedData = localStorage.getItem('resumeData');
    const hasSeenWizard = localStorage.getItem('hasSeenWizard');
    const hasSeenLanding = localStorage.getItem('hasSeenLanding');

    if (hasSeenLanding === 'true') {
      setShowLanding(false);
      if (savedData) {
        try {
          setResumeData(JSON.parse(savedData));
        } catch (error) {
          console.error('Error loading saved resume data:', error);
        }
      } else if (hasSeenWizard !== 'true') {
        setShowWizard(true);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever resumeData changes
    if (isLoaded) {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }
  }, [resumeData, isLoaded]);

  const handleWizardComplete = (data: any) => {
    setWizardData(data);
    setShowWizard(false);
    localStorage.setItem('hasSeenWizard', 'true');

    // Apply wizard data to resume
    const wizardEnhancements = generateWizardEnhancements(data);
    setResumeData(prev => ({ ...prev, ...wizardEnhancements }));
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
    localStorage.setItem('hasSeenWizard', 'true');
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    localStorage.setItem('hasSeenLanding', 'true');

    // Check if we should show wizard
    const hasSeenWizard = localStorage.getItem('hasSeenWizard');
    const savedData = localStorage.getItem('resumeData');

    if (!hasSeenWizard && !savedData) {
      setShowWizard(true);
    }
  };

  const generateWizardEnhancements = (data: any) => {
    const enhancements: Partial<ResumeData> = {};

    // Generate template suggestions based on wizard answers
    if (data.industry === 'tech') {
      enhancements.selectedTemplate = 'modern';
    } else if (data.industry === 'finance') {
      enhancements.selectedTemplate = 'classic';
    } else if (data.experience === 'entry') {
      enhancements.selectedTemplate = 'minimal';
    }

    return enhancements;
  };

  const updateResumeData = (updates: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  };

  const handleFileUpload = async (file: File) => {
    setPendingFile(file);
    setShowUploader(true);
  };

  const handleResumeExtracted = (extractedData: Partial<ResumeData>) => {
    // Replace all data with extracted data, keeping only the selected template
    const newResumeData: ResumeData = {
      personalInfo: extractedData.personalInfo || initialResumeData.personalInfo,
      workExperience: extractedData.workExperience || [],
      education: extractedData.education || [],
      skills: extractedData.skills || [],
      certifications: extractedData.certifications || [],
      projects: extractedData.projects || [],
      languages: extractedData.languages || [],
      references: extractedData.references || [],
      customSections: extractedData.customSections || [],
      selectedTemplate: resumeData.selectedTemplate // Keep current template selection
    };

    setResumeData(newResumeData);
    setShowUploader(false);
  };

  const handleAIEnhance = async () => {
    setIsAIProcessing(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (!apiKey) {
        await new Promise(r => setTimeout(r, 1200));
        setIsAIProcessing(false);
        return;
      }
      const prompt = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Improve this resume JSON. Return JSON with optional fields: {personalInfo?:{summary:string}, skillsToAdd?: string[], experienceEnhancements?: Array<{id:string, enhancement:string}>}. Resume: ${JSON.stringify(resumeData).slice(0, 6000)}`
              }
            ]
          }
        ]
      };
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let ai: any = {};
      try { ai = JSON.parse(text); } catch {}

      if (ai.personalInfo?.summary) {
        updateResumeData({
          personalInfo: {
            ...resumeData.personalInfo,
            summary: ai.personalInfo.summary
          }
        });
      }
      if (Array.isArray(ai.skillsToAdd) && ai.skillsToAdd.length > 0) {
        const newSkills = ai.skillsToAdd.slice(0, 10).map((s: string, i: number) => ({ id: String(Date.now() + i), name: s, level: 'Intermediate' as const }));
        updateResumeData({ skills: [...resumeData.skills, ...newSkills] });
      }
      if (Array.isArray(ai.experienceEnhancements)) {
        const updated = resumeData.workExperience.map(exp => {
          const enh = ai.experienceEnhancements.find((e: any) => e.id === exp.id);
          return enh ? { ...exp, description: enh.enhancement } : exp;
        });
        updateResumeData({ workExperience: updated });
      }
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);

    try {
      const printContent = document.getElementById('resume-preview-content');
      if (!printContent) return;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume - ${resumeData.personalInfo.fullName || 'Resume'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.5;
                color: #1f2937;
                background: white;
              }
              @page { 
                margin: 0.5in; 
                size: letter; 
              }
              .resume-content {
                width: 100%;
                max-width: none;
                margin: 0;
                padding: 0;
                background: white;
              }
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="resume-content">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsDownloading(false);
      }, 500);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setIsDownloading(false);
    }
  };

  const handleApplySuggestion = (type: string, suggestion: any) => {
    switch (type) {
      case 'skill':
        const newSkills = suggestion.suggestions.map((skill: string, index: number) => ({
          id: Date.now() + index,
          name: skill,
          level: 'Intermediate' as const
        }));
        updateResumeData({
          skills: [...resumeData.skills, ...newSkills]
        });
        break;

      case 'summary':
        updateResumeData({
          personalInfo: {
            ...resumeData.personalInfo,
            summary: suggestion.suggestion
          }
        });
        break;

      case 'experience':
        const enhancedExperience = resumeData.workExperience.map(exp => {
          const enhancement = suggestion.suggestions.find((s: any) => s.id === exp.id);
          return enhancement ? { ...exp, description: enhancement.enhancement } : exp;
        });
        updateResumeData({ workExperience: enhancedExperience });
        break;
    }
  };

  const handleAnalyzerFix = (fix: any) => {
    switch (fix.type) {
      case 'add-summary':
        updateResumeData({
          personalInfo: {
            ...resumeData.personalInfo,
            summary: 'Results-driven professional with proven expertise in delivering high-quality solutions and driving business growth. Experienced in leading cross-functional teams and implementing scalable technologies that improve efficiency by 30% and reduce costs by 25%. Passionate about innovation and continuous learning in fast-paced environments.'
          }
        });
        break;
      case 'enhance-experience':
        // Add metrics to experience descriptions
        const enhancedExp = resumeData.workExperience.map(exp => ({
          ...exp,
          description: exp.description + '\n• Improved team productivity by 30% and reduced project delivery time by 25%\n• Led cross-functional team of 6+ members across design, development, and QA\n• Implemented best practices resulting in 50% reduction in bug reports\n• Mentored 3 junior developers, with 100% promotion rate within 12 months'
        }));
        updateResumeData({ workExperience: enhancedExp });
        break;
      case 'add-keywords':
        const keywordSkills = ['Agile/Scrum', 'CI/CD', 'RESTful APIs', 'Microservices', 'Cloud Computing'].map((skill, index) => ({
          id: (Date.now() + index).toString(),
          name: skill,
          level: 'Intermediate' as const
        }));
        updateResumeData({
          skills: [...resumeData.skills, ...keywordSkills]
        });
        break;
    }
  };

  const handleJobOptimization = (optimizations: any) => {
    if (optimizations.type === 'job-optimization') {
      // Add missing skills
      if (optimizations.addSkills && optimizations.addSkills.length > 0) {
        const newSkills = optimizations.addSkills.map((skill: string, index: number) => ({
          id: (Date.now() + index).toString(),
          name: skill,
          level: 'Intermediate' as const
        }));
        updateResumeData({
          skills: [...resumeData.skills, ...newSkills]
        });
      }

      // Enhance summary with job-specific content
      if (optimizations.enhanceSummary && optimizations.jobTitle) {
        const currentSummary = resumeData.personalInfo.summary || '';
        const enhancedSummary = currentSummary + 
          ` Seeking opportunities as ${optimizations.jobTitle} to leverage expertise in ${resumeData.skills.slice(0, 3).map(s => s.name).join(', ')}.`;

        updateResumeData({
          personalInfo: {
            ...resumeData.personalInfo,
            summary: enhancedSummary
          }
        });
      }
    }
  };

  const hasContent = resumeData.personalInfo.fullName || 
                   resumeData.workExperience.length > 0 || 
                   resumeData.education.length > 0 || 
                   resumeData.skills.length > 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <GuidedWizard 
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onFileUpload={handleFileUpload}
        onAIEnhance={handleAIEnhance}
        isAIProcessing={isAIProcessing}
        onDownloadPDF={handleDownloadPDF}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Upload Section - Show when no content or explicitly requested */}
        {(!hasContent || showUploader) && (
          <div className="mb-8">
            <ResumeUploader 
              onResumeExtracted={handleResumeExtracted}
              externalFile={pendingFile}
              onExternalFileProcessed={() => setPendingFile(null)}
            />
          </div>
        )}

        <TemplateSelector
          selectedTemplate={resumeData.selectedTemplate}
          onTemplateChange={(template) => updateResumeData({ selectedTemplate: template })}
        />

        <div className="grid lg:grid-cols-5 gap-8 mt-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="form" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="form">Resume Builder</TabsTrigger>
                <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
                <TabsTrigger value="job-match">Job Match</TabsTrigger>
              </TabsList>

              <TabsContent value="form">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <ResumeForm
                    resumeData={resumeData}
                    onUpdate={updateResumeData}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="ai">
                <AIAssistant
                  resumeData={resumeData}
                  onApplySuggestion={handleApplySuggestion}
                />
              </TabsContent>

              <TabsContent value="analyzer">
                <ResumeAnalyzer
                  resumeData={resumeData}
                  onApplyFix={handleAnalyzerFix}
                />
              </TabsContent>

              <TabsContent value="job-match">
                <JobMatchAnalyzer
                  resumeData={resumeData}
                  onOptimize={handleJobOptimization}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-2 lg:sticky lg:top-8 lg:h-fit">
            <ResumePreview 
              resumeData={resumeData} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}