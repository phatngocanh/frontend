'use client';

import { useState, useRef, useEffect } from 'react';
import { FaMinus, FaPlus, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';

interface GoodsItem {
  id: number;
  name: string;
  packages: number;
  itemsPerPackage: number;
}

export default function InvoiceForm() {
  const idCounter = useRef(1);
  const [invoiceDate, setInvoiceDate] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [movingItemId, setMovingItemId] = useState<number | null>(null);
  const [goods, setGoods] = useState<GoodsItem[]>([
    { id: idCounter.current, name: '', packages: 0, itemsPerPackage: 0 }
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('invoiceFormData');
    if (savedData) {
      const { invoiceDate, customerName, customerPhone, goods, lastId } = JSON.parse(savedData);
      setInvoiceDate(invoiceDate);
      setCustomerName(customerName);
      setCustomerPhone(customerPhone);
      setGoods(goods);
      idCounter.current = lastId;
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoiceFormData', JSON.stringify({
      invoiceDate,
      customerName,
      customerPhone,
      goods,
      lastId: idCounter.current
    }));
  }, [invoiceDate, customerName, customerPhone, goods]);

  const clearAllData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu?')) {
      setInvoiceDate('');
      setCustomerName('');
      setCustomerPhone('');
      idCounter.current = 1;
      setGoods([{ id: 1, name: '', packages: 0, itemsPerPackage: 0 }]);
      localStorage.removeItem('invoiceFormData');
    }
  };

  const addGoodsItem = () => {
    idCounter.current += 1;
    setGoods([...goods, { 
      id: idCounter.current, 
      name: '', 
      packages: 0, 
      itemsPerPackage: 0 
    }]);
  };

  const removeGoodsItem = (id: number) => {
    if (goods.length > 1) {
      setGoods(goods.filter(item => item.id !== id));
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < goods.length) {
      const item = goods[index];
      setMovingItemId(item.id);
      
      // Add a small delay to show the highlight effect
      setTimeout(() => {
        const newGoods = [...goods];
        [newGoods[index], newGoods[newIndex]] = [newGoods[newIndex], newGoods[index]];
        setGoods(newGoods);
        
        // Clear the highlight after the movement
        setTimeout(() => {
          setMovingItemId(null);
        }, 300);
      }, 50);
    }
  };

  const updateGoodsItem = (id: number, field: keyof GoodsItem, value: string | number) => {
    if ((field === 'packages' || field === 'itemsPerPackage') && typeof value === 'number') {
      // Ensure the number is non-negative
      value = Math.max(0, value);
    }
    setGoods(goods.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotalPackages = () => {
    return goods.reduce((total, item) => total + item.packages, 0);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Phiếu giao hàng</h1>
        <button
          onClick={clearAllData}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <FaTrash className="w-4 h-4" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ngày
          </label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên khách hàng
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
            placeholder="Nhập tên khách hàng"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
            placeholder="Nhập số điện thoại"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Danh sách hàng hóa</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-20 px-6 py-3">Thứ tự</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">STT</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số thùng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Đơn vị</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tổng đơn vị</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Xóa</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goods.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`
                    hover:bg-gray-50 
                    transition-all duration-300 ease-in-out
                    ${movingItemId === item.id ? 'bg-blue-50 scale-[1.02]' : ''}
                  `}
                >
                  <td className="w-20 px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === goods.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">{index + 1}</td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateGoodsItem(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                      placeholder="Nhập tên hàng"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={item.packages || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                        updateGoodsItem(item.id, 'packages', val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={item.itemsPerPackage || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                        updateGoodsItem(item.id, 'itemsPerPackage', val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {(item.packages * item.itemsPerPackage) || ''}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => removeGoodsItem(item.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={goods.length === 1}
                      >
                        <FaMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={addGoodsItem}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Thêm hàng hóa</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Tổng kết</h3>
        <p className="text-gray-700">
          Tổng số thùng: <span className="font-bold text-gray-900">{calculateTotalPackages()}</span>
        </p>
      </div>
    </div>
  );
} 