'use client';

import { useState } from 'react';
import { generateInvoicePDF, downloadPDF, GenerateInvoiceRequest } from '@/services/invoice';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
import { toast } from 'react-toastify';
import InvoiceForm from '@/components/invoice/InvoiceForm';

export default function InvoicePage() {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleGeneratePDF = async (data: GenerateInvoiceRequest) => {
        try {
            console.log('Generating PDF with data:', data); // Debug log
            const url = await generateInvoicePDF(data);
            console.log('Generated PDF URL:', url); // Debug log
            setPdfUrl(url);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleDownload = () => {
        if (pdfUrl) {
            const filename = `invoice-${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.pdf`;
            downloadPDF(pdfUrl, filename);
            setIsPreviewOpen(false);
        }
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Xuất Hóa Đơn</h1>
            <InvoiceForm onSubmit={handleGeneratePDF} />
            
            {pdfUrl && (
                <PDFPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                    pdfUrl={pdfUrl}
                    onDownload={handleDownload}
                />
            )}
        </div>
    );
} 