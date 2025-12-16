import React, { useEffect, useMemo, useState } from 'react'
import { addVoucherAPI, deleteVoucherAPI, fetchVoucherAPI } from '../services/voucherAPI';
import { Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import ModalComponent from '../components/ModalComponent';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const Voucher = () => {

    const [data, setData] = useState([])
    const [selectedVoucher, setSelectedVoucher] = useState({
        name: '',
        discount_percentage: '',
    })
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); //'add', 'delete'
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
    }, [pagination.currentPage, pagination.limit, debouncedSearchTerm])

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('tk');

            if (!token) return

            const headers = { Authorization: `Bearer ${token}` };
            const result = await fetchVoucherAPI(queryParams, headers);

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

    const openAddModal = () => {
        setModalMode('add');
        setSelectedVoucher({
            name: '',
            discount_percentage: '',
        })
        setOpenModal(true);
    };

    const openDeleteModal = (Voucher) => {
        setModalMode('delete');
        setSelectedVoucher(Voucher);
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setSelectedVoucher({
            name: '',
            discount_percentage: '',
        })
    };

    const handleAddVoucher = async () => {

        if (!selectedVoucher.name || !selectedVoucher.discount_percentage) {
            toast.error("All fields are required");
            return;
        }

        try {
            setIsLoading(true);
            const token = sessionStorage.getItem('tk');

            const result = await addVoucherAPI(selectedVoucher, { Authorization: `Bearer ${token}` })

            if (result.success) {
                toast.success("Voucher added successfully");
                closeModal();
                fetchData();
            } else {
                toast.error(result.error || "Operation failed");
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong! Try again')
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteVoucher = async () => {
        try {
            setIsLoading(true)

            const token = sessionStorage.getItem('tk')

            const result = await deleteVoucherAPI(selectedVoucher.id, { authorization: `Bearer ${token}` });
            if (result.success) {
                toast.success("Voucher deleted successfully");
                closeModal();
                fetchData();
            } else {
                toast.error(result.error || "Failed to delete Voucher");
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong! Try again')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">Vouchers</h2>
                <div className="flex flex-wrap gap-2">
                    <div className="relative w-60">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                            className="w-full h-8 text-xs pl-10 pr-4 py-2.5 rounded-lg shadow outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <button onClick={openAddModal} className="px-3 py-1.5 h-8 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-600 flex items-center border border-blue-600 shadow-sm">
                        <Plus size={16} className="mr-2" />Add Voucher
                    </button>
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
                            <table className="w-full divide-y divide-gray-200 text-xs" aria-label="Voucher Table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Discount</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-3 py-1.5 text-center text-sm text-gray-500"
                                            >
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : data?.length > 0 ? (
                                        data.map((voucher, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-1.5">{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                                                <td className="px-3 py-1.5">{voucher.name || '-'}</td>
                                                <td className="px-3 py-1.5">{voucher.discount_percentage || '-'}%</td>
                                                <td className="px-3 py-1.5">
                                                    <button onClick={(e) => openDeleteModal(voucher)}
                                                        className="text-red-600"
                                                        aria-label={`Delete ${voucher.name}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
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

            <ModalComponent
                isOpen={openModal} onClose={closeModal} heading={
                    modalMode === 'add' ? 'Add New Voucher' : 'Remove Voucher'
                }
            >
                {modalMode === 'delete' ? (
                    <div className="space-y-6">
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong>{selectedVoucher.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={closeModal} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleDeleteVoucher} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Delete Voucher
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={selectedVoucher.name}
                                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, name: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="FLAT100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Percentage
                            </label>
                            <input
                                type="text"
                                value={selectedVoucher.discount_percentage}
                                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, discount_percentage: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder='10%'
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button onClick={closeModal} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleAddVoucher} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Add Voucher
                            </button>
                        </div>
                    </div>
                )}
            </ModalComponent>
        </>
    )
}

export default Voucher