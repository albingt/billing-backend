import { TrendingUp, DollarSign, Package, ShoppingCart, Users, Percent, BarChart3, RefreshCcw } from 'lucide-react';
import MetricCard from '../charts/MetricCard'
import { useState } from 'react';
import RevenueOverTimeChart from '../charts/RevenueOverTimeChart';
import ProfitOverTimeChart from '../charts/ProfitOverTimeChart';
import TopProductsByRevenueChart from '../charts/TopProductsByRevenueChart';
import TopProductsByQuantityChart from '../charts/TopProductsByQuantityChart';
import ProductProfitabilityChart from '../charts/ProductProfitabilityChart';

const Dashboard = () => {

    const [dashboardData, setDashboardData] = useState({
        metrics: {
            totalRevenue: 125430.50,
            totalProfit: 45230.75,
            totalCOGS: 80199.75,
            numberOfSales: 348,
            averageOrderValue: 360.49,
            totalItemsSold: 1247,
            uniqueCustomers: 156,
            profitMargin: 36.06,
            currentInventory: 8543
        },
        revenueOverTime: {
            dates: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12', 'Mar 1'],
            revenue: [15200, 18500, 16800, 22300, 19400, 24100, 21600, 23000]
        },
        profitOverTime: {
            dates: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12'],
            profit: [5400, 6600, 6000, 8200, 7100, 8900, 7800]
        },
        topProductsRevenue: {
            products: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
            revenue: [25400, 22100, 18900, 15600, 12800]
        },
        topProductsQuantity: {
            products: ['Product B', 'Product A', 'Product E', 'Product C', 'Product D'],
            quantity: [245, 198, 167, 143, 128]
        },
        productProfitability: {
            products: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
            revenue: [25400, 22100, 18900, 15600, 12800],
            cost: [16800, 14500, 12400, 10300, 8400],
            profit: [8600, 7600, 6500, 5300, 4400]
        },
    });

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-blue-800">Dashboard</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-500">from</span>
                    <input
                        type="date"
                        // value={dateRange.start}
                        // onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2 h-8"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="date"
                        // value={dateRange.end}
                        // onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2 h-8"
                    />
                    <button className="px-3 py-1.5 h-8 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-600 flex items-center border border-blue-600 shadow-sm"
                    >
                        <RefreshCcw size={16} className="mr-2" />Refresh
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-4 gap-6'>
                <MetricCard
                    title="Total Revenue"
                    value={`$${0}`}
                    icon={DollarSign}
                    color="blue"
                />
                <MetricCard
                    title="Total Profit"
                    value={`$${0}`}
                    icon={TrendingUp}
                    color="green"
                />
                <MetricCard
                    title="Profit Margin"
                    value={`${0}%`}
                    icon={Percent}
                    color="purple"
                />
                <MetricCard
                    title="Average Order Value"
                    value={`$${0}`}
                    icon={ShoppingCart}
                    color="orange"
                />
                <MetricCard
                    title="Number of Sales"
                    value={0}
                    icon={BarChart3}
                    color="pink"
                />
                <MetricCard
                    title="Total Items Sold"
                    value={0}
                    icon={Package}
                    color="indigo"
                />
                <MetricCard
                    title="Unique Customers"
                    value={0}
                    icon={Users}
                    color="yellow"
                />
                <MetricCard
                    title="Current Inventory"
                    value={0}
                    icon={Package}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-2 gap-6 my-6">
                <RevenueOverTimeChart data={dashboardData.revenueOverTime} />
                <ProfitOverTimeChart data={dashboardData.profitOverTime} />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <TopProductsByRevenueChart data={dashboardData.topProductsRevenue} />
                <TopProductsByQuantityChart data={dashboardData.topProductsQuantity} />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <ProductProfitabilityChart data={dashboardData.productProfitability} />
            </div>
        </>
    )
}

export default Dashboard