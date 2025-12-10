import React, { useEffect, useMemo, useState } from 'react'
import { productProfitReportAPI } from '../services/productAPI'
import { Search, RefreshCcw } from 'lucide-react';

const Sale = () => {

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1,
        currentPage: 1,
        limit: 10,
    });

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append('page', pagination.currentPage.toString());
        params.append('limit', pagination.limit.toString());
        if (debouncedSearch.trim()) params.append('searchquery', debouncedSearch.trim());
        
        return params.toString();
    }, [pagination.currentPage, pagination.limit, debouncedSearch]);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('tk');
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };
            const result = await productProfitReportAPI(queryParams, headers);

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
        fetchData();
    }, [queryParams]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">Sales Report</h2>

                <div className="flex gap-2">
                    <div className="relative w-50">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 h-8 text-xs rounded-lg shadow outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>

                    <button
                        onClick={fetchData}
                        className="px-3 py-1.5 h-8 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-600 flex items-center border border-blue-600 shadow-sm"
                    >
                        <RefreshCcw size={16} className="mr-2" /> Refresh
                    </button>
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex flex-col" style={{ height: 'calc(98vh - 90px)' }}>
                        <div className='overflow-auto grow'>
                            <table className="w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">SKU</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Selling Price</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Cost Price</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Total Sold</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Revenue</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Cost</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr><td colSpan={9} className="text-center py-3">Loading...</td></tr>
                                    ) : data?.length > 0 ? (
                                        data.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-1.5">
                                                    {(pagination.currentPage - 1) * pagination.limit + index + 1}
                                                </td>
                                                <td className="px-3 py-1.5">{row.name}</td>
                                                <td className="px-3 py-1.5">{row.sku_code}</td>
                                                <td className="px-3 py-1.5">{row.selling_price}</td>
                                                <td className="px-3 py-1.5">{row.cost_price}</td>
                                                <td className="px-3 py-1.5">{row.total_sold ?? 0}</td>
                                                <td className="px-3 py-1.5">{row.total_revenue ?? 0}</td>
                                                <td className="px-3 py-1.5">{row.total_cost ?? 0}</td>
                                                <td className="px-3 py-1.5">{row.profit ?? 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-3 text-gray-500">
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
        </>
    )
}

export default Sale;
