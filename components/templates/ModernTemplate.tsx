'use client';

import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ModernTemplateProps {
  resumeData: ResumeData;
}

export function ModernTemplate({ resumeData }: ModernTemplateProps) {
  const { personalInfo, workExperience, education, skills, certifications, projects } = resumeData;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">{personalInfo?.fullName || ''}</h1>
            <p className="text-xl opacity-90">{workExperience?.[0]?.position || ''}</p>
          </div>
          <div className="mt-4 md:mt-0 space-y-2 text-sm">
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
            {personalInfo?.website && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>{personalInfo.website}</span>
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
        {/* Summary */}
        {personalInfo?.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
          </section>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Work Experience */}
            {workExperience && workExperience.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">Work Experience</h2>
                <div className="space-y-6">
                  {workExperience.map((job) => (
                    <div key={job.id} className="relative pl-6 border-l-2 border-blue-200">
                      <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-0"></div>
                      <div className="mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">{job.position}</h3>
                        <p className="text-lg text-blue-600 font-medium">{job.company}</p>
                        <p className="text-sm text-gray-600">
                          {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                        </p>
                      </div>
                      {job.description && (
                        <p className="text-gray-700 leading-relaxed">{job.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">Projects</h2>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-700">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Skills</h2>
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-block mr-2 mb-2">
                      {skill.name}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Education</h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-blue-600">{edu.school}</p>
                      {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                      {edu.graduationDate && <p className="text-sm text-gray-600">{edu.graduationDate}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">Certifications</h2>
                <div className="space-y-2">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="text-sm">
                      <p className="font-semibold text-gray-800">{cert.name}</p>
                      {cert.description && <p className="text-gray-600">{cert.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}