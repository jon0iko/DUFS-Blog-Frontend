'use client';

import { useEffect, useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Upload, FileText, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { validateDocumentFile, uploadDocumentToStrapi } from '@/lib/strapi-media';
import { createUserUploadFile } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function BlogUpPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      startTransition(() => {
        router.push('/auth/signin?redirect=/blogup');
      });
    }
  }, [authLoading, isAuthenticated, router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file', 'Upload Error');
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;

    try {
      setIsUploading(true);
      
      // Get auth token
      const token = getToken();
      if (!token) {
        toast.error('You must be logged in to upload files', 'Authentication Required');
        return;
      }

      // Upload file to Strapi media library
      toast.info('Uploading file...', 'Please wait');
      const uploadedFile = await uploadDocumentToStrapi(selectedFile, token);

      // Create user upload entry
      const result = await createUserUploadFile(user.id, uploadedFile.id, selectedFile.name);

      if (!result.success) {
        toast.error(result.error || 'Failed to save upload record', 'Upload Failed');
        return;
      }

      // Success
      setUploadSuccess(true);
      toast.success('Your document has been uploaded successfully!', 'Upload Complete');
      
      // Reset after a delay
      setTimeout(() => {
        handleRemoveFile();
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'Upload Failed'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (authLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <>
      <LoadingScreen isLoading={authLoading || isPending} />
      {isAuthenticated && (
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden font-montserrat">
          {/* Background Images */}
          <div className="absolute inset-0 dark:hidden select-none pointer-events-none" style={{ backgroundImage: 'url(/images/bgpaper.webp)', backgroundRepeat: 'repeat' }} />
          <div className="bg-pattern-dark absolute inset-0 hidden dark:block select-none pointer-events-none" style={{ backgroundImage: 'url(/images/bgpaper_dark.jpg)', backgroundRepeat: 'repeat', backgroundSize: '1667px 1200px' }} />

          <div className="container relative z-20 max-w-4xl mx-auto px-7 pt-8 md:pt-10 pb-20">
            

            {/* Back Button */}
            <button
              onClick={() => startTransition(() => router.push('/submit'))}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-xs">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-foreground text-background mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]">
                <Upload className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-altehaasgrotesk font-light tracking-tight text-foreground mb-4">
                Upload Writing
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                Import your existing writing from various formats
              </p>
              <div className="mt-4 h-[1px] w-full bg-[url('/images/dashes.svg')] bg-repeat-x bg-left-top dark:[filter:brightness(0)_invert(1)] opacity-30" style={{ backgroundSize: 'auto 1px' }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-4">
                Accepted formats: PDF, DOCX, TXT (Max 10MB)
              </p>
            </div>

            {/* Upload Card */}
            <div className="bg-[#FAFAF8] dark:bg-[#181817] border-2 border-foreground/10 rounded-sm p-8 shadow-sm relative">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                /* Drop zone */
                <div className="text-center">
                  <button
                    onClick={handleBrowseClick}
                    disabled={isUploading}
                    className="group w-full border-2 border-dashed border-foreground/20 rounded-sm p-12 hover:border-foreground/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#F9F7F1]/30 dark:bg-[#1C1B1A]/30"
                  >
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-lg font-bold uppercase tracking-widest text-foreground mb-2">
                      Click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Select one document to upload
                    </p>
                  </button>
                  
                  <div className="mt-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                      Supported formats
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {['PDF', 'DOCX', 'TXT'].map((format) => (
                        <span
                          key={format}
                          className="px-4 py-1.5 bg-foreground/5 text-foreground rounded-sm text-[10px] font-bold tracking-widest border border-foreground/5"
                        >
                          .{format.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected file display */
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-5 bg-[#F9F7F1] dark:bg-[#1C1B1A] border border-foreground/10 rounded-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate uppercase tracking-tight">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    {!uploadSuccess && (
                      <button
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                        className="flex-shrink-0 p-2 hover:bg-foreground/5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                    {uploadSuccess && (
                      <div className="flex-shrink-0 p-2">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                      </div>
                    )}
                  </div>

                  {uploadSuccess ? (
                    <div className="text-center py-6 bg-green-500/5 border border-green-500/20 rounded-sm">
                      <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-bold uppercase tracking-widest text-foreground mb-1">
                        Upload Successful!
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Your document has been uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                        className="flex-1 px-6 py-3 border-2 border-foreground/20 text-foreground rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-foreground/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex-1 px-6 py-3 bg-foreground text-background rounded-sm font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? 'Uploading...' : 'Upload File'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alternative Action */}
            <div className="mt-12 text-center">
              <button
                onClick={() => startTransition(() => router.push('/editor'))}
                className="group relative px-8 py-4 bg-[#F9F7F1] dark:bg-[#1C1B1A] border-2 border-foreground/90 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                <span className="font-bold text-sm uppercase tracking-[0.2em] text-foreground">Start Writing Instead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
