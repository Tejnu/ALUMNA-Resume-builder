'use client';

import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface ExecutiveTemplateProps {
  resumeData: ResumeData;
}

export function ExecutiveTemplate({ resumeData }: ExecutiveTemplateProps) {
  const { personalInfo, workExperience, education, skills, certifications, projects } = resumeData;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">{personalInfo?.fullName || ''}</h1>
          <p className="text-xl text-slate-300 mb-4">{workExperience?.[0]?.position || ''}</p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {personalInfo?.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-center">
                <Linkedin className="h-4 w-4 mr-2" />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Executive Summary */}
        {personalInfo?.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 uppercase tracking-wide">Executive Summary</h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-slate-700 leading-relaxed text-lg">{personalInfo.summary}</p>
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {workExperience && workExperience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 uppercase tracking-wide">Professional Experience</h2>
            <div className="space-y-6">
              {workExperience.map((job, index) => (
                <div key={job.id} className={`${index > 0 ? 'border-t pt-6' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{job.position}</h3>
                      <p className="text-lg text-slate-600 font-semibold">{job.company}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p className="font-semibold">
                        {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                      </p>
                    </div>
                  </div>
                  {job.description && (
                    <div className="text-slate-700 leading-relaxed">
                      {job.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-2">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wide">Education</h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-slate-900 pl-4">
                    <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                    <p className="text-slate-600 font-semibold">{edu.school}</p>
                    {edu.field && <p className="text-slate-600">{edu.field}</p>}
                    {edu.graduationDate && <p className="text-sm text-slate-500">{edu.graduationDate}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Core Competencies */}
          {skills && skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wide">Core Competencies</h2>
              <div className="grid grid-cols-2 gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-slate-100 px-3 py-2 rounded text-sm font-medium text-slate-700">
                    {skill.name}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Additional Sections */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wide">Certifications</h2>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="font-semibold text-slate-800">{cert.name}</h3>
                    {cert.description && <p className="text-slate-600 text-sm">{cert.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wide">Key Projects</h2>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-semibold text-slate-800">{project.name}</h3>
                    {project.description && <p className="text-slate-600 text-sm">{project.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}