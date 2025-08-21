'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/types/resume';
import {
  Target,
  Search,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Plus,
  Briefcase,
  Zap,
  BarChart3,
  Eye,
  Brain,
  X
} from 'lucide-react';

interface JobMatchAnalyzerProps {
  resumeData: ResumeData;
  onOptimize: (optimizations: any) => void;
}

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: MatchSuggestion[];
  keywordDensity: { [key: string]: number };
  atsScore: number;
  competitiveness: 'low' | 'medium' | 'high';
}

interface MatchSuggestion {
  id: string;
  type: 'skill' | 'keyword' | 'experience' | 'format';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export function JobMatchAnalyzer({ resumeData, onOptimize }: JobMatchAnalyzerProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Array<{ title: string; company: string; score: number }>>([]);

  const analyzeMatch = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) return;

    setIsAnalyzing(true);

    // Simulate comprehensive job matching analysis
    await new Promise(resolve => setTimeout(resolve, 3500));

    // Build a single text blob from resume content with safe fallbacks
    const resumeText = `
      ${resumeData.personalInfo.fullName || ''}
      ${resumeData.personalInfo.title || ''}
      ${resumeData.personalInfo.summary || ''}
      ${(resumeData.workExperience || []).map(exp => `${exp.position || ''} ${exp.company || ''} ${exp.description || ''}`).join(' ')}
      ${(resumeData.education || []).map(edu => `${edu.degree || ''} ${edu.institution || ''} ${edu.field || ''}`).join(' ')}
      ${(resumeData.skills || []).map(skill => skill.name).join(' ')}
      ${(resumeData.projects || []).map(proj => `${proj.title || ''} ${proj.description || ''} ${(proj.technologies || []).join(' ')}`).join(' ') || ''}
      ${(resumeData.certifications || []).map(cert => `${cert.name || ''} ${cert.issuer || ''}`).join(' ') || ''}
    `.toLowerCase();

    // Extract and analyze keywords from job description
    const jobText = `${jobTitle} ${jobDescription}`.toLowerCase();
    const commonTechKeywords = [
      'javascript', 'js', 'python', 'react', 'reactjs', 'node.js', 'nodejs', 'node', 'typescript', 'ts',
      'aws', 'amazon web services', 'docker', 'kubernetes', 'k8s', 'sql', 'mysql', 'postgresql', 'postgres',
      'mongodb', 'mongo', 'git', 'github', 'gitlab', 'agile', 'scrum', 'ci/cd', 'jenkins', 'api', 'rest',
      'restful', 'graphql', 'microservices', 'cloud', 'azure', 'gcp', 'google cloud', 'devops', 'terraform',
      'ansible', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'frontend', 'front-end', 'backend',
      'back-end', 'full-stack', 'fullstack', 'database', 'testing', 'unit testing', 'integration testing',
      'security', 'cybersecurity', 'html', 'css', 'sass', 'less', 'webpack', 'babel', 'jest', 'cypress',
      'selenium', 'redux', 'vue', 'vuejs', 'angular', 'angularjs', 'express', 'expressjs', 'spring',
      'django', 'flask', 'laravel', 'php', 'java', 'c++', 'c#', 'ruby', 'rails', 'go', 'golang', 'rust',
      'swift', 'kotlin', 'scala', 'r', 'matlab', 'tableau', 'power bi', 'excel', 'jira', 'confluence',
      'slack', 'teams', 'zoom', 'figma', 'sketch', 'photoshop', 'illustrator', 'linux', 'unix', 'bash',
      'shell', 'powershell', 'windows', 'macos', 'ios', 'android', 'mobile', 'responsive', 'ui', 'ux',
      'user experience', 'user interface', 'design', 'wireframe', 'prototype', 'mockup'
    ];

    const jobKeywords = commonTechKeywords.filter(keyword => {
      // Check for exact matches and variations
      return jobText.includes(keyword) ||
        jobText.includes(keyword.replace('.', '')) ||
        jobText.includes(keyword.replace('-', '')) ||
        jobText.includes(keyword.replace('/', '')) ||
        jobText.includes(keyword.replace(' ', ''));
    });

