import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'uploading' | 'completed' | 'error';
}

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onFileDelete: (fileId: string) => void;
  userRole: 'admin' | 'client' | 'ngo';
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  uploadedFiles,
  onFileDelete,
  userRole,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setUploading(true);
    // Simulate upload process
    setTimeout(() => {
      onFileUpload(files);
      setUploading(false);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          File Upload
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: dragActive ? 'primary.50' : 'grey.50',
            transition: 'all 0.3s ease',
            mb: 2,
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag and drop files here
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or click to select files
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 1 }}
            disabled={uploading}
          >
            Choose Files
            <input
              type="file"
              multiple
              hidden
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
            />
          </Button>
        </Box>

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading files...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {uploadedFiles.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Uploaded Files
            </Typography>
            <List>
              {uploadedFiles.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => onFileDelete(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {file.status === 'completed' ? (
                      <CheckCircleIcon color="success" />
                    ) : file.status === 'error' ? (
                      <DescriptionIcon color="error" />
                    ) : (
                      <DescriptionIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)} • ${file.uploadDate}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          Supported formats: PDF, DOC, DOCX, JPG, PNG, XLSX, XLS
        </Alert>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 