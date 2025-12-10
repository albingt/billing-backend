import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { loginAPI, userProfileAPI } from "../services/userAPI"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const token = sessionStorage.getItem('tk')

        if (token) {
            setAuthenticated(true)
            userProfile(token)
            navigate('/dashboard')
        } else {
            if (window.location.pathname !== '/') {
                navigate('/')
            }
        }
    }, [])

    const login = async (formData) => {
        try {
            setLoading(true)

            const result = await loginAPI(formData);

            if (result.success) {
                toast.success('Login success')
                const { token, ...data } = result.data
                setUser(data)
                setAuthenticated(true)
                sessionStorage.setItem('tk', token)
                navigate('/dashboard')
            } else {
                toast.error(result.error.error || 'Login failed')
            }
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong! Try again later')
        } finally {
            setLoading(false)
        }
    }

    const userProfile = async (token) => {
        try {
            const result = await userProfileAPI({ Authorization: `Bearer ${token}` });

            if (result.success) {
                setUser(result.data)
                setAuthenticated(true)
            } else {
                toast.error('Session expired, please login again!')
                navigate('/')
            }
        } catch (error) {
            console.log(error);
        }
    }

    const logout = async () => {
        sessionStorage.removeItem('tk')
        setUser(null)
        setAuthenticated(false)
        navigate('/')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                authenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}