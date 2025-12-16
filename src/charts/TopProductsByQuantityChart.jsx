import Chart from 'react-apexcharts';

const TopProductsByQuantityChart = ({ data }) => {
    const options = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: true }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        xaxis: {
            categories: data.products,
            title: { text: 'Product' },
            labels: {
                rotate: -45
            }
        },
        yaxis: {
            title: { text: 'Quantity Sold' }
        },
        colors: ['#f59e0b'],
        dataLabels: {
            enabled: true
        },
        tooltip: {
            y: {
                formatter: (val) => `${val} units`
            }
        }
    };

    const series = [{
        name: 'Quantity',
        data: data.quantity
    }];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products by Quantity Sold</h3>
            <Chart options={options} series={series} type="bar" height={350} />
        </div>
    );
};

export default TopProductsByQuantityChart