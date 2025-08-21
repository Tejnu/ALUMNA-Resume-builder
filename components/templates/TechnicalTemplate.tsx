'use client';

import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, GraduationCap, Briefcase, Award, Code, Languages, User, Zap, BookOpen } from 'lucide-react';

interface TechnicalTemplateProps {
  resumeData: ResumeData;
}

export function TechnicalTemplate({ resumeData }: TechnicalTemplateProps) {
  if (!resumeData || !resumeData.personalInfo) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500">
        Loading template...
      </div>
    );
  }

  const { personalInfo, workExperience = [], education = [], skills = [], projects = [], certifications = [], languages = [] } = resumeData;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-full">
      <div className="p-6">
        {/* Header */}
        <div className="border-l-4 border-blue-500 pl-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-mono">{personalInfo?.fullName || ''}</h1>
          <p className="text-lg text-blue-600 mb-4 font-semibold font-mono">{personalInfo?.title || ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="break-all leading-tight">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                <Linkedin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="break-all leading-tight">{personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                <Globe className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="break-all leading-tight">{personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2">
              TECHNICAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
          </section>
        )}

        {/* Technical Skills */}
        {skills && skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2 flex items-center gap-2">
              <Code className="h-5 w-5 flex-shrink-0" />
              <span>TECHNICAL SKILLS</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['Expert', 'Advanced', 'Intermediate', 'Beginner'].map(level => {
                const levelSkills = skills.filter(skill => skill?.level === level);
                if (levelSkills.length === 0) return null;

                return (
                  <div key={level} className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">{level}</h3>
                    <div className="flex flex-wrap gap-2">
                      {levelSkills.map((skill, index) => (
                        <span
                          key={skill?.id || index}
                          className={`px-3 py-1 rounded-md text-xs font-medium border ${
                            level === 'Expert' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            level === 'Advanced' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            level === 'Intermediate' ? 'bg-green-100 text-green-800 border-green-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {skill?.name || 'Unknown Skill'}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience */}
        {workExperience && workExperience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-6">
              {workExperience.map((exp, index) => (
                <div key={exp?.id || index} className="relative">
                  {index !== workExperience.length - 1 && (
                    <div className="absolute left-0 top-8 bottom-0 w-px bg-purple-200"></div>
                  )}
                  <div className="flex">
                    <div className="flex-shrink-0 w-4 h-4 bg-purple-600 rounded-full mt-1 mr-4"></div>
                    <div className="flex-grow">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{exp?.position || 'Position'}</h3>
                          <p className="text-purple-600 font-semibold">{exp?.company || 'Company'}</p>
                          {exp?.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                        </div>
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2 lg:mt-0 self-start">
                          {formatDate(exp?.startDate)} - {exp?.isCurrentJob ? 'Present' : formatDate(exp?.endDate)}
                        </div>
                      </div>
                      {exp?.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2">
              KEY PROJECTS
            </h2>
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    {(project.startDate || project.endDate) && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {project.startDate && formatDate(project.startDate)}
                        {project.startDate && project.endDate && ' - '}
                        {project.endDate && formatDate(project.endDate)}
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">TECHNOLOGIES:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.url && (
                    <a href={project.url} className="text-sm text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {project.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span>EDUCATION</span>
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-purple-600 font-semibold">{edu.school}</p>
                    {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                    <p className="text-sm text-gray-500 mt-1">{formatDate(edu.graduationDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2 flex items-center gap-2">
                <Award className="h-5 w-5 flex-shrink-0" />
                <span>CERTIFICATIONS</span>
              </h2>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-bold text-gray-900 text-sm">{cert.name}</h3>
                    <p className="text-purple-600 text-sm">{cert.issuer}</p>
                    <p className="text-xs text-gray-500">{formatDate(cert.date)}</p>
                    {cert.url && (
                      <a href={cert.url} className="text-xs text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-purple-700 mb-4 border-b-2 border-purple-200 pb-2 flex items-center gap-2">
              <Languages className="h-5 w-5 flex-shrink-0" />
              <span>LANGUAGES</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-900">{lang.name}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                    {lang.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}