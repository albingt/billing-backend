import { useAuth } from '../context/authContext'
import Sidebar from './Sidebar'
import { Navigate, Outlet } from 'react-router-dom'

const Layout = () => {

    const { authenticated, loading, user } = useAuth();

    if (loading) {
        return <div className='flex min-h-screen items-center justify-center'>loading...</div>
    }

    if (!authenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return (
        <div className='flex min-h-screen'>
            <Sidebar />
            <div className='flex-1 p-5 overflow-y-auto h-screen bg-linear-to-br from-slate-50 to-slate-100'>
                <Outlet />
            </div>
        </div>
    )
}

export default Layout