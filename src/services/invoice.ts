import { toast } from "react-toastify";

export interface InvoiceItem {
    name: string;
    packages: number | null;
    itemsPerPackage: number | null;
    totalUnits: number;
}

export interface GenerateInvoiceRequest {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    invoiceDate: string;
    invoiceCode: string;
    items: InvoiceItem[];
    totalPackages: number;
    totalUnits: number;
}

export const generateInvoicePDF = async (data: GenerateInvoiceRequest): Promise<string> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoice/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate PDF");
        }

        const blob = await response.blob();
        return window.URL.createObjectURL(blob);
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate PDF");
        throw error;
    }
};

export const downloadPDF = (pdfUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(pdfUrl);
    toast.success("PDF downloaded successfully");
};
