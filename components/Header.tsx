'use client';

import { FileText, Download, Share, Upload, Sparkles, Menu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';

interface HeaderProps {
  onFileUpload?: (file: File) => void;
  onAIEnhance?: () => void;
  isAIProcessing?: boolean;
}

export function Header({ onFileUpload, onAIEnhance, isAIProcessing }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      event.target.value = '';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Resume - Built with Alumna',
          text: 'Check out my professional resume built with Alumna AI Resume Builder',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <img
                src="/LOGOwithouttagline-01_1755244238390.png"
                alt="Alumna logo"
                className="w-12 h-12 object-contain filter brightness-0 invert"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-white font-bold text-2xl">A</span>';
                  }
                }}
                onLoad={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'block';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Alumna
              </h1>
              <p className="text-sm text-gray-600 hidden sm:block">AI-Powered Resume Builder</p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              <span>Import Resume</span>
            </Button>

            <Button
              onClick={onAIEnhance}
              disabled={isAIProcessing}
              className="flex items-center space-x-2 bg-black text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800"
            >
              {isAIProcessing ? (
                <div className="loading-spinner h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isAIProcessing ? 'Enhancing...' : 'AI Enhance'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>

            
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Resume
              </Button>

              <Button
                onClick={onAIEnhance}
                disabled={isAIProcessing}
                className="bg-black text-white hover:bg-gray-800 w-full justify-start rounded-xl"
              >
                {isAIProcessing ? (
                  <div className="loading-spinner h-4 w-4 mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {isAIProcessing ? 'Enhancing...' : 'AI Enhance'}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>

              
            </div>
          </div>
        )}
      </div>
    </header>
  );
}