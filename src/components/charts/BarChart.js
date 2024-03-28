import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import Chart from 'chart.js/auto';
import { useMedia } from 'react-use';

const BarChartCard = ({title,label,profit}) => {
  const chartRef = useRef(null);
const alllable=label;
const allprofit=profit;
  useEffect(() => {
    let myChart;

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      // Destroy the previous chart instance if it exists
      if (myChart) {
        myChart.destroy();
      }

      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: alllable,
          datasets: [
            { 
              label: 'Values',
              backgroundColor: createGradient(ctx, ['#000000', '#3533CD']),
              borderColor: '#000B4F',
              borderWidth: 1,
              hoverBackgroundColor: createGradient(ctx, ['#20368F', '#40a9ff']),
              hoverBorderColor: '#40a9ff',
              data: allprofit,
            },
          ],
        },
        options: {
          scales: {
            x: { grid: { display: false } },
            y: { grid: { display: false, beginAtZero: true } },
          },
        },
      });
    }

    return () => {
      // Cleanup: Destroy the chart when the component is unmounted
      if (myChart) {
        myChart.destroy();
      }
    };
  }, []);

  // Function to create a gradient
  const createGradient = (ctx, colors) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  };

  return (
    <Card
      title={title}
      style={{
        width:' 100%',/* Set width to 100% */
        // maxWidth: 500, /* Set a maximum width */
        // height: 350, /* Set a fixed height */
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <canvas ref={chartRef}></canvas>
    </Card>
  );
};

export default BarChartCard;
