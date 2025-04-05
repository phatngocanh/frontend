'use client';

import InvoiceForm from '@/components/invoice/InvoiceForm';

export default function InvoicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Xuất Hóa Đơn</h1>
      <InvoiceForm />
    </div>
  );
} 