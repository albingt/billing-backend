import Chart from 'react-apexcharts';

const TopProductsByRevenueChart = ({ data }) => {
    const options = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: true }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4
            }
        },
        xaxis: {
            categories: data.products,
            title: { text: 'Revenue ($)' },
            labels: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        },
        yaxis: {
            title: { text: 'Product' }
        },
        colors: ['#8b5cf6'],
        dataLabels: {
            enabled: true,
            formatter: (val) => `$${val.toLocaleString()}`
        },
        tooltip: {
            y: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        }
    };

    const series = [{
        name: 'Revenue',
        data: data.revenue
    }];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
            <Chart options={options} series={series} type="bar" height={350} />
        </div>
    );
};

export default TopProductsByRevenueChart