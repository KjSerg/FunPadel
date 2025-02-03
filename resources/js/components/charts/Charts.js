import Chart from 'chart.js/auto';

export class Charts {
    constructor() {
        this.resizeListener = false;
        this.resizeListenerEnabled = false;
        this.lastWidth = window.innerWidth;
        this.charts = {};
        this.notResponsiveCharts = {};
        this.testData = {
            "26.04.1993": 200,
            "26.04.2003": 20,
            "26.04.2013": 209,
            "26.04.2023": 4,
            "20.01.2024": 104,
            "08.04.2024": 150,
            "15.08.2024": 184,
            "22.10.2024": 92,
            "05.01.2025": 222
        };

        this.initialize();
    }

    initialize() {
        this.initLoop();
        this.initResizeListener();
        this.initFormEventListener();
    }

    initResizeListener() {
        if (!this.resizeListener || this.resizeListenerEnabled) return;

        this.resizeListenerEnabled = true;
        let resizeTimer = null;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const currentWidth = window.innerWidth;
                if (this.lastWidth !== currentWidth) {
                    this.lastWidth = currentWidth;
                    Object.keys(this.notResponsiveCharts).forEach(id => {
                        this.reInitChartById(id);
                    });
                }
            }, 500);
        });
    }

    reInitChartById(id) {
        const chartElement = document.getElementById(id);
        if (chartElement) this.reInitChartByElement(chartElement);
    }

    reInitChartByElement(element) {
        const id = element.getAttribute('id');
        if (!this.notResponsiveCharts[id]) return;

        this.notResponsiveCharts[id].destroy();
        this.charts[id] = null;
        this.notResponsiveCharts[id] = null;
        element.classList.remove('chart-init');
        element.removeAttribute('width');
        element.removeAttribute('style');
        this.initChart(element);
    }

    initLoop() {
        document.querySelectorAll('.chart').forEach((chartElement, index) => {
            if (!chartElement.getAttribute('id')) {
                chartElement.setAttribute('id', `chart-js-${index}`);
            }
            chartElement.classList.add('loading');
            this.initChart(chartElement);
        });
    }

    initChart(chartElement) {
        const id = chartElement.getAttribute('id');
        const dataSource = chartElement.getAttribute('data-source');

        if (chartElement.classList.contains('is-test')) {
            this.renderChart(chartElement, this.testData);
        } else if (dataSource && !chartElement.classList.contains('chart-init')) {
            this.fetchChartData(dataSource).then(data => {
                if (data) this.renderChart(chartElement, data);
            });
        }
    }

    async fetchChartData(url) {
        try {
            const cache = await caches.open(url);
            const cachedResponse = await cache.match(url);

            if (cachedResponse) {
                return cachedResponse.json();
            } else {
                const response = await fetch(url);
                cache.put(url, response.clone());
                return response.json();
            }
        } catch (error) {
            console.error(`Failed to fetch data from ${url}:`, error);
            return null;
        }
    }

    renderChart(element, data) {
        if (!data || !element) return;

        const id = element.getAttribute('id');
        const labels = Object.keys(data);
        const values = Object.values(data);
        if(values.length < 2){
            element.closest('.chart-container').innerHTML = '<p>Not enough data to display the graph.</p>';
            return;
        }

        const chartConfig = {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Rating',
                    data: values,
                    fill: 'start',
                    borderColor: 'rgba(61, 115, 255, 0.6)',
                    tension: 0.4,
                    backgroundColor: 'rgba(61, 115, 255, 0.05)',
                    pointBackgroundColor: 'rgba(61, 115, 255, 0.8)',
                }]
            },
            options: {
                responsive: !element.classList.contains('not-responsive'),
                plugins: {
                    tooltip: {
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.03)', borderDash: [10, 5] }
                    },
                    y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.03)', borderDash: [10, 5] }
                    }
                }
            }
        };

        const chartInstance = new Chart(element, chartConfig);
        this.charts[id] = chartInstance;

        if (element.classList.contains('not-responsive')) {
            this.notResponsiveCharts[id] = chartInstance;
            this.resizeListener = true;
        }

        element.classList.add('chart-init');
        element.classList.remove('loading');
    }

    initFormEventListener() {
        document.querySelectorAll('.chart-filter').forEach(form => {
            form.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('change', () => {
                    form.dispatchEvent(new Event('submit'));
                });
            });

            form.addEventListener('submit', e => {
                e.preventDefault();
                const action = form.getAttribute('action');
                const chartSelector = form.getAttribute('data-chart');
                const chartElement = document.querySelector(chartSelector);

                if (chartElement) {
                    const formData = new URLSearchParams(new FormData(form)).toString();
                    chartElement.setAttribute('data-source', `${action}?${formData}`);
                    this.reInitChartByElement(chartElement);
                }
            });
        });
    }
}
