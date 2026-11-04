import React, { useRef, useState } from 'react';
import { Upload, X, Star, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface PhotoUploadGalleryProps {
  images: string[];
  primaryIndex: number;
  onChange: (images: string[], primaryIndex: number) => void;
  maxImages?: number;
}

export const PhotoUploadGallery: React.FC<PhotoUploadGalleryProps> = ({
  images,
  primaryIndex,
  onChange,
  maxImages = 20
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compress image to canvas data URL to optimize storage and bandwidth on mobile
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate MIME type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Seuls les fichiers image (JPG, PNG, WEBP) sont autorisés.'));
        return;
      }

      // Max 15MB file size before compression
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('Fichier trop lourd (maximum 15 Mo avant compression).'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Impossible de lire cette image.'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setCompressing(true);

    try {
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setErrorMessage(`Vous avez atteint la limite maximale de ${maxImages} photos.`);
        setCompressing(false);
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newUrls: string[] = [];

      for (const file of filesToProcess) {
        try {
          const compressed = await compressImage(file);
          newUrls.push(compressed);
        } catch (err: any) {
          console.warn('Compression error:', err);
          setErrorMessage(err?.message || 'Erreur lors du traitement d’une photo.');
        }
      }

      const combined = [...images, ...newUrls];
      onChange(combined, primaryIndex < combined.length ? primaryIndex : 0);
    } finally {
      setCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    const filtered = images.filter((_, idx) => idx !== indexToRemove);
    let nextPrimary = primaryIndex;
    if (indexToRemove === primaryIndex) {
      nextPrimary = 0;
    } else if (indexToRemove < primaryIndex) {
      nextPrimary = Math.max(0, primaryIndex - 1);
    }
    onChange(filtered, filtered.length > 0 ? nextPrimary : 0);
  };

  const setPrimary = (index: number) => {
    onChange(images, index);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800">
          Photographies réelles de l'objet ({images.length}/{maxImages})
          <span className="text-red-500 ml-1">*</span>
        </label>
        <span className="text-xs text-gray-500">
          Au moins 1 photo requise • Jusqu'à {maxImages} photos
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((url, idx) => {
          const isPrimary = idx === primaryIndex;
          return (
            <div
              key={idx}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 transition-all ${
                isPrimary
                  ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Primary badge or selector */}
              {isPrimary ? (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Principale
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  className="absolute top-2 left-2 bg-black/60 hover:bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Définir principale
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100"
                title="Supprimer la photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Upload Button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing}
            className={`aspect-square rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center p-3 text-center transition-all ${
              compressing ? 'opacity-50 cursor-wait' : 'cursor-pointer'
            }`}
          >
            {compressing ? (
              <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-xs font-semibold">Ajouter des photos</span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  Galerie ou caméra
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-[11px] text-gray-500 italic">
        💡 Conseil : Prenez des photos réelles sous bonne lumière montrant l'objet sous plusieurs angles pour rassurer les bénéficiaires.
      </p>
    </div>
  );
};