    // Remove duplicates and variations
    const uniqueJobKeywords = Array.from(new Set(jobKeywords));


    // Analyze resume skills against job requirements with context
    const resumeSkills = (resumeData.skills || []).map(s => s.name.toLowerCase());
    const resumeExperience = (resumeData.workExperience || []).map(exp => (exp.description || '').toLowerCase()).join(' ');

    const matchedSkills = resumeSkills.filter(skill =>
      uniqueJobKeywords.some(keyword => {
        const skillNormalized = skill.replace(/[.\s\-\/]/g, '');
        const keywordNormalized = keyword.replace(/[.\s\-\/]/g, '');

        // Check if skill matches keyword or if it's mentioned in experience
        const directMatch = skillNormalized.includes(keywordNormalized) ||
          keywordNormalized.includes(skillNormalized) ||
          skill.toLowerCase() === keyword.toLowerCase();

        const experienceMatch = resumeExperience.includes(skill) &&
          resumeExperience.includes(keyword);

        return directMatch || experienceMatch;
      })
    );

    // Find missing critical skills
    const criticalSkills = uniqueJobKeywords.filter(keyword =>
      !resumeSkills.some(skill => {
        const skillNormalized = skill.replace(/[.\s\-\/]/g, '');
        const keywordNormalized = keyword.replace(/[.\s\-\/]/g, '');
        return skillNormalized.includes(keywordNormalized) ||
          keywordNormalized.includes(skillNormalized);
      })
    );

    // Calculate years of experience match
    const currentYear = new Date().getFullYear();
    const totalExperience = (resumeData.workExperience || []).reduce((total, exp) => {
      const startYear = exp.startDate ? new Date(exp.startDate + '-01').getFullYear() : currentYear;
      const endYear = exp.current ? currentYear :
        exp.endDate ? new Date(exp.endDate + '-01').getFullYear() : currentYear;
      return total + Math.max(0, endYear - startYear);
    }, 0);

    // Check if experience level matches job requirements
    const jobTextLower = jobDescription.toLowerCase();
    let requiredExperience = 0;
    const expMatch = jobTextLower.match(/(\d+)[\s\-+]*(?:years?|yrs?)[\s\w]*(?:experience|exp)/i);
    if (expMatch) requiredExperience = parseInt(expMatch[1], 10);

    const experienceMatch = totalExperience >= requiredExperience * 0.8; // 80% match threshold

    const matchedKeywords = uniqueJobKeywords.filter(keyword =>
      resumeText.includes(keyword) ||
      resumeText.includes(keyword.replace(/[.\s\-\/]/g, ''))
    );

    const missingKeywords = uniqueJobKeywords.filter(keyword =>
      !resumeText.includes(keyword) &&
      !resumeText.includes(keyword.replace(/[.\s\-\/]/g, ''))
    );

    // Calculate comprehensive scores
    const skillMatchRate = matchedSkills.length / Math.max(uniqueJobKeywords.length, 1);
    const keywordMatchRate = matchedKeywords.length / Math.max(uniqueJobKeywords.length, 1);
    const experienceScore = experienceMatch ? 1 : Math.min(totalExperience / Math.max(requiredExperience, 1), 1);

    // Weight the scoring: 40% skills, 30% keywords, 20% experience, 10% completeness
    const completenessScore = Math.min(
      ((resumeData.workExperience || []).length * 0.3 +
        (resumeData.education || []).length * 0.2 +
        (resumeData.skills || []).length * 0.3 +
        (resumeData.personalInfo.summary ? 0.2 : 0)) / 1.0, 1
    );

    const overallScore = Math.round(
      (skillMatchRate * 0.4 +
        keywordMatchRate * 0.3 +
        experienceScore * 0.2 +
        completenessScore * 0.1) * 100
    );

    // Calculate ATS score
    const atsScore = Math.round(
      (matchedKeywords.length / Math.max(uniqueJobKeywords.length, 1)) * 100
    );

