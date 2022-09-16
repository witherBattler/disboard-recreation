let messagesChartContext = document.getElementById("messages-chart").getContext("2d")
let membersChartContext = document.getElementById("members-chart").getContext("2d")
let joinsLeavesChartContext = document.getElementById("joins-leaves-chart").getContext("2d")

const SPECIAL_COLOR_1 = "#FF00EE"
const TOTAL_DAYS = 7
const pluginsDefault = {
    tooltips: {
        callbacks: {
            label: function(tooltipItem) {
                return tooltipItem.yLabel
            }
        }
    }
}
const optionsDefault = {
    plugins: {
        legend: {
            display: false
        },
        ...pluginsDefault
    },
    maintainAspectRatio: false,
    hover: {
        mode: "index",
        intersect: false
    },
    interaction: {
        mode: 'index',
        intersect: false
    },
    scales: {
        x: {
            ticks: {
                font: {
                    size: 12,
                    family: "poppins",
                    lineHeight: 0.9
                },
                color: "white"
            }
        },
        y: {
            ticks: {
                font: {
                    size: 13,
                    family: "poppins",
                },
                color: "white"
            }
        }
    },
    tooltips: {
        mode: "index",
        intersect: true,
    },
}

function getDaysArray(data, propertyName) {
    let daysArray = [] // where today is the first element
    let today = new Date()
    for(let i = 0; i != TOTAL_DAYS; i++) {
        let thatDay = new Date(+today)
        thatDay.setDate(today.getDate() - i)
        let dayJustInCase = {date: null}
        dayJustInCase[propertyName] = 0
        let day = data.find(e => { return isSameDay(thatDay, new Date(e.date)) }) || dayJustInCase
        daysArray.unshift({value: day[propertyName], day: thatDay})
    }
    return daysArray
}

initializeChart(messagesChartContext, serverData.messagesDays, "messages", {
    borderColor: SPECIAL_COLOR_1,
    pointBackgroundColor: "#99008f",
    backgroundColor: "#170015",
})
initializeChart(membersChartContext, serverData.membersDays, "members", {
    borderColor: SPECIAL_COLOR_1,
    pointBackgroundColor: "#99008f",
    backgroundColor: "#170015",
})
new Chart(joinsLeavesChartContext, {
    type: "line",
    data: {
        labels: []
    }
})


function isSameDay(date1, date2) {
    return date1.getUTCDate() == date2.getUTCDate() && date1.getUTCMonth() == date2.getUTCMonth() && date1.getUTCFullYear() == date2.getUTCFullYear()
} 




function initializeChart(context, data, propertyName, ...datasets) {
    let daysArray = getDaysArray(data, propertyName)
    new Chart(context, {
        type: "line",
        data: {
            labels: daysArray.map(day => months[day.day.getUTCMonth()] + " " + day.day.getUTCDate()),
            datasets: datasets.map(dataset => {
                return {
                    data: daysArray.map(day => day.value),
                    lineHeight: 1.2,
                    tension: 0.3,
                    fill: true,
                    borderWidth: 3,
                    ...dataset
                }
            })
        },
        options: {
            ...optionsDefault,
        },
    })    
}

