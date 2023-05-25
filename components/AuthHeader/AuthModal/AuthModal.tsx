import { FC, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import QRCode from 'react-qr-code';

interface Props {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    universalLink: string;
}

const AuthModal: FC<Props> = ({ open, onOk, onCancel, universalLink }) => {
    const { t } = useTranslation('settings');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                window.addEventListener('mouseup', handleMouseUp);
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            window.removeEventListener('mouseup', handleMouseUp);
            onCancel();
        };

        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [onCancel]);

    // Render nothing if the dialog is not open.
    if (!open) {
        return <></>;
    }
    console.log('universalLink', universalLink);

    // Render the dialog.
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="fixed inset-0 z-10 overflow-hidden">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div
                        className="hidden sm:inline-block sm:h-screen sm:align-middle"
                        aria-hidden="true"
                    />

                    <div
                        ref={modalRef}
                        className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                        role="dialog"
                    >
                        <div className="text-lg pb-4 font-bold text-black dark:text-neutral-200">
                            {t('Connect to Tonkeeper')}
                        </div>

                        <QRCode
                            size={256}
                            style={{ height: '260px', maxWidth: '100%', width: '100%' }}
                            value={universalLink}
                            viewBox={`0 0 256 256`}
                        />

                        <button
                            type="button"
                            className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
                            onClick={() => {
                                onOk();
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;