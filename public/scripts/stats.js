let messagesChartContext = document.getElementById("messages-chart").getContext("2d")
let membersChartContext = document.getElementById("members-chart").getContext("2d")
let joinsLeavesChartContext = document.getElementById("joins-leaves-chart").getContext("2d")
let joinsHeaderElement = document.getElementById("joins-header-element")
let leavesHeaderElement = document.getElementById("leaves-header-element")
let dailyMessagesHeaderElement = document.getElementById("daily-messages-header-element")
let membersHeaderElement = document.getElementById("members-header-element")
let pageSearchViewsChartContext = document.getElementById("page-search-views-chart").getContext("2d")
let pageSearchViewsHeader = document.getElementById("page-search-views-header-element")
let joinButtonClicksChartContext = document.getElementById("join-button-clicks-chart").getContext("2d")
let joinButtonClicksHeader = document.getElementById("join-button-clicks-header-element")
let bumpButton = document.getElementById("execute-bump")
let bumpWarning = document.getElementById("bump-warning")
let bumpParagraph = document.getElementById("bump-paragraph")

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
    animation: {
        duration: 600
    },
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
            beginAtZero: true,
            ticks: {
                font: {
                    size: 13,
                    family: "poppins",
                },
                color: "white",
                precision: 0
            }
        }
    },
    tooltips: {
        mode: "index",
        intersect: true,
    },
}

function getDaysArray(data, propertyName, takeValueFromPreviousDay = false) {
    let daysArray = [] // where today is the first element
    let today = new Date()
    for(let i = TOTAL_DAYS - 1; i != -1; i--) {
        let thatDay = new Date(+today)
        thatDay.setDate(today.getDate() - i)
        let dayJustInCase = {date: null}
        console.log(takeValueFromPreviousDay)
        dayJustInCase[propertyName] = (takeValueFromPreviousDay ? (daysArray[daysArray.length - 1]?.value || 0) : 0)
        let day = data.find(e => { return isSameDay(thatDay, new Date(e.date)) }) || dayJustInCase
        daysArray.push({value: day[propertyName], day: thatDay})
    }
    return daysArray
}
function allowHidingForHeaderElement(headerElement, chart, datasetIndex) {
    let hidden = false
    headerElement.addEventListener("click", (event) => {
        hidden = !hidden
        chart.data.datasets[datasetIndex].hidden = hidden
        headerElement.classList.toggle("hidden")
        chart.update()
    })
}
const defaultChartColors = {
    borderColor: SPECIAL_COLOR_1,
    pointBackgroundColor: "#99008f",
    backgroundColor: "#170015",
}

let dailyMessagesChart = initializeChart(messagesChartContext, serverData.messagesDays, "messages", false, defaultChartColors)
let membersChart = initializeChart(membersChartContext, serverData.membersDays, "members", true, defaultChartColors)
let pageSearchViewsChart = initializeChart(pageSearchViewsChartContext, serverData.pageSearchViewsDays, "pageSearchViews", false, defaultChartColors)
let joinButtonClicksChart = initializeChart(joinButtonClicksChartContext, serverData.joinClicksDays, "joinClicks", false, defaultChartColors)

let joinsDays = getDaysArray(serverData.joinsDays, "joins")
let leavesDays = getDaysArray(serverData.leavesDays, "leaves")
const leavesJoinsChart = new Chart(joinsLeavesChartContext, {
    type: "line",
    data: {
        labels: joinsDays.map(day => months[day.day.getUTCMonth()] + " " + day.day.getUTCDate()),
        datasets: [{
            data: joinsDays.map(day => day.value),
            lineHeight: 1.2,
            tension: 0.3,
            fill: true,
            borderWidth: 3,
            borderColor: "#3dff44",
            pointBackgroundColor: "#00a306",
            backgroundColor: "#011400",
        }, {
            data: leavesDays.map(day => day.value),
            lineHeight: 1.2,
            tension: 0.3,
            fill: true,
            borderWidth: 3,
            borderColor: "#ff0000",
            pointBackgroundColor: "#940000",
            backgroundColor: "#240000",
        }]
    },
    options: {
        ...optionsDefault
    }
})

allowHidingForHeaderElement(joinsHeaderElement, leavesJoinsChart, 0)
allowHidingForHeaderElement(leavesHeaderElement, leavesJoinsChart, 1)
allowHidingForHeaderElement(dailyMessagesHeaderElement, dailyMessagesChart, 0)
allowHidingForHeaderElement(membersHeaderElement, membersChart, 0)
allowHidingForHeaderElement(pageSearchViewsHeader, pageSearchViewsChart, 0)
allowHidingForHeaderElement(joinButtonClicksHeader, joinButtonClicksChart, 0)

function isSameDay(date1, date2) {
    return date1.getUTCDate() == date2.getUTCDate() && date1.getUTCMonth() == date2.getUTCMonth() && date1.getUTCFullYear() == date2.getUTCFullYear()
} 




function initializeChart(context, data, propertyName, takeValueFromPreviousDay, ...datasets) {
    let daysArray = getDaysArray(data, propertyName, takeValueFromPreviousDay)
    let chart = new Chart(context, {
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
    return chart
}

bumpButton.addEventListener("click", async (event) => {
    if(Date.now() - serverData.lastBump < 7200000) {
        showToast("You have already bumped your server in the past 2 hours.")
        return
    }
    if(!serverData.invite) {
        showToast("You must have an invite link set for your server before bumping your server. Try again later.")
        return
    }
    let response = await ajax(`/api/bump-server/${serverData.id}`, "POST")
    if(response == "true") {
        bumpWarning.classList.add("hidden")
        bumpParagraph.innerHTML = `Total bumps: <span class="special">${serverData.bumps.length + 1}</span><br>Last bump: <span class="special">Just now</span>`
        bumpButton.classList.add("blocked")
        showToast("Server bumped!")
        serverData.lastBump = Date.now()
        serverData.bumps.push(Date.now())
    }
})