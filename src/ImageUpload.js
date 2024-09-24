import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, CircularProgress, Link } from '@mui/joy';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Firebase (replace with your own config)
const firebaseConfig = {
    apiKey: "AIzaSyAw4Kd5Z3R-VfMBFGfY4eb_m3yT4iYK8Nk",
    authDomain: "respectgame.firebaseapp.com",
    projectId: "respectgame",
    storageBucket: "respectgame.appspot.com",
    messagingSenderId: "864447955758",
    appId: "1:864447955758:web:cd3675d75ddc7cae4db0bf"
  };

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  
  const ImageUpload = ({ onImageUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
    const uploadImage = async (file) => {
      setIsUploading(true);
      setUploadError('');
  
      const storageRef = ref(storage, `community_images/${Date.now()}_${file.name}`);
  
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setUploadedImageUrl(downloadURL);
        onImageUploaded(downloadURL);
        setIsUploading(false);
      } catch (error) {
        console.error("Error uploading image: ", error);
        setUploadError(`Error uploading image: ${error.message}`);
        setIsUploading(false);
      }
    };
  
    const onDrop = useCallback((acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadImage(acceptedFiles[0]);
      }
    }, []);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: 'image/*',
      multiple: false
    });
  
    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #cccccc',
            borderRadius: '4px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size="sm" />
              <Typography sx={{ ml: 1 }}>Uploading...</Typography>
            </Box>
          ) : isDragActive ? (
            <Typography>Drop the image here ...</Typography>
          ) : (
            <Typography>Drag 'n' drop an image here, or click to select one</Typography>
          )}
        </Box>
        {uploadError && (
          <Typography color="danger" sx={{ mt: 1 }}>{uploadError}</Typography>
        )}
        {uploadedImageUrl && (
          <Box sx={{ mt: 1 }}>
            <Typography color="success">
              Image uploaded successfully!{' '}
              <Link
                href={uploadedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View image
              </Link>
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  export default ImageUpload;