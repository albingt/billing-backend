import React, { useEffect, useMemo, useState } from 'react'
import { allUsersAPI, addUserAPI, editUserAPI, deleteUserAPI } from '../services/userAPI';
import { Edit, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import ModalComponent from '../components/ModalComponent';
import toast from "react-hot-toast";

const User = () => {

    const [data, setData] = useState([]);
    const [selectedUser, setSelectedUser] = useState({
        name: '',
        role: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
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
    }, [pagination.currentPage, pagination.limit, debouncedSearch])

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const token = sessionStorage.getItem('tk');
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };
            const result = await allUsersAPI(queryParams, headers);

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

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const openAddModal = () => {
        setModalMode('add');
        setSelectedUser({ name: '', role: '', password: '' });
        setOpenModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setOpenModal(true);
    };

    const openDeleteModal = (user) => {
        setModalMode('delete');
        setSelectedUser(user);
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
        setSelectedUser({ name: '', role: '', password: '' });
    };

    const handleSave = async () => {
        if (!selectedUser.name || !selectedUser.role) {
            toast.error("All fields required");
            return;
        }

        try {
            setIsLoading(true);
            const token = sessionStorage.getItem('tk');
            const headers = { Authorization: `Bearer ${token}` };

            const result =
                modalMode === "add"
                    ? await addUserAPI(selectedUser, headers)
                    : await editUserAPI(selectedUser.id, selectedUser, headers);

            if (result.success) {
                toast.success(modalMode === "add" ? "User created" : "User updated");
                closeModal();
                fetchData();
            } else {
                toast.error("Error occurred");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);

            const token = sessionStorage.getItem('tk');
            const headers = { Authorization: `Bearer ${token}` };

            const result = await deleteUserAPI(selectedUser.id, headers);

            if (result.success) {
                toast.success("User deleted");
                closeModal();
                fetchData();
            } else {
                toast.error("Delete failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">Users</h2>
                <div className="flex flex-wrap gap-2">
                    <div className="relative w-50">
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-xs h-8 rounded-lg shadow outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <button onClick={openAddModal} className="px-3 py-1.5 h-8 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-600 flex items-center border border-blue-600 shadow-sm">
                        <Plus size={16} className="mr-2" /> Add User
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
                            <table className="w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Role</th>
                                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="text-center py-3">Loading...</td></tr>
                                    ) : data?.length > 0 ? (
                                        data.map((user, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-1.5">
                                                    {(pagination.currentPage - 1) * pagination.limit + index + 1}
                                                </td>
                                                <td className="px-3 py-1.5">{user.name}</td>
                                                <td className="px-3 py-1.5">{user.role}</td>
                                                <td className="px-3 py-1.5">
                                                    <button onClick={() => openEditModal(user)} className="mr-2 text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => openDeleteModal(user)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
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

            <ModalComponent
                isOpen={openModal}
                onClose={closeModal}
                heading={
                    modalMode === 'add' ? 'Add User' :
                        modalMode === 'edit' ? 'Edit User' :
                            'Delete User'
                }
            >
                {modalMode === 'delete' ? (
                    <>
                        <p>Are you sure you want to delete <b>{selectedUser.name}</b>?</p>
                        <div className="flex justify-end gap-3 pt-5">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input
                                type="text"
                                value={selectedUser.name}
                                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        {modalMode === 'add' &&
                            <div>
                                <label className="text-sm font-medium">Password</label>
                                <input
                                    type="text"
                                    value={selectedUser.password}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>}
                        <div>
                            <label className="text-sm font-medium">Role</label>
                            <select
                                value={selectedUser.role}
                                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">-- Select Role --</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-5">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                {modalMode === 'add' ? 'Add User' : 'Update'}
                            </button>
                        </div>
                    </div>
                )}
            </ModalComponent>
        </>
    )
}

export default User;
