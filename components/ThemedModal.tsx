import React from 'react';

interface ThemedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

const ThemedModal: React.FC<ThemedModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  showConfirmButton = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-purple-500 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {showConfirmButton && (
            <button
              onClick={() => {
                onConfirm && onConfirm();
                onClose();
              }}
              className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Confirm
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showConfirmButton ? 'Cancel' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemedModal;
