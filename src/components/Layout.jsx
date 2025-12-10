import React from 'react'
import { useAuth } from '../context/authContext'
import Sidebar from './Sidebar'

const Layout = ({ children  }) => {

    const { authenticated, loading } = useAuth();

    return (
        authenticated ? (
            <div className='flex min-h-screen'>
                <Sidebar />
                <div className='flex-1 p-5 overflow-y-auto h-screen bg-linear-to-br from-slate-50 to-slate-100'>
                    { children }
                </div>
            </div>
        ) : loading ? (
            <div className='flex min-h-screen items-center justify-center'>
                loading...
            </div>
        ) : (
            children
        )
    )
}

export default Layout