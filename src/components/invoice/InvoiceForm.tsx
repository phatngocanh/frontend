"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowDown, FaArrowUp, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { format } from "date-fns";

import { GenerateInvoiceRequest } from "@/services/invoice";

interface InvoiceFormProps {
    onSubmit: (data: GenerateInvoiceRequest) => Promise<void>;
}

interface GoodsItem {
    id: number;
    name: string;
    packages: number;
    itemsPerPackage: number;
    totalUnits: number;
}

export default function InvoiceForm({ onSubmit }: InvoiceFormProps) {
    const idCounter = useRef(1);
    const [invoiceDate, setInvoiceDate] = useState<string>(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    });
    const [customerName, setCustomerName] = useState<string>("");
    const [customerPhone, setCustomerPhone] = useState<string>("");
    const [customerAddress, setCustomerAddress] = useState<string>("");
    const [invoiceCode, setInvoiceCode] = useState<string>("");
    const [movingItemId, setMovingItemId] = useState<number | null>(null);
    const [goods, setGoods] = useState<GoodsItem[]>([
        { id: 1, name: "", packages: 0, itemsPerPackage: 0, totalUnits: 0 },
    ]);
    const [isTestMode, setIsTestMode] = useState(false);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem("invoiceFormData");
        if (savedData) {
            const { invoiceDate, customerName, customerPhone, customerAddress, goods, lastId, invoiceCode } =
                JSON.parse(savedData);
            setInvoiceDate(invoiceDate);
            setCustomerName(customerName);
            setCustomerPhone(customerPhone);
            setCustomerAddress(customerAddress);
            setGoods(goods);
            idCounter.current = lastId;
            setInvoiceCode(invoiceCode);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(
            "invoiceFormData",
            JSON.stringify({
                invoiceDate,
                customerName,
                customerPhone,
                customerAddress,
                goods,
                lastId: idCounter.current,
                invoiceCode,
            }),
        );
    }, [invoiceDate, customerName, customerPhone, customerAddress, goods, invoiceCode]);

    const clearAllData = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu?")) {
            setInvoiceDate(format(new Date(), "dd-MM-yyyy"));
            setCustomerName("");
            setCustomerPhone("");
            setCustomerAddress("");
            idCounter.current = 1;
            setGoods([{ id: 1, name: "", packages: 0, itemsPerPackage: 0, totalUnits: 0 }]);
            localStorage.removeItem("invoiceFormData");
        }
    };

    const addGoodsItem = () => {
        idCounter.current += 1;
        setGoods([
            ...goods,
            {
                id: idCounter.current,
                name: "",
                packages: 0,
                itemsPerPackage: 0,
                totalUnits: 0,
            },
        ]);
    };

    const removeGoodsItem = (id: number) => {
        if (goods.length > 1) {
            setGoods(goods.filter((item) => item.id !== id));
        }
    };

    const moveItem = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
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
        setGoods(
            goods.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };

                    // If updating total units directly, clear packages and items per package
                    if (field === "totalUnits") {
                        updatedItem.packages = 0;
                        updatedItem.itemsPerPackage = 0;
                    }
                    // If updating either packages or items per package
                    else if (field === "packages" || field === "itemsPerPackage") {
                        // If either value is cleared (0 or empty), clear total units
                        if (!value || value === 0) {
                            updatedItem.totalUnits = 0;
                        }
                        // Only calculate if both values are set and greater than 0
                        else if (
                            (field === "packages" ? Number(value) : updatedItem.packages) > 0 &&
                            (field === "itemsPerPackage" ? Number(value) : updatedItem.itemsPerPackage) > 0
                        ) {
                            updatedItem.totalUnits = updatedItem.packages * updatedItem.itemsPerPackage;
                        }
                    }
                    return updatedItem;
                }
                return item;
            }),
        );
    };

    const calculateTotalPackages = () => {
        return goods.reduce((total, item) => total + item.packages, 0);
    };

    const calculateTotals = () => {
        let totalPackages = 0;
        let totalUnits = 0;
        goods.forEach((item) => {
            totalPackages += item.packages;
            totalUnits += item.totalUnits;
        });
        return { totalPackages, totalUnits };
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            setInvoiceDate(`${day}-${month}-${year}`);
        }
    };

    const getDateInputValue = () => {
        const [day, month, year] = invoiceDate.split("-");
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { totalPackages, totalUnits } = calculateTotals();

        let items = goods;
        if (isTestMode && goods.length > 0) {
            // Create 50 copies of the first item
            const firstItem = goods[0];
            items = Array(50)
                .fill(null)
                .map((_, index) => ({
                    ...firstItem,
                    id: index + 1,
                    name: `${firstItem.name} (${index + 1})`,
                }));
        }

        const formData: GenerateInvoiceRequest = {
            customerName,
            customerPhone,
            customerAddress,
            invoiceDate,
            invoiceCode,
            items: items.map((item) => ({
                name: item.name,
                packages: item.totalUnits > 0 && item.packages === 0 ? null : item.packages,
                itemsPerPackage: item.totalUnits > 0 && item.packages === 0 ? null : item.itemsPerPackage,
                totalUnits: item.totalUnits,
            })),
            totalPackages,
            totalUnits,
        };
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Phiếu giao hàng</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="testMode"
                            checked={isTestMode}
                            onChange={(e) => setIsTestMode(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="testMode" className="text-sm text-gray-700">
                            Test Mode (50 records)
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                    >
                        <span>Xuất PDF</span>
                    </button>
                    <button
                        type="button"
                        onClick={clearAllData}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                    >
                        <FaTrash className="w-4 h-4" />
                        <span>Xóa tất cả</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <label htmlFor="invoiceDate" className="block text-sm font-semibold text-gray-700 mb-2">
                        Ngày
                    </label>
                    <input
                        id="invoiceDate"
                        type="date"
                        value={getDateInputValue()}
                        onChange={handleDateChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên khách hàng
                    </label>
                    <input
                        id="customerName"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                        placeholder="Nhập tên khách hàng"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="customerPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Số điện thoại
                    </label>
                    <input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                        placeholder="Nhập số điện thoại"
                    />
                </div>
                <div>
                    <label
                        htmlFor="customerAddress"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        Địa chỉ
                    </label>
                    <input
                        id="customerAddress"
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                        placeholder="Nhập địa chỉ"
                    />
                </div>
                <div>
                    <label htmlFor="invoiceCode" className="block text-sm font-semibold text-gray-700 mb-2">
                        Mã đơn hàng
                    </label>
                    <input
                        id="invoiceCode"
                        type="number"
                        value={invoiceCode}
                        onChange={(e) => setInvoiceCode(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                        placeholder="Nhập mã đơn hàng"
                    />
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Danh sách hàng hóa</h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200 -mx-8 md:mx-0">
                    <div className="min-w-[900px]">
                        {" "}
                        {/* Minimum width container */}
                        <table className="w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="w-[80px] px-4 py-3 text-left text-sm font-semibold text-gray-700"></th>
                                    <th className="w-[60px] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        STT
                                    </th>
                                    <th className="w-[300px] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Tên
                                    </th>
                                    <th className="w-[120px] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Số thùng
                                    </th>
                                    <th className="w-[120px] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        ĐV/thùng
                                    </th>
                                    <th className="w-[120px] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Tổng đơn vị
                                    </th>
                                    <th className="w-[100px] px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        Xóa
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {goods.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`
                      hover:bg-gray-50 
                      transition-all duration-300 ease-in-out
                      ${movingItemId === item.id ? "bg-blue-50 scale-[1.02]" : ""}
                    `}
                                    >
                                        <td className="w-[80px] px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(index, "up")}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <FaArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(index, "down")}
                                                    disabled={index === goods.length - 1}
                                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <FaArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="w-[60px] px-4 py-4 text-sm text-gray-700 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="w-[300px] px-4 py-4">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) =>
                                                    updateGoodsItem(item.id, "name", e.target.value)
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                                                placeholder="Nhập tên hàng"
                                                required
                                            />
                                        </td>
                                        <td className="w-[120px] px-4 py-4">
                                            <input
                                                type="number"
                                                value={item.packages || ""}
                                                onChange={(e) =>
                                                    updateGoodsItem(
                                                        item.id,
                                                        "packages",
                                                        parseInt(e.target.value) || 0,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "-" || e.key === "e") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                                                min="0"
                                                disabled={item.totalUnits > 0 && item.packages === 0}
                                                placeholder="Nhập số thùng"
                                            />
                                        </td>
                                        <td className="w-[120px] px-4 py-4">
                                            <input
                                                type="number"
                                                value={item.itemsPerPackage || ""}
                                                onChange={(e) =>
                                                    updateGoodsItem(
                                                        item.id,
                                                        "itemsPerPackage",
                                                        parseInt(e.target.value) || 0,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "-" || e.key === "e") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                                                min="0"
                                                disabled={item.totalUnits > 0 && item.packages === 0}
                                                placeholder="Nhập đơn vị/thùng"
                                            />
                                        </td>
                                        <td className="w-[120px] px-4 py-4">
                                            <input
                                                type="number"
                                                value={item.totalUnits || ""}
                                                onChange={(e) =>
                                                    updateGoodsItem(
                                                        item.id,
                                                        "totalUnits",
                                                        parseInt(e.target.value) || 0,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "-" || e.key === "e") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black placeholder-gray-500"
                                                min="0"
                                                placeholder="Nhập tổng đơn vị"
                                            />
                                        </td>
                                        <td className="w-[100px] px-4 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
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
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
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
                <div className="space-y-2">
                    <p className="text-gray-700">
                        Tổng số thùng:{" "}
                        <span className="font-bold text-gray-900">{calculateTotalPackages()}</span>
                    </p>
                    <p className="text-gray-700">
                        Tổng đơn vị:{" "}
                        <span className="font-bold text-gray-900">{calculateTotals().totalUnits}</span>
                    </p>
                </div>
            </div>
        </form>
    );
}
