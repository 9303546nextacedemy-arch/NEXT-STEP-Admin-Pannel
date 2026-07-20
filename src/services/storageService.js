import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth, ensureFirebaseClientAuth } from '../lib/firebase';

function useFirebaseForFile(file, context) {
  if (context === 'notes') return true;
  if (file?.type === 'application/pdf') return true;
  if (file?.name && /\.pdf$/i.test(file.name)) return true;
  return false;
}

function firebaseFolder(context) {
  return context === 'notes' ? 'notes' : 'pdfs';
}

function safeStorageFileName(name) {
  const base = name || 'file';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

async function uploadToFirebaseStorage(file, context) {
  await ensureFirebaseClientAuth();
  if (!auth.currentUser) {
    throw new Error('Sign in required to upload files.');
  }
  const folder = firebaseFolder(context);
  const path = `${folder}/${Date.now()}_${safeStorageFileName(file.name)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'application/octet-stream',
  });
  return getDownloadURL(storageRef);
}

export const storageService = {
  CLOUD_NAME: 'ddybawbzi',
  UPLOAD_PRESET: 'NEXTSTEP AI Solutions',

  /**
   * Notes & PDFs → Firebase Storage (reliable PDF bytes for in-app viewer).
   * Course thumbnails / banners → Cloudinary (images, transforms).
   */
  uploadFile: async (file, context) => {
    if (useFirebaseForFile(file, context)) {
      return uploadToFirebaseStorage(file, context);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', storageService.UPLOAD_PRESET);

    let resourceType = 'raw';
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      resourceType = 'image';
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${storageService.CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  },

  deleteFile: async (fileUrl) => {
    console.log('File deletion requested for:', fileUrl);
  },
};
