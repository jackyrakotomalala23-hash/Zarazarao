import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({ isOpen, onClose, onSelectEmoji }) => {
  if (!isOpen) return null;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelectEmoji(emojiData.emoji);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl border border-gray-100 relative flex flex-col items-center"
        >
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-gray-100 px-2">
            <h3 className="font-black text-sm text-gray-900">Banque d'émojis</h3>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex justify-center">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              width={340}
              height={380}
              searchPlaceholder="Rechercher un émoji..."
              skinTonesDisabled
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
