export const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const formatBytes = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

/**
 * Validates a file against the given constraints.
 * On dimension mismatch, rejects with { type: 'dimensions', currentW, currentH }.
 * On format/size/read error, rejects with { type: string, message: string }.
 */
export const validateImageFile = (file, constraints) => {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject({ type: 'format', message: 'Solo se permiten imágenes JPG, JPEG o PNG' });
      return;
    }
    if (constraints.maxSize && file.size > constraints.maxSize) {
      reject({ type: 'size', message: `El archivo excede el límite de ${formatBytes(constraints.maxSize)}` });
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { exactWidth, exactHeight, maxWidth, maxHeight } = constraints;
      if (exactWidth !== undefined) {
        if (img.width !== exactWidth || img.height !== exactHeight) {
          reject({ type: 'dimensions', currentW: img.width, currentH: img.height });
          return;
        }
      } else if (maxWidth !== undefined) {
        if (img.width > maxWidth || img.height > maxHeight) {
          reject({ type: 'dimensions', currentW: img.width, currentH: img.height });
          return;
        }
      }
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject({ type: 'read', message: 'No se pudo leer la imagen' });
    };
    img.src = url;
  });
};
