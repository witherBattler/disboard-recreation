let messagesChart = document.getElementById("messages-chart")
let messagesChartContext = messagesChart.getContext("2d")

const defaultColor = "#FF00EE"

new Chart(messagesChartContext, {
    type: "line",
    data: {
        labels: ["1", "2", "3", "4", "5", "6", "7"],
        datasets: [{
            label: "Daily messages",
            data: [12, 19, 3, 5, 2, 3, 8],
            borderColor: defaultColor,
            pointBackgroundColor: "#99008f",
            backgroundColor: "#170015",
            lineHeight: 1.2,
            tension: 0.3,
            fill: true,
            borderWidth: 3
        }],
    },
    options: {
        maintainAspectRatio: false,
        hover: {
            mode: "index",
            intersect: false
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 16,
                        family: "Poppins",
                        weight: "600",
                    },
                    color: defaultColor
                }
            },
            labels: {
                font: {
                    size: 30
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        tooltips: {
            mode: "index",
            intersect: true,
        },
    },
    
})

