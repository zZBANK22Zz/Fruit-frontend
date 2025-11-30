import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

/**
 * Modal Component using Headless UI
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when modal should close
 * @param {string} title - Modal title
 * @param {string} message - Modal message/content
 * @param {string} type - Modal type: 'error' | 'success' | 'info' | 'warning'
 * @param {string} buttonText - Text for the primary button (default: 'OK')
 * @param {function} onConfirm - Function to call when primary button is clicked
 * @param {boolean} showCloseButton - Show close button in header (default: true)
 * @param {ReactNode} children - Custom content (overrides message if provided)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
  onConfirm,
  showCloseButton = true,
  children
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  // Icon and color configuration based on type
  const typeConfig = {
    error: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      titleColor: 'text-red-900',
      buttonVariant: 'danger'
    },
    success: {
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      titleColor: 'text-green-900',
      buttonVariant: 'success'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      titleColor: 'text-yellow-900',
      buttonVariant: 'secondary'
    },
    info: {
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      titleColor: 'text-blue-900',
      buttonVariant: 'primary'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${config.bgColor} rounded-full p-2`}>
                      <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className={`text-lg font-semibold ${config.titleColor}`}
                      >
                        {title}
                      </Dialog.Title>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mt-2">
                  {children ? (
                    <div className="text-sm text-gray-600">{children}</div>
                  ) : (
                    <p className="text-sm text-gray-600">{message}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                  <Button
                    variant={config.buttonVariant}
                    size="md"
                    onClick={handleConfirm}
                  >
                    {buttonText}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;

