'use client';

import { ResumeData } from '@/types/resume';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate'; // Added
import { TechnicalTemplate } from './templates/TechnicalTemplate'; // Added
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useRef } from 'react'; // Added useRef

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Added state for download status
  const resumeRef = useRef<HTMLDivElement>(null); // Added ref for the resume content

  // Safety check for resumeData
  if (!resumeData || !resumeData.personalInfo) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm sticky top-24 h-fit">
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="mb-2">📄</div>
            <p>Upload a resume to see the live preview</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderTemplate = () => {
    const { selectedTemplate } = resumeData;

    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate resumeData={resumeData} />;
      case 'classic':
        return <ClassicTemplate resumeData={resumeData} />;
      case 'minimal':
        return <MinimalTemplate resumeData={resumeData} />;
      case 'creative':
        return <CreativeTemplate resumeData={resumeData} />;
      case 'executive':
        return <ExecutiveTemplate resumeData={resumeData} />;
      case 'technical':
        return <TechnicalTemplate resumeData={resumeData} />;
      default:
        return <ModernTemplate resumeData={resumeData} />;
    }
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById('resume-preview-content');
      if (!element) {
        console.error('Resume preview element not found');
        return;
      }

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Create a temporary container with proper styling
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Apply styles to the cloned element
      clonedElement.style.width = '100%';
      clonedElement.style.maxWidth = 'none';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '20px';
      clonedElement.style.backgroundColor = 'white';
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.borderRadius = '0';
      clonedElement.style.transform = 'none';

      container.appendChild(clonedElement);
      document.body.appendChild(container);

      const options = {
        margin: [10, 10, 10, 10],
        filename: `${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      await html2pdf().set(options).from(container).save();

      // Clean up
      document.body.removeChild(container);

    } catch (error) {
      console.error('Error downloading PDF:', error);

      // Fallback to print method
      const element = document.getElementById('resume-preview-content');
      if (element) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${resumeData.personalInfo?.fullName || 'Resume'} - Resume</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: system-ui, sans-serif; line-height: 1.5; color: #333; background: white; }
                  @page { size: A4; margin: 0.75in; }
                  @media print { body { margin: 0; } }
                </style>
              </head>
              <body>
                ${element.innerHTML}
                <script>
                  setTimeout(() => { window.print(); setTimeout(() => window.close(), 100); }, 500);
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm sticky top-24 h-fit">
      <div className="p-6">
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="text-xs px-2 py-1 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="text-xs px-2 py-1 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg border-gray-300"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 text-sm px-4 py-2 disabled:opacity-50 transition-all duration-200"
            >
              {isDownloading ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isDownloading ? 'Preparing...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Preview Container */}
        <div className={`bg-gray-50 border-2 border-gray-200 rounded-2xl overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 p-6' : ''}`}>
          {isFullscreen && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg border-gray-300"
              >
                Exit Fullscreen
              </Button>
            </div>
          )}

          <div
            className="bg-white shadow-2xl mx-auto overflow-auto"
            ref={resumeRef}
            style={{
              width: isFullscreen ? '210mm' : '100%',
              maxWidth: isFullscreen ? '210mm' : '820px',
              height: isFullscreen ? '297mm' : '840px',
              transform: isFullscreen ? 'none' : `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'all 0.3s ease'
            }}
          >
            <div
              id="resume-preview-content"
              className="h-full overflow-auto"
              style={{
                fontSize: isFullscreen ? '12px' : '12px',
                lineHeight: '1.4'
              }}
            >
              {renderTemplate()}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {resumeData.selectedTemplate} Template
              </p>
              <p className="text-xs text-gray-600">
                Optimized for ATS systems
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-xs text-black font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}