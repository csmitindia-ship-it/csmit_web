interface ThemedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  hideDefaultFooter?: boolean; // New prop to hide default footer buttons
  children?: React.ReactNode;
}

const ThemedModal: React.FC<ThemedModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  showConfirmButton = false,
  hideDefaultFooter = false, // Default to false
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        {message && <p className="text-gray-300 mb-6">{message}</p>}
        {children}
        {!hideDefaultFooter && ( // Conditionally render default footer
          <div className="flex justify-end space-x-4 mt-6">
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
        )}
      </div>
    </div>
  );
};

export default ThemedModal;
