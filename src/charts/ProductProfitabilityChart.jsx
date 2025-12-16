import Chart from 'react-apexcharts';

const ProductProfitabilityChart = ({ data }) => {
    const options = {
        chart: {
            type: 'bar',
            height: 400,
            stacked: false,
            toolbar: { show: true }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 4,
                columnWidth: '70%'
            }
        },
        xaxis: {
            categories: data.products,
            labels: {
                rotate: -45
            }
        },
        yaxis: {
            title: { text: 'Amount ($)' },
            labels: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        },
        colors: ['#3b82f6', '#ef4444', '#10b981'],
        dataLabels: { enabled: false },
        legend: {
            position: 'top'
        },
        tooltip: {
            y: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        }
    };

    const series = [
        {
            name: 'Revenue',
            data: data.revenue
        },
        {
            name: 'Cost',
            data: data.cost
        },
        {
            name: 'Profit',
            data: data.profit
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Product Profitability Analysis</h3>
            <Chart options={options} series={series} type="bar" height={400} />
        </div>
    );
};

export default ProductProfitabilityChart