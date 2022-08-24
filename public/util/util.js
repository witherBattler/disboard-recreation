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

function constructServerElement(id, icon, name, description, tags, join, addBot) {
    const serverElement = document.createElement("div")
    serverElement.className = "server"

    // server top
    const serverTopElement = document.createElement("div")
    serverTopElement.className = "server-top"

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