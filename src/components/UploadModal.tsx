import React, { useState, useRef } from 'react';
import './UploadModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 5GB limit');
        return;
      }

      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }

      setFile(selectedFile);
    }
  };

  const uploadChunk = async (chunk: Blob, chunkIndex: number, totalChunks: number) => {
    // TODO: Implement actual chunk upload logic to your backend
    // This is a placeholder that simulates upload progress
    return new Promise((resolve) => {
      setTimeout(() => {
        const progress = ((chunkIndex + 1) / totalChunks) * 100;
        setUploadProgress(progress);
        resolve(true);
      }, 500);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        await uploadChunk(chunk, i, totalChunks);
      }

      // TODO: Implement final upload completion logic
      onClose();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Video</h2>
        
        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            style={{ display: 'none' }}
          />
          {file ? (
            <div className="file-info">
              <p>{file.name}</p>
              <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <p>Click to select a video file (max 5GB)</p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {isUploading && (
          <div className="progress-container">
            <div 
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="progress-text">{Math.round(uploadProgress)}%</span>
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal; 