import { useState } from 'react';
import { DollarSign, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { searchProductstAPI } from '../services/productAPI';
import { fetchVoucherAPI } from '../services/voucherAPI';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { createSaleAPI } from '../services/billAPI';
import toast from 'react-hot-toast';

const Billing = () => {

    const token = sessionStorage.getItem('tk');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [billItems, setBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherError, setVoucherError] = useState('');

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.append('searchquery', debouncedSearch.trim());

        return params.toString();
    }, [debouncedSearch])

    const searchProducts = async () => {
        if (!token) return;

        try {
            const result = await searchProductstAPI(queryParams, { Authorization: `Bearer ${token}` });

            if (result.success) {
                setSearchResults(result.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearch.trim()) {
            searchProducts();
            setShowResults(true);
        } else {
            setShowResults(false);
            setSearchResults([]);
        }
    }, [debouncedSearch]);


    const addToBill = (product) => {
        const existingItem = billItems.find(item => item.product_id === product.id);

        if (existingItem) {
            setBillItems(billItems.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setBillItems([...billItems, {
                product_id: product.id,
                name: product.name,
                sku_code: product.sku_code,
                selling_price: product.selling_price,
                discount_percentage: product.discount_percentage,
                quantity: 1,
                available_quantity: product.quantity
            }]);
        }

        setSearchTerm('');
        setShowResults(false);
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty <= 0) {
            removeFromBill(productId);
            return;
        }

        setBillItems(billItems.map(item =>
            item.product_id === productId
                ? { ...item, quantity: Math.min(newQty, item.available_quantity) }
                : item
        ));
    };

    const removeFromBill = (productId) => {
        setBillItems(billItems.filter(item => item.product_id !== productId));
    };

    const calculateItemTotal = (item) => {
        return item.selling_price * item.quantity;
    };

    const calculateSubtotal = () => {
        return billItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const calculateVoucherDiscount = () => {
        if (voucherDiscount === 0) return 0;

        const subtotal = calculateSubtotal();
        return (subtotal * voucherDiscount) / 100;
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const voucherDiscountAmount = calculateVoucherDiscount();
        return subtotal - voucherDiscountAmount;
    };

    const applyVoucher = async () => {
        setVoucherError('');

        try {
            const result = await fetchVoucherAPI(`searchquery=${voucherCode}`, {
                Authorization: `Bearer ${token}`,
            });

            if (result.success && result.data && result.data.length > 0) {
                const voucher = result.data[0];
                setVoucherDiscount(Number(voucher.discount_percentage));
                toast.success(`Voucher "${voucher.name}" applied! ${voucher.discount_percentage}% OFF`);
            } else {
                setVoucherDiscount(0);
                setVoucherError("Invalid voucher code");
            }
        } catch (error) {
            console.log(error);
            setVoucherDiscount(0);
            setVoucherError("Invalid voucher code");
        }
    };

    const handleCompleteSale = async () => {
        if (billItems.length === 0) return;

        try {
            const data = {
                customer_name: customerName,
                items: billItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    selling_price: item.selling_price,
                    discount_percentage: item.discount_percentage
                }))
            };

            const result = await createSaleAPI(data, { Authorization: `Bearer ${token}` });

            if (result.success) {
                setInvoiceNumber(result.data)
                setTimeout(() => {
                    printInvoice();
                    toast.success("Sale completed and printed!");
                    handleNewBill();
                }, 300);
            } else {
                toast.error('Failed to complete sale!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong! Try again');
        }
    }

    const printInvoice = () => {
        const printArea = document.getElementById("printArea");
        printArea.style.display = "block";

        window.print();

        printArea.style.display = "none";
    };

    const handleNewBill = () => {
        setBillItems([]);
        setCustomerName('');
        setVoucherCode('');
        setVoucherDiscount(0);
        setVoucherError('');
    };

    return (
        <div className='w-full grid grid-cols-6 gap-x-5 p-5'>
            <div style={{ height: 'calc(99vh - 40px)' }} className='col-span-4 space-y-5'>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Customer Information</h2>
                    <input
                        type="text"
                        placeholder="Customer Name (Optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm  outline-none"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Add Products</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by product name or SKU code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => searchTerm && setShowResults(true)}
                            className="w-full pl-10 pr-4 text-sm py-3 border border-slate-300 rounded-lg outline-none"
                        />

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addToBill(product)}
                                        className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-slate-800">{product.name}</p>
                                                <p className="text-sm text-slate-500">SKU: {product.sku_code}</p>
                                                <p className="text-xs text-slate-400">Stock: {product.quantity} units</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800"><span className='font-light pr-2'>₹{Number(product.cost_price).toFixed(2)}</span>₹{Number(product.selling_price).toFixed(2)}</p>
                                                {product.discount_percentage > 0 && (
                                                    <p className="text-xs text-green-600">{product.discount_percentage}% OFF</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Bill Items</h2>

                    {billItems.length === 0 ? (
                        <div className="text-center py-24 text-slate-400">
                            <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No items added yet</p>
                            <p className="text-sm">Search and add products to create a bill</p>
                        </div>
                    ) : (
                        <div className="space-y-3 h-75 overflow-y-auto">
                            {billItems.map(item => (
                                <div key={item.product_id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">SKU: {item.sku_code}</p>
                                        <p className="text-xs text-slate-600">₹{item.selling_price} x {item.quantity}</p>
                                        {item.discount_percentage > 0 && (
                                            <p className="text-xs text-green-600">Discount: {item.discount_percentage}%</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-slate-100"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 0)}
                                            min="1"
                                            max={item.available_quantity}
                                            className="w-16 text-center py-1 border border-slate-300 rounded"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-slate-100"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="text-right min-w-24">
                                        <p className="font-bold text-slate-800">₹{calculateItemTotal(item).toFixed(2)}</p>
                                    </div>

                                    <button
                                        onClick={() => removeFromBill(item.product_id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className='col-span-2'>
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <DollarSign size={20} />
                        Bill Summary
                    </h2>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal:</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Voucher Code
                            </label>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    placeholder="Enter voucher"
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                                />
                                <button
                                    onClick={applyVoucher}
                                    disabled={voucherCode.length === 0}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    Apply
                                </button>
                            </div>

                            {voucherError && (
                                <p className="text-xs text-red-500">{voucherError}</p>
                            )}
                        </div>

                        {voucherDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Voucher Discount ({voucherDiscount}%):</span>
                                <span>- ₹{calculateVoucherDiscount().toFixed(2)}</span>
                            </div>
                        )}

                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex justify-between text-xl font-bold text-slate-800">
                                <span>Total:</span>
                                <span>₹{calculateGrandTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-sm text-slate-500 pt-2">
                            <p>Items: {billItems.length}</p>
                            <p>Total Quantity: {billItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleCompleteSale}
                            disabled={billItems.length === 0}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Complete Sale
                        </button>

                        <button
                            onClick={handleNewBill}
                            className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            New Bill
                        </button>
                    </div>
                </div>
            </div>

            <div id="printArea" style={{ display: "none" }}>
                <div style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "40px",
                    fontFamily: "Arial, sans-serif",
                    color: "#333"
                }}>
                    {/* Header */}
                    <div style={{ borderBottom: "3px solid #2563eb", paddingBottom: "20px", marginBottom: "30px" }}>
                        <h1 style={{ margin: "0", fontSize: "32px", color: "#1e293b" }}>INVOICE</h1>
                        <p style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                            Invoice #: {invoiceNumber}
                        </p>
                        <p style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                            Date: {new Date().toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* Business & Customer Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#64748b", textTransform: "uppercase" }}>From:</h3>
                            <p style={{ margin: "5px 0", fontSize: "16px", fontWeight: "bold" }}>Your Business Name</p>
                            <p style={{ margin: "5px 0", fontSize: "14px", color: "#64748b" }}>123 Business Street</p>
                            <p style={{ margin: "5px 0", fontSize: "14px", color: "#64748b" }}>City, State - 123456</p>
                            <p style={{ margin: "5px 0", fontSize: "14px", color: "#64748b" }}>Phone: +91 1234567890</p>
                        </div>
                        <div>
                            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#64748b", textTransform: "uppercase" }}>Bill To:</h3>
                            <p style={{ margin: "5px 0", fontSize: "16px", fontWeight: "bold" }}>
                                {customerName || "Walk-in Customer"}
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Item</th>
                                <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>SKU</th>
                                <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Qty</th>
                                <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Price</th>
                                <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Discount</th>
                                <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billItems.map((item, index) => (
                                <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                    <td style={{ padding: "12px", fontSize: "14px" }}>{item.name}</td>
                                    <td style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>{item.sku_code}</td>
                                    <td style={{ padding: "12px", textAlign: "center", fontSize: "14px" }}>{item.quantity}</td>
                                    <td style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>₹{Number(item.selling_price).toFixed(2)}</td>
                                    <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#16a34a" }}>
                                        {item.discount_percentage > 0 ? `${item.discount_percentage}%` : '-'}
                                    </td>
                                    <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                                        ₹{calculateItemTotal(item).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
                        <div style={{ width: "300px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                                <span style={{ color: "#64748b" }}>Subtotal:</span>
                                <span>₹{calculateSubtotal().toFixed(2)}</span>
                            </div>

                            {voucherDiscount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#16a34a" }}>
                                    <span>Voucher Discount ({voucherDiscount}%):</span>
                                    <span>- ₹{calculateVoucherDiscount().toFixed(2)}</span>
                                </div>
                            )}

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "12px 0",
                                fontSize: "18px",
                                fontWeight: "bold",
                                borderTop: "2px solid #cbd5e1",
                                marginTop: "8px"
                            }}>
                                <span>Grand Total:</span>
                                <span>₹{calculateGrandTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        borderTop: "2px solid #e2e8f0",
                        paddingTop: "20px",
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: "12px"
                    }}>
                        <p style={{ margin: "5px 0" }}>Thank you for your business!</p>
                        <p style={{ margin: "5px 0" }}>For any queries, please contact us at support@yourbusiness.com</p>
                        <p style={{ margin: "15px 0 0 0", fontStyle: "italic" }}>
                            This is a computer-generated invoice and does not require a signature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Billing