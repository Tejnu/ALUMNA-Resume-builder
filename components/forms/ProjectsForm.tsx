
'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/resume';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: '',
      startDate: '',
      endDate: '',
      url: ''
    };
    onChange([...projects, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    onChange(
      projects.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const removeProject = (id: string) => {
    onChange(projects.filter(project => project.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button onClick={addProject} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Project
        </Button>
      </div>

      {projects.map((project, index) => (
        <Card key={project.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">Project #{index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProject(project.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title</label>
                <Input
                  value={project.title}
                  onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                  placeholder="e.g., E-commerce Platform"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project URL</label>
                <Input
                  value={project.url || ''}
                  onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                  placeholder="https://github.com/yourproject"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="month"
                  value={project.startDate}
                  onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="month"
                  value={project.endDate}
                  onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Technologies Used</label>
              <Input
                value={project.technologies || ''}
                onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                placeholder="React, Node.js, MongoDB, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={project.description}
                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                placeholder="Describe the project, your role, and key achievements..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No projects added yet.</p>
          <Button onClick={addProject} className="mt-2">
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Project
          </Button>
        </div>
      )}
    </div>
  );
}