    // Determine competitiveness
    let competitiveness: 'low' | 'medium' | 'high' = 'low';
    if (overallScore >= 75) competitiveness = 'high';
    else if (overallScore >= 50) competitiveness = 'medium';

    // Generate suggestions
    const suggestions: MatchSuggestion[] = [];

    if (criticalSkills.length > 0) {
      suggestions.push({
        id: '1',
        type: 'skill',
        title: 'Add Missing Technical Skills',
        description: `Include ${criticalSkills.slice(0, 3).join(', ')} to better match job requirements`,
        priority: 'high',
        impact: 'Increases match score by 15-25%'
      });
    }

    if (missingKeywords.length > 0) {
      suggestions.push({
        id: '2',
        type: 'keyword',
        title: 'Optimize Keyword Usage',
        description: 'Incorporate more job-specific keywords throughout your resume',
        priority: 'high',
        impact: 'Improves ATS compatibility by 30%'
      });
    }

    suggestions.push({
      id: '3',
      type: 'experience',
      title: 'Tailor Experience Descriptions',
      description: 'Rewrite experience bullets to highlight relevant achievements',
      priority: 'medium',
      impact: 'Enhances relevance by 20%'
    });

    suggestions.push({
      id: '4',
      type: 'format',
      title: 'Adjust Resume Structure',
      description: 'Reorganize sections to emphasize most relevant qualifications first',
      priority: 'medium',
      impact: 'Improves readability and focus'
    });

    setMatchResult({
      score: overallScore,
      matchedSkills: matchedSkills.map(skill =>
        (resumeData.skills || []).find(s => s.name.toLowerCase() === skill)?.name || skill
      ),
      missingSkills: criticalSkills.slice(0, 8),
      matchedKeywords: matchedKeywords.slice(0, 10),
      missingKeywords: missingKeywords.slice(0, 8),
      suggestions,
      keywordDensity: uniqueJobKeywords.reduce((acc, keyword) => {
        acc[keyword] = Math.random() * 5 + 1;
        return acc;
      }, {} as { [key: string]: number }),
      atsScore,
      competitiveness
    });

    // Save job for comparison
    setSavedJobs(prev => [
      { title: jobTitle, company: companyName || 'Unknown Company', score: overallScore },
      ...prev.slice(0, 4)
    ]);

