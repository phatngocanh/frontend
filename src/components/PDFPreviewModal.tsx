import React from "react";

import { Dialog } from "@headlessui/react";

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    onDownload: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ isOpen, onClose, pdfUrl, onDownload }) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                <Dialog.Panel className="relative mx-auto max-w-4xl rounded-lg bg-white p-4 shadow-xl">
                    <div className="mb-4 flex justify-between">
                        <Dialog.Title className="text-lg font-medium">Preview Invoice</Dialog.Title>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Close</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-4 h-[600px] w-[800px]">
                        <iframe
                            src={pdfUrl}
                            className="h-full w-full rounded border border-gray-200"
                            title="PDF Preview"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onDownload}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Download
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
