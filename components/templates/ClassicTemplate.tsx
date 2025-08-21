'use client';

import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface ClassicTemplateProps {
  resumeData: ResumeData;
}

export function ClassicTemplate({ resumeData }: ClassicTemplateProps) {
  if (!resumeData) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500">
        Loading template...
      </div>
    );
  }

  const { personalInfo, workExperience = [], education = [], skills = [], projects = [], certifications = [], languages = [] } = resumeData;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    if (!year || !month) return dateStr;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 font-serif text-gray-900">
      {/* Header */}
      <div className="text-center mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold mb-2">
          {personalInfo?.fullName || ''}
        </h1>
        
        <div className="text-sm text-gray-600 space-y-1">
          {personalInfo?.email && <div>{personalInfo.email}</div>}
          {personalInfo?.phone && <div>{personalInfo.phone}</div>}
          {personalInfo?.location && <div>{personalInfo.location}</div>}
          {personalInfo?.website && <div>{personalInfo.website}</div>}
          {personalInfo?.linkedin && <div>LinkedIn Profile</div>}
        </div>
        
        {personalInfo?.summary && (
          <p className="mt-4 text-gray-800 leading-relaxed max-w-3xl mx-auto">
            {personalInfo.summary}
          </p>
        )}
      </div>

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b border-gray-200 pb-2">
            PROFESSIONAL EXPERIENCE
          </h2>
          {workExperience.map((job) => (
            <div key={job.id} className="mb-6 last:mb-0">
              <div className="mb-2">
                <h3 className="text-lg font-semibold">{job.position}</h3>
                <div className="flex justify-between items-center">
                  <p className="font-medium">{job.company}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(job.startDate)} - {job.isCurrentJob ? 'Present' : formatDate(job.endDate)}
                  </p>
                </div>
              </div>
              {job.description && (
                <div className="text-gray-800 ml-4">
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b border-gray-200 pb-2">
            EDUCATION
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{edu.degree}</h3>
                  <p className="font-medium">{edu.school}</p>
                  {edu.field && <p className="text-gray-700">{edu.field}</p>}
                </div>
                <div className="text-sm text-gray-600">
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b border-gray-200 pb-2">
            SKILLS
          </h2>
          <div className="text-center">
            {skills.map((skill, index) => (
              <span key={skill.id}>
                {skill.name}{index < skills.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b border-gray-200 pb-2">
            PROJECTS
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4 last:mb-0">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              {project.description && (
                <p className="text-gray-800 mt-1">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b border-gray-200 pb-2">
            CERTIFICATIONS
          </h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="mb-2 last:mb-0">
              <h3 className="font-semibold">{cert.name}</h3>
              {cert.description && (
                <p className="text-gray-800">{cert.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto font-serif">
      {/* Header */}
      <header className="text-center mb-8 border-b-2 border-purple-300 pb-6">
        <h1 className="text-4xl font-bold mb-3">{personalInfo.fullName || 'Your Name'}</h1>
        {personalInfo.title && (
          <h2 className="text-xl text-purple-600 mb-4 font-medium">{personalInfo.title}</h2>
        )}
        <div className="text-sm text-gray-600 space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
          {personalInfo.website && <div>{personalInfo.website}</div>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-purple-700 border-b border-purple-200 pb-1">Professional Summary</h3>
          <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-purple-700 border-b border-purple-200 pb-1">Professional Experience</h3>
          <div className="space-y-6">
            {workExperience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-purple-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{exp.position}</h4>
                    <p className="text-purple-600 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-600 text-right">
                    <div>{formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}</div>
                    {exp.location && <div>{exp.location}</div>}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {exp.description.split('\n').map((line, idx) => (
                      <div key={idx} className="mb-1">{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-purple-700 border-b border-purple-200 pb-1">Education</h3>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-purple-600">{edu.school}</p>
                    {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(edu.graduationDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-purple-700 border-b border-purple-200 pb-1">Skills</h3>
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="flex justify-between">
                <span className="text-gray-700">{skill.name}</span>
                <span className="text-sm text-purple-600">{skill.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-purple-700 border-b border-purple-200 pb-1">Certifications</h3>
          <div className="space-y-3">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{cert.name}</h4>
                    {cert.issuer && <p className="text-purple-600 text-sm">{cert.issuer}</p>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(cert.date || cert.dateObtained || '')}
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
          <h3 className="text-xl font-bold mb-4 text-purple-700 border-b border-purple-200 pb-1">Projects</h3>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id}>
                <h4 className="font-semibold">{project.name}</h4>
                <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}