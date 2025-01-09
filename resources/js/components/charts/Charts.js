import Chart from 'chart.js/auto';
import {log10} from "chart.js/helpers";

export class Charts {
    constructor() {
        this.resizeListener = false;
        this.resizeListenerEnabled = false;
        this.lastWidth = window.innerWidth;
        this.initLoop();
        this.resizeEventListener();
        this.formEventListener();
    }

    charts = {};

    notResponsiveCharts = {};

    testData = {
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

    resizeEventListener() {
        const t = this;
        const resizeListener = t.resizeListener;
        const resizeListenerEnabled = t.resizeListenerEnabled;
        const lastWidth = t.lastWidth;
        if (!resizeListener) return;
        if (resizeListenerEnabled) return;
        t.resizeListenerEnabled = true;
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                let currentWidth = window.innerWidth;
                if (lastWidth !== currentWidth) {
                    t.lastWidth = currentWidth;
                    for (let id in t.notResponsiveCharts) {
                        t.reInitChartElementByID(id);
                    }
                }
            }, 500);
        });
    }

    reInitChartElementByID(id) {
        const t = this;
        const el = document.getElementById(id);
        t.notResponsiveCharts[id].destroy();
        t.charts[id] = null;
        t.notResponsiveCharts[id] = null;
        el.classList.remove('chart-init');
        el.removeAttribute('width');
        el.removeAttribute('style');
        t.chartItemInit(el);
    }

    reInitChartElementByElement(el) {
        const t = this;
        const id = el.getAttribute('id');
        t.notResponsiveCharts[id].destroy();
        t.charts[id] = null;
        t.notResponsiveCharts[id] = null;
        el.classList.remove('chart-init');
        el.removeAttribute('width');
        el.removeAttribute('style');
        t.chartItemInit(el);
    }

    initLoop() {
        const t = this;
        document.querySelectorAll('.chart').forEach(function (chartElement, index) {
            let id = chartElement.getAttribute('id');
            if (id === null) {
                id = 'chart-js-' + index;
                chartElement.setAttribute('id', 'chart-js-' + index);
            }
            chartElement.classList.add('loading');
            t.chartItemInit(chartElement);
        });

    }

    chartItemInit(chartElement) {
        const t = this;
        const id = chartElement.getAttribute('id');
        const jsonUrl = chartElement.getAttribute('data-source');
        if (chartElement.classList.contains('is-test')) {
            t.setParametersAndRenderChart({
                json: t.testData,
                element: chartElement
            })
            return;
        }
        if (jsonUrl !== undefined && !chartElement.classList.contains('chart-init')) {
            caches.open(jsonUrl).then(cache => {
                cache.match(jsonUrl).then(async cachedResponse => {
                    if (cachedResponse) {
                        cachedResponse.json().then(json => t.setParametersAndRenderChart({
                            json: json, element: chartElement
                        }));
                    } else {
                        fetch(jsonUrl).then(response => {
                            cache.put(jsonUrl, response.clone());
                            response.json().then(json => t.setParametersAndRenderChart({
                                json: json, element: chartElement
                            }));
                        });
                    }
                });
            });
        }
    }

    setParametersAndRenderChart(args = {}) {
        const t = this;
        const json = args.json;
        const element = args.element;
        if (json === undefined) return;
        if (element === undefined) return;
        const id = element.getAttribute('id');
        const labels = Object.keys(json);
        const values = Object.values(json);
        const data = {
            labels: labels,
            datasets: [{
                label: 'Rating',
                data: values,
                fill: 'start',
                borderColor: 'rgba(61, 115, 255, 0.6)',
                tension: 0.4,
                backgroundColor: 'rgba(61, 115, 255, 0.05)',
                hoverBackgroundColor: 'rgba(61, 115, 255, 0.1)',
                pointBackgroundColor: 'rgba(61, 115, 255, 0.8)',
                pointBorderColor: 'rgba(61, 115, 255, 0.4)',
                pointBorderWidth: 10,
                color: '#ffffff',
            }]
        };
        const options = {
            responsive: true,
            plugins: {
                tooltip: {
                    titleColor: 'white',
                    bodyColor: 'white'
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)',
                        borderDash: [10, 5]
                    }
                },
                y: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)',
                        borderDash: [10, 5]
                    }
                }
            }
        };
        if (element.classList.contains('not-responsive')) {
            options.responsive = false;
            t.resizeListener = true;
        }
        const config = {
            type: 'line',
            data: data,
            options: options
        };
        console.log(options)
        t.charts[id] = new Chart(element, config);
        if (element.classList.contains('not-responsive')) {
            t.notResponsiveCharts[id] = t.charts[id];
        }
        element.classList.add('chart-init');
        setTimeout(function () {
            element.classList.remove('loading');
        }, 10);
    }

    formEventListener() {
        const t = this;
        document.querySelectorAll('.chart-filter').forEach(function (form) {
            form.querySelectorAll('input').forEach(function (el) {
                el.addEventListener('change', function () {
                    form.dispatchEvent(new Event('submit'));
                })
            })
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const action = form.getAttribute('action');
                const selector = form.getAttribute('data-chart');
                if (selector === null) return;
                const chartElement = document.querySelector(selector);
                if (chartElement === null) return;
                const formData = new FormData(form);
                let url = action + '?';
                let arr = [];
                for (const [key, value] of formData.entries()) {
                    arr.push(`${key}=${value}`);
                }
                url = encodeURI(url + arr.join('&'));
                chartElement.setAttribute('data-source', url);
                t.reInitChartElementByElement(chartElement);
            });
        });
        $(document).on('change', '.chart-filter select', function () {
            $(this).closest('form')[0].dispatchEvent(new Event('submit'));
        });
    }
}