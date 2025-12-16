import React, { useEffect, useMemo, useState } from 'react'
import useDebounce from '../hooks/useDebounce';
import { fetchInvoiceAPI, fetchInvoiceDetailsAPI } from '../services/invoiceAPI';
import { Eye, RefreshCcw, Search, Trash2 } from 'lucide-react';
import ModalComponent from '../components/ModalComponent';
import toast from 'react-hot-toast';

const Invoice = () => {

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1,
        currentPage: 1,
        limit: 10,
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append('page', pagination.currentPage.toString());
        params.append('limit', pagination.limit.toString());
        if (debouncedSearchTerm.trim()) params.append('searchquery', debouncedSearchTerm.trim());

        return params.toString();
    }, [pagination.currentPage, pagination.limit, debouncedSearchTerm]);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('tk');

            if (!token) return

            const headers = { Authorization: `Bearer ${token}` };
            const result = await fetchInvoiceAPI(queryParams, headers);

            if (result.success) {
                setData(result.data);

                setPagination({
                    ...pagination,
                    total: result.total,
                    currentPage: result.page,
                    pages: result.pages,
                });
            } else {
                setData([]);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData()
    }, [queryParams]);

    const showModal = async (id) => {
        setIsFetchingDetails(true);
        setIsModalOpen(true);
        setSelectedInvoice(null);

        try {
            const token = sessionStorage.getItem('tk');
            if (!token) {
                toast.error('Authentication token missing');
                return;
            }

            const result = await fetchInvoiceDetailsAPI(id, { Authorization: `Bearer ${token}` });

            if (result.success) {
                setSelectedInvoice(result.data);
            } else {
                toast.error('Failed to load invoice details');
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error('Something went wrong! Try again');
            setIsModalOpen(false);
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">Invoices</h2>
                <div className="flex flex-wrap gap-2">
                    <div className="relative w-60">
                        <input
                            type="text"
                            placeholder="Search by invoice or name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-8 text-xs pl-10 pr-4 py-2.5 rounded-lg shadow outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <button onClick={fetchData} className="px-3 py-1.5 h-8 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-600 flex items-center border border-blue-600 shadow-sm"
                    >
                        <RefreshCcw size={16} className="mr-2" />Refresh
                    </button>
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex flex-col" style={{ height: 'calc(98vh - 90px)' }}>
                        <div className="overflow-auto grow">
                            <table className="w-full divide-y divide-gray-200 text-xs" aria-label="Invoice Table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Invoice Number</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Customer Name</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Amount Paid</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-3 py-1.5 text-center text-sm text-gray-500"
                                            >
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : data?.length > 0 ? (
                                        data.map((data, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-1.5">{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                                                <td className="px-3 py-1.5">{data.invoice_number || '-'}</td>
                                                <td className="px-3 py-1.5">{data.customer_name || '-'}</td>
                                                <td className="px-3 py-1.5">{data.total_amount || '-'}</td>
                                                <td className="px-3 py-1.5">
                                                    <button onClick={(e) => showModal(data?.id)}
                                                        className="text-blue-600"
                                                        aria-label={`Show ${data.invoice_number}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-3 py-1.5 text-center text-sm text-gray-500"
                                            >
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                                <span>Showing</span>
                                <select
                                    className="mx-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                                    value={pagination.limit}
                                    onChange={(e) => {
                                        setPagination((prev) => ({ ...prev, limit: parseInt(e.target.value), currentPage: 1 }));
                                    }}
                                    aria-label="Select Records Per Page"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span>records per page</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    onClick={(e) => {
                                        setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
                                    }}
                                    disabled={pagination.currentPage === 1}
                                    aria-label="Previous Page"
                                >
                                    Previous
                                </button>
                                <span className="px-2 py-1 border border-blue-500 bg-blue-500 text-white rounded text-xs">
                                    {pagination.currentPage} of {pagination.total / pagination.limit === 0 ? 1 : Math.ceil(pagination.total / pagination.limit)}
                                </span>
                                <button
                                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    onClick={(e) => {
                                        setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
                                    }}
                                    disabled={pagination.currentPage * pagination.limit >= pagination.total}
                                    aria-label="Next Page"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalComponent isOpen={isModalOpen} onClose={closeModal} heading="Invoice Details">
                {isFetchingDetails ? (
                    <div className="py-8 text-center text-gray-500">Loading invoice details...</div>
                ) : selectedInvoice ? (
                    <div className="space-y-6">
                        {/* Invoice Header */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-600">Invoice Number:</span>
                                <p className="text-lg font-bold text-blue-700">{selectedInvoice.invoice_number}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Customer:</span>
                                <p className="text-lg">{selectedInvoice.customer_name}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Product</th>
                                            <th className="px-4 py-2 text-center">Qty</th>
                                            <th className="px-4 py-2 text-right">Price</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="px-4 py-3">{item.product_name}</td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">${parseFloat(item.selling_price).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    ${(parseFloat(item.selling_price) * item.quantity).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">
                                                Total Amount:
                                            </td>
                                            <td className="px-4 py-3 text-right text-lg font-bold text-blue-700">
                                                ${parseFloat(selectedInvoice.total_amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">No details available</div>
                )}
            </ModalComponent>
        </>
    )
}

export default Invoice