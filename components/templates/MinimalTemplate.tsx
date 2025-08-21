
'use client';

import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

import { ResumeData } from '@/types/resume';

interface MinimalTemplateProps {
  resumeData: ResumeData;
}

export function MinimalTemplate({ resumeData }: MinimalTemplateProps) {
  // Safety check for resumeData
  if (!resumeData) {
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
    <div className="w-full max-w-4xl mx-auto bg-white p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light mb-2">
          {personalInfo?.fullName || ''}
        </h1>
        
        <div className="text-sm text-gray-600 space-y-1">
          {personalInfo?.email && <div>{personalInfo.email}</div>}
          {personalInfo?.phone && <div>{personalInfo.phone}</div>}
          {personalInfo?.location && <div>{personalInfo.location}</div>}
          {personalInfo?.website && <div>{personalInfo.website}</div>}
          {personalInfo?.linkedin && <div>LinkedIn</div>}
        </div>
        
        {personalInfo?.summary && (
          <p className="mt-4 text-gray-800 leading-relaxed">
            {personalInfo.summary}
          </p>
        )}
      </div>

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">
            Experience
          </h2>
          {workExperience.map((job) => (
            <div key={job.id} className="mb-6 last:mb-0">
              <div className="mb-2">
                <h3 className="font-medium">{job.position}</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{job.company}</span>
                  <span>{formatDate(job.startDate)} - {job.isCurrentJob ? 'Present' : formatDate(job.endDate)}</span>
                </div>
              </div>
              {job.description && (
                <div className="text-gray-700 text-sm">
                  {job.description.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-1">{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4 last:mb-0">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-sm">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                  {edu.field && <p className="text-xs text-gray-500">{edu.field}</p>}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(edu.graduationDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">
            Skills
          </h2>
          <div className="text-sm text-gray-700">
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}{index < skills.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">
            Projects
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4 last:mb-0">
              <h3 className="font-medium text-sm">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-gray-700 mt-1">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">
            Certifications
          </h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="mb-2 last:mb-0">
              <h3 className="font-medium text-sm">{cert.name}</h3>
              {cert.description && (
                <p className="text-sm text-gray-700">{cert.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-5xl font-light mb-6 tracking-wide text-purple-700">{personalInfo.fullName || 'Your Name'}</h1>
        {personalInfo.title && (
          <p className="text-xl text-gray-600 mb-4">{personalInfo.title}</p>
        )}
        <div className="flex flex-wrap gap-8 text-sm text-gray-600 border-b pb-6">
          {personalInfo.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {personalInfo.location}
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              {personalInfo.website}
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </div>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-4 uppercase tracking-wider">
            Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {workExperience && workExperience.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-6 uppercase tracking-wider">
            Experience
          </h2>
          <div className="space-y-8">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{exp.position}</h3>
                    <p className="text-lg text-gray-700">{exp.company}</p>
                    {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-600 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-6 uppercase tracking-wider">
            Education
          </h2>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-lg text-gray-700">{edu.school}</p>
                    {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(edu.graduationDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-6 uppercase tracking-wider">
            Projects
          </h2>
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 mt-2">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {project.technologies.join(' • ')}
                      </p>
                    )}
                    {project.url && (
                      <p className="text-sm text-purple-600 mt-1">{project.url}</p>
                    )}
                  </div>
                  {(project.startDate || project.endDate) && (
                    <div className="text-sm text-gray-500">
                      {project.startDate && formatDate(project.startDate)} 
                      {project.startDate && project.endDate && ' - '}
                      {project.endDate && formatDate(project.endDate)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-6 uppercase tracking-wider">
            Certifications
          </h2>
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-gray-700">{cert.issuer}</p>
                    {cert.url && <p className="text-sm text-purple-600">{cert.url}</p>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(cert.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-medium text-gray-800 mb-6 uppercase tracking-wider">
            Languages
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang) => (
              <div key={lang.id} className="flex justify-between items-center">
                <span className="text-gray-900">{lang.name}</span>
                <span className="text-sm text-gray-600">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-6 uppercase tracking-wider">
            Skills
          </h2>
          <div className="space-y-4">
            {['Expert', 'Advanced', 'Intermediate', 'Beginner'].map(level => {
              const levelSkills = skills.filter(skill => skill.level === level);
              if (levelSkills.length === 0) return null;
              
              return (
                <div key={level}>
                  <h3 className="font-medium text-gray-700 mb-2">{level}</h3>
                  <p className="text-gray-600">
                    {levelSkills.map(skill => skill.name).join(' • ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