    setIsAnalyzing(false);
  };

  const optimizeForJob = () => {
    if (!matchResult) return;

    const optimizations = {
      type: 'job-optimization',
      addSkills: matchResult.missingSkills.slice(0, 5),
      addKeywords: matchResult.missingKeywords.slice(0, 5),
      enhanceSummary: `Optimize summary for ${jobTitle} role at ${companyName}`,
      jobTitle,
      companyName
    };

    onOptimize(optimizations);
  };

  const clearAnalysis = () => {
    setMatchResult(null);
    setJobTitle('');
    setJobDescription('');
    setCompanyName('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'score-excellent';
    if (score >= 50) return 'score-good';
    if (score >= 25) return 'score-fair';
    return 'score-poor';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    if (score >= 25) return 'Fair Match';
    return 'Poor Match';
  };

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'high': return 'status-success';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'status-error';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Card className="border-blue-200" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)' }}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 icon-primary">
          <Target className="h-5 w-5" />
          <span>Job Match Analyzer</span>
          {matchResult && (
            <Badge variant="secondary" className="ml-2">
              {matchResult.score}% match
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Job Input Form */}
          {!matchResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job-title" className="form-label">Job Title *</Label>
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="company-name" className="form-label">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="job-description" className="form-label">Job Description *</Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={6}
                  className="form-textarea"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--figma-neutral-500)' }}>
                  Include requirements, responsibilities, and preferred qualifications for best results
                </p>
              </div>

              <Button
                onClick={analyzeMatch}
                disabled={isAnalyzing || !jobTitle.trim() || !jobDescription.trim()}
                className="w-full btn-primary"
              >
                {isAnalyzing ? (
                  <>
                    <div className="loading-spinner h-4 w-4 mr-2" />
                    Analyzing Job Match...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Job Match
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Analysis Results */}
          {matchResult && (
            <div className="space-y-6">
              {/* Header with Clear Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--figma-neutral-800)' }}>
                    {jobTitle} {companyName && `at ${companyName}`}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAnalysis}
                  style={{ color: 'var(--figma-neutral-500)' }}
                  className="hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Overall Match Score */}
              <div className="bg-white rounded-lg border p-6 text-center">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(matchResult.score)}`}>
                  {matchResult.score}%
                </div>
                <p className="text-lg font-medium mb-1" style={{ color: 'var(--figma-neutral-700)' }}>Job Match Score</p>
                <p className="text-sm mb-4" style={{ color: 'var(--figma-neutral-500)' }}>{getScoreLabel(matchResult.score)}</p>
                <Progress value={matchResult.score} className="h-3" />

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--figma-neutral-200)' }}>
                  <div>
                    <div className={`text-2xl font-bold ${getScoreColor(matchResult.atsScore)}`}>
                      {matchResult.atsScore}%
                    </div>
                    <p className="text-sm" style={{ color: 'var(--figma-neutral-600)' }}>ATS Score</p>
                  </div>
                  <div>
                    <Badge variant="outline" className={getCompetitivenessColor(matchResult.competitiveness)}>
                      {matchResult.competitiveness} competitiveness
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                {matchResult.matchedSkills.length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-5 w-5 icon-success" />
                      <h3 className="font-semibold" style={{ color: 'var(--figma-neutral-800)' }}>Matched Skills ({matchResult.matchedSkills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchedSkills.map((skill, index) => (
                        <Badge key={index} className="status-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {matchResult.missingSkills.length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 icon-warning" />
                      <h3 className="font-semibold" style={{ color: 'var(--figma-neutral-800)' }}>Missing Skills ({matchResult.missingSkills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                          <Plus className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Keywords */}
                {matchResult.matchedKeywords.length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Eye className="h-5 w-5 icon-primary" />
                      <h3 className="font-semibold" style={{ color: 'var(--figma-neutral-800)' }}>Found Keywords ({matchResult.matchedKeywords.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="status-info">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {matchResult.missingKeywords.length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="h-5 w-5 icon-accent" />
                      <h3 className="font-semibold" style={{ color: 'var(--figma-neutral-800)' }}>Add Keywords ({matchResult.missingKeywords.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                          <Plus className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Optimization Suggestions */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--figma-neutral-800)' }}>
                  <Brain className="h-5 w-5 icon-secondary mr-2" />
                  Optimization Suggestions
                </h3>
                <div className="space-y-3">
                  {matchResult.suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--figma-neutral-50)' }}>
                      <TrendingUp className="h-4 w-4 icon-secondary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" style={{ color: 'var(--figma-neutral-800)' }}>{suggestion.title}</h4>
                        <p className="text-xs mt-1" style={{ color: 'var(--figma-neutral-600)' }}>{suggestion.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.priority} priority
                          </Badge>
                          <span className="text-xs" style={{ color: 'var(--figma-neutral-500)' }}>{suggestion.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={optimizeForJob}
                  className="btn-primary flex-1"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Optimize Resume for This Job
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAnalysis}
                  className="btn-outline"
                >
                  Analyze Another Job
                </Button>
              </div>
            </div>
          )}

          {/* Saved Job Comparisons */}
          {savedJobs.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--figma-neutral-800)' }}>
                <BarChart3 className="h-5 w-5 mr-2" style={{ color: 'var(--figma-neutral-600)' }} />
                Recent Job Matches
              </h3>
              <div className="space-y-2">
                {savedJobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--figma-neutral-50)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--figma-neutral-800)' }}>{job.title}</p>
                      <p className="text-xs" style={{ color: 'var(--figma-neutral-600)' }}>{job.company}</p>
                    </div>
                    <div className={`font-bold ${getScoreColor(job.score)}`}>
                      {job.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
