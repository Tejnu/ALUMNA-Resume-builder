'use client';

import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

interface CreativeTemplateProps {
  resumeData: ResumeData;
}

export function CreativeTemplate({ resumeData }: CreativeTemplateProps) {
  const { personalInfo, workExperience, education, skills, certifications, projects } = resumeData;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      {/* Creative Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-3 tracking-wide">{personalInfo?.fullName || ''}</h1>
          <p className="text-2xl font-light opacity-90 mb-6">{workExperience?.[0]?.position || ''}</p>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {personalInfo?.email && (
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-2 rounded-full">
                <Mail className="h-4 w-4 mr-2" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-2 rounded-full">
                <Phone className="h-4 w-4 mr-2" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.location && (
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-2 rounded-full">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-center bg-white bg-opacity-20 px-3 py-2 rounded-full">
                <Linkedin className="h-4 w-4 mr-2" />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Creative Summary */}
        {personalInfo?.summary && (
          <section className="mb-8">
            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 relative inline-block">
                About Me
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </h2>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
              <p className="text-gray-700 leading-relaxed text-lg italic">{personalInfo.summary}</p>
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            {workExperience && workExperience.length > 0 && (
              <section>
                <div className="relative mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                    Experience
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </h2>
                </div>
                <div className="space-y-6">
                  {workExperience.map((job, index) => (
                    <div key={job.id} className="relative">
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 opacity-10 rounded-full -mr-10 -mt-10"></div>

                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{job.position}</h3>
                              <p className="text-lg font-semibold text-purple-600">{job.company}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                              <p className="text-sm font-semibold text-gray-700">
                                {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                              </p>
                            </div>
                          </div>
                          {job.description && (
                            <p className="text-gray-700 leading-relaxed">{job.description}</p>
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
              <section>
                <div className="relative mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 relative inline-block">
                    Projects
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-700 text-sm">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <section>
                <div className="relative mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
                    Skills
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </h2>
                </div>
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <div key={skill.id} className="relative">
                      <div className={`bg-gradient-to-r ${
                        index % 3 === 0 ? 'from-purple-500 to-purple-600' :
                        index % 3 === 1 ? 'from-pink-500 to-pink-600' :
                        'from-orange-500 to-orange-600'
                      } text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-200`}>
                        {skill.name}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <section>
                <div className="relative mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
                    Education
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </h2>
                </div>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-md">
                      <h3 className="font-bold text-gray-800 mb-1">{edu.degree}</h3>
                      <p className="text-purple-600 font-semibold">{edu.school}</p>
                      {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                      {edu.graduationDate && <p className="text-gray-500 text-sm">{edu.graduationDate}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <section>
                <div className="relative mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
                    Certifications
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </h2>
                </div>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-800 text-sm">{cert.name}</h3>
                      {cert.description && <p className="text-gray-600 text-xs mt-1">{cert.description}</p>}
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