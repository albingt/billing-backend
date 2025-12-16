import { Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Product from "./pages/Product"
import User from "./pages/User"
import Login from "./pages/Login"
import Sale from "./pages/Sale"
import Billing from "./pages/Billing"
import PNF from "./pages/PNF"
import Voucher from "./pages/Voucher"
import Invoice from "./pages/Invoice"

const App = () => {
    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
            <Routes>
                <Route path="/" element={<Login />} />

                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Product />} />
                    <Route path="/users" element={<User />} />
                    <Route path="/sales" element={<Sale />} />
                    <Route path="/vouchers" element={<Voucher />} />
                    <Route path="/invoices" element={<Invoice />} />
                </Route>

                <Route path="/billing" element={<Billing />} />

                <Route path="/*" element={<PNF />} />
            </Routes>
        </>
    )
}

export default App