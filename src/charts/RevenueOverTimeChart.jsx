import Chart from 'react-apexcharts';

const RevenueOverTimeChart = ({ data }) => {
    const options = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: true }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        xaxis: {
            categories: data.dates,
            title: { text: 'Date' }
        },
        yaxis: {
            title: { text: 'Revenue ($)' },
            labels: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        },
        colors: ['#3b82f6'],
        dataLabels: { enabled: false },
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
            <h3 className="text-lg font-semibold mb-4">Sales Revenue Over Time</h3>
            <Chart options={options} series={series} type="line" height={350} />
        </div>
    );
};

export default RevenueOverTimeChart