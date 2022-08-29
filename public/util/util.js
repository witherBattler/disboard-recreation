function ajax(url, method, data) {
    // fetch
    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                "Content-Type": "application/json"
            },
            method: method,
            body: data
        }).then(res => res.text().then(json => {
            resolve(json)
        }))
    }).catch(err => {
        reject(err)
    })
}

function constructServerElement(id, icon, name, description, tags, join, addBot, disdexServerId) {
    const serverElement = document.createElement("div")
    serverElement.className = "server"

    // server top
    const serverTopElement = document.createElement("div")
    serverTopElement.className = "server-top"
    if(disdexServerId)
        serverTopElement.addEventListener("click", (event) => {
            window.open("/server/" + disdexServerId)
        })

    const iconElement = document.createElement("img")
    iconElement.draggable = "false"
    if(icon != null) {
        iconElement.src = `https://cdn.discordapp.com/icons/${id}/${icon}`
    } else {
        iconElement.src = "images/discord-icon.svg"
    }

    const serverNameElement = document.createElement("h3")
    serverNameElement.textContent = name

    serverTopElement.appendChild(iconElement)
    serverTopElement.appendChild(serverNameElement)

    const buttonsContainer = document.createElement("div")

    if(join) {
        const joinButton = document.createElement("button")
        joinButton.textContent = "Join"
        joinButton.addEventListener("click", (event) => {
            window.open(join)
        })
        buttonsContainer.appendChild(joinButton)
    }

    if(addBot) {
        const addBotButton = document.createElement("button")
        addBotButton.textContent = "Add bot"
        addBotButton.addEventListener("click", (event) => {
            window.open(addBot)
        })
        buttonsContainer.appendChild(addBotButton)
    }

    serverTopElement.appendChild(buttonsContainer)

    // server bottom
    const serverBottomElement = document.createElement("div")
    serverBottomElement.className = "server-bottom"

    const descriptionElement = document.createElement("p")
    descriptionElement.textContent = description || "No description."
    if(description.length == 0) {
        descriptionElement.className = "no-description"
    }

    const tagsContainerElement = document.createElement("div")
    tagsContainerElement.className = "tags"

    for(let i = 0; i != tags.length; i++) {
        const tagElement = document.createElement("div")
        tagElement.className = "tag"
        tagElement.textContent = "#" + tags[i]
        tagsContainerElement.appendChild(tagElement)
    }

    serverBottomElement.appendChild(descriptionElement)
    serverBottomElement.appendChild(tagsContainerElement)

    // adding top and bottom to server
    serverElement.appendChild(serverTopElement)
    serverElement.appendChild(serverBottomElement)

    return serverElement
}

function getArrayAverage(array) {
    let sum = array.reduce((sum, number) => sum + number)
    return sum / array.length
}

function getStarAmount(number) {
    return Math.round(number * 2) / 2
}

let ratingDefinitions = ["Bad", "Unimpressive", "Okay", "Good", "Perfect"]
function getRatingDefinition(rating) {
    return ratingDefinitions[Math.round(rating) - 1]
}

function constructHardEdgedGradient(color1, color2, cutAt) {
    return `linear-gradient(to right, ${color1} 0%, ${color1} ${cutAt * 100 + "%"}, ${color2} ${cutAt * 100 + "%"}, ${color2} 100%)`
}

function constructSearchString(searchTerms) {
    let toReturn = "/api/servers"
    if(searchTerms.search) {
        toReturn += "?search=" + searchTerms.search
        if(searchTerms.category) {
            toReturn += "&category=" + searchTerms.category
        }
    } else if(searchTerms.category) {
        toReturn += "?category=" + searchTerms.category
    }
    return toReturn
}
function constructSearchDescription(searchTerms) {
    let toReturn = ""
    if(searchTerms.search) {
        toReturn += `Showing results for "${searchTerms.search}"`
        if(searchTerms.category) {
            toReturn += ` in category "${searchTerms.category}"`
        }
    } else if(searchTerms.category) {
        toReturn += `Showing results for servers in category "${searchTerms.category}"`
    }
    return toReturn
}