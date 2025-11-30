/**
 * Image compression and resizing utilities
 */

/**
 * Compress and resize image to reduce file size
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 800)
 * @param {number} maxHeight - Maximum height (default: 800)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<string>} - Base64 encoded image string
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 JPEG
        const base64String = canvas.toDataURL('image/jpeg', quality);
        
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64String.split(',')[1];
        
        resolve(base64Data);
      };
      
      img.onerror = (error) => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Get image file size in MB
 * @param {File} file - Image file
 * @returns {number} - File size in MB
 */
export const getFileSizeMB = (file) => {
  return file.size / (1024 * 1024);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น'
    };
  }
  
  // Check file size
  const fileSizeMB = getFileSizeMB(file);
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB}MB (ไฟล์ปัจจุบัน: ${fileSizeMB.toFixed(2)}MB)`
    };
  }
  
  return {
    valid: true,
    error: null
  };
};

/**
 * Get proper image path for static assets
 * Handles encoding for special characters and ensures correct path format
 * @param {string} imagePath - Image path (e.g., "/images/filename.jpg")
 * @returns {string} - Properly formatted image path
 */
export const getImagePath = (imagePath) => {
  if (!imagePath) return '/images/example.jpg';
  
  // If it's already a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Ensure it starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // For static files in Next.js public folder, encode only the filename part
  // This handles special characters like Thai characters in filenames
  const pathParts = normalizedPath.split('/');
  if (pathParts.length > 0) {
    const filename = pathParts[pathParts.length - 1];
    const directory = pathParts.slice(0, -1).join('/');
    // Encode the filename to handle special characters
    const encodedFilename = encodeURIComponent(filename);
    return `${directory}/${encodedFilename}`;
  }
  
  return normalizedPath;
};

