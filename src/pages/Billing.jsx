import { useState } from 'react';
import { DollarSign, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { searchProductstAPI } from '../services/productAPI';
import { useMemo } from 'react';
import { useEffect } from 'react';

const Billing = () => {

    const token = sessionStorage.getItem('tk');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [billItems, setBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

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
        const basePrice = item.selling_price * item.quantity;
        const discount = (basePrice * item.discount_percentage) / 100;
        return basePrice - discount;
    };

    const calculateSubtotal = () => {
        return billItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    };

    const calculateTotalDiscount = () => {
        return billItems.reduce((sum, item) => {
            const basePrice = item.selling_price * item.quantity;
            return sum + (basePrice * item.discount_percentage) / 100;
        }, 0);
    };

    const calculateGrandTotal = () => {
        return calculateSubtotal() - calculateTotalDiscount();
    };

    const handleCompleteSale = () => { }

    const handleNewBill = () => {
        setBillItems([]);
        setCustomerName('');
        setInvoiceNumber('INV-' + Date.now().toString().slice(-6));
    };

    return (
        <div className='w-full grid grid-cols-6 gap-x-5'>
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
                                                <p className="font-bold text-slate-800">₹{Number(product.selling_price).toFixed(2)}</p>
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

                        {calculateTotalDiscount() > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>- ₹{calculateTotalDiscount().toFixed(2)}</span>
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
        </div>
    )
}

export default Billing