'use client';

import { useEffect, useState, useRef } from 'react';
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
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/blogup');
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
      {isAuthenticated && (
        <div className="min-h-screen bg-gray-50 dark:bg-background">
          <div className="container max-w-4xl mx-auto pt-6 pb-8 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={() => router.push('/submit')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-brand-black-90 mb-6">
                <Upload className="w-10 h-10 text-black dark:text-white" />
              </div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
                Upload Writing
              </h1>
              <p className="text-gray-700 dark:text-gray-400 text-lg mb-2">
                Import your existing writing from various formats
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                Accepted formats: <span className="font-medium">PDF, DOCX, TXT, MD</span> (Max 10MB)
              </p>
            </div>

            {/* Upload Card */}
            <div className="bg-white dark:bg-brand-black-90 border-2 border-gray-300 dark:border-gray-700 rounded-2xl p-8">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                /* Drop zone */
                <div className="text-center">
                  <button
                    onClick={handleBrowseClick}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 hover:border-black dark:hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-black dark:text-white mb-2">
                      Click to browse files
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select one document to upload
                    </p>
                  </button>
                  
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Supported formats:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {['PDF', 'DOCX', 'TXT', 'MD'].map((format) => (
                        <span
                          key={format}
                          className="px-3 py-1 bg-gray-100 dark:bg-brand-black-100 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
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
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-brand-black-90 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-brand-black-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    {!uploadSuccess && (
                      <button
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                        className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-brand-black-80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                    {uploadSuccess && (
                      <div className="flex-shrink-0 p-2">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>

                  {uploadSuccess ? (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <p className="text-lg font-medium text-black dark:text-white mb-1">
                        Upload Successful!
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your document has been uploaded successfully
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-brand-black-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? 'Uploading...' : 'Upload File'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alternative Action */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/editor')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Writing Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
