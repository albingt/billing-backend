import Chart from 'react-apexcharts';

const ProfitOverTimeChart = ({ data }) => {
    const options = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: { show: true }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
            }
        },
        xaxis: {
            categories: data.dates,
            title: { text: 'Date' }
        },
        yaxis: {
            title: { text: 'Profit ($)' },
            labels: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        },
        colors: ['#10b981'],
        dataLabels: { enabled: false },
        tooltip: {
            y: {
                formatter: (val) => `$${val.toLocaleString()}`
            }
        }
    };

    const series = [{
        name: 'Profit',
        data: data.profit
    }];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Profit Over Time</h3>
            <Chart options={options} series={series} type="area" height={350} />
        </div>
    );
};

export default ProfitOverTimeChart