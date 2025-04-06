export interface InvoiceItem {
    id: number;
    name: string;
    packages: number;
    itemsPerPackage: number;
    unitPrice?: number;
    totalAmount?: number;
}
