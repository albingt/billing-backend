import React, { useState } from 'react'
import { LayoutDashboard, LogOut, User2 } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('dashboard');

    const adminnavitems = [
        {
            id: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            path: '/dashboard'
        },
        {
            id: 'products',
            icon: <LayoutDashboard size={20} />,
            label: 'Products',
            path: '/products'
        },
        {
            id: 'users',
            icon: <LayoutDashboard size={20} />,
            label: 'Users',
            path: '/users'
        },
        {
            id: 'sales',
            icon: <LayoutDashboard size={20} />,
            label: 'Sales',
            path: '/sales'
        },
    ]

    const usernavitems = [
        {
            id: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            path: '/dashboard'
        },
        {
            id: 'billing',
            icon: <LayoutDashboard size={20} />,
            label: 'Billing',
            path: '/billing'
        }
    ]

    const handleNavigation = (item) => {
        setActiveItem(item.id);
        if (item.path) {
            navigate(item.path);
        }
    };

    const RenderSiderBarOptions = (items) => {
        return items.map((item, index) => {
            const isActive = activeItem === item.id;

            return (
                <div
                    key={index}
                    onClick={() => handleNavigation(item)}
                    className={`
                        mb-2 p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${isActive
                            ? 'bg-blue-700 shadow-lg'
                            : 'hover:bg-blue-800/50'
                        }
                    `}
                >
                    <div className="flex items-center">
                        <span className={`${isActive ? 'text-white' : 'text-blue-300'}`}>
                            {item.icon}
                        </span>
                        <span className={`ml-3 font-medium ${isActive ? 'text-white' : 'text-blue-200'}`}>
                            {item.label}
                        </span>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className='w-64 bg-linear-to-b from-blue-900 to-blue-800 text-white flex flex-col'>
            <nav className='flex flex-col justify-between h-full'>
                <div className='p-5 flex'>
                    <p className='text-blue-300 uppercase tracking-wider font-medium'>dashboard</p>
                </div>
                <div className='px-4 overflow-y-auto'
                    style={{
                        maxHeight: 'calc(100vh - 155px - 64px)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#155dfc #1a3bab'
                    }}>
                    <style>{`
                        .px-4::-webkit-scrollbar {
                            width: 8px;
                        }
                        .px-4::-webkit-scrollbar-track {
                            background: #1a3bab;
                            border-radius: 4px;
                        }
                        .px-4::-webkit-scrollbar-thumb {
                            background: #155dfc;
                            border-radius: 4px;
                        }
                        .px-4::-webkit-scrollbar-thumb:hover {
                            background: #3B82F6;
                        }
                    `}</style>
                    {RenderSiderBarOptions(user?.role === 'admin' ? adminnavitems : usernavitems)}
                </div>
                <div className='p-4 mt-auto border-t border-blue-700/50'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                            <div className='w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-medium'>
                                <User2 size={18} />
                            </div>
                            <div className='ml-3'>
                                <p className='text-sm font-medium text-white'>{user?.name || 'user'}</p>
                            </div>
                        </div>
                        <button onClick={logout}><LogOut className='cursor-pointer' /></button>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Sidebar