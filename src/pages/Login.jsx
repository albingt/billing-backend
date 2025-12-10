import React, { useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/authContext'

const Login = () => {

    const { login } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async () => {

        if(!formData.name || !formData.password){
            toast.error('Please enter name and password!')
            return
        }

        try {
            await login(formData)
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong! Try again')
        }
    }

    return (
        <div className='min-h-screen w-full flex justify-center items-center bg-linear-to-r from-indigo-600 to-purple-500'>
            <div className='bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl space-y-6'>
                <div className='text-center space-y-2'>
                    <h1 className='text-3xl font-bold text-gray-800'>Welcome Back</h1>
                    <p className='text-gray-500 text-sm'>Please login to your account</p>
                </div>
    
                {/* Name Input */}
                <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>Name</label>
                    <div className='relative'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <input
                            type="text"
                            placeholder='Enter your name'
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                        />
                    </div>
                </div>
    
                {/* Password Input */}
                <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>Password</label>
                    <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter your password'
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className='w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                        >
                            {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                        </button>
                    </div>
                </div>
    
                {/* Remember & Forgot */}
                <div className='flex items-center justify-end text-sm'>
                    <label className='flex items-center space-x-2 cursor-pointer'>
                        <input type="checkbox" className='w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500' />
                        <span className='text-gray-600'>Remember me</span>
                    </label>
                </div>
    
                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className='w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200'
                >
                    Login
                </button>

            </div>
        </div>
    )
}

export default Login