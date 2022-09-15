let messagesChartContext = document.getElementById("messages-chart").getContext("2d")

const SPECIAL_COLOR_1 = "#FF00EE"
const TOTAL_DAYS = 7

initializeChart(messagesChartContext, serverData.messagesDays, "messages")

function isSameDay(date1, date2) {
    return date1.getUTCDate() == date2.getUTCDate() && date1.getUTCMonth() == date2.getUTCMonth() && date1.getUTCFullYear() == date2.getUTCFullYear()
} 

function initializeChart(context, data, propertyName) {
    let daysArray = [] // where today is the first element
    let today = new Date()
    for(let i = 0; i != TOTAL_DAYS; i++) {
        let thatDay = new Date(+today)
        thatDay.setDate(today.getDate() - i)
        let dayJustInCase = {date: null}
        dayJustInCase[propertyName] = 0
        let day = data.find(e => { return isSameDay(thatDay, new Date(e.date)) }) || dayJustInCase
        daysArray.unshift({value: day[propertyName]})
    }
    console.log(data)
    new Chart(context, {
        type: "line",
        data: {
            labels: ["1", "2", "3", "4", "5", "6", "7"],
            datasets: [{
                label: "Daily messages",
                data: daysArray.map(day => day.value),
                borderColor: SPECIAL_COLOR_1,
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
                        color: SPECIAL_COLOR_1
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
}

