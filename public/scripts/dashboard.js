console.log("scripts/dashboard.js")

let darkOverlay = document.getElementById("dark-overlay")
let serverSelectorPopup = document.getElementById("server-selector-popup")
let chooseServerDropdown = document.getElementById("choose-server-dropdown")
let refreshChooseServerDropdownButton = document.getElementById("refresh-choose-server-dropdown")
let serverSelectorPopupNext = document.getElementById("server-selector-popup-next")
let tosAgreeCheckbox = document.getElementById("tos-agree-checkbox")
let dashboardDefault = document.getElementById("dashboard-default")
let dashboardConfigureServer = document.getElementById("dashboard-configure-server")

let serverIndicatorIcon = document.getElementById("server-indicator-icon")
let serverIndicatorText = document.getElementById("server-indicator-name")
let addTag = document.getElementById("add-tag")
let writeTagName = document.getElementById("write-tag-name")
let writeTagNameInput = document.getElementById("write-tag-name-input")
let writeTagNameConfirm = document.getElementById("write-tag-name-confirm")
let tagsContainer = document.getElementById("tags")
let submitButton = document.getElementById("submit-button")
let languageDropdown = document.getElementById("language-dropdown")
let categoryDropdown = document.getElementById("category-dropdown")
let shortDescriptionTextArea = document.getElementById("short-description")
let descriptionTextArea = document.getElementById("description")
let nsfwCheckbox = document.getElementById("nsfw-checkbox")
let unlistedCheckbox = document.getElementById("unlisted-checkbox")

let serversContainer = document.getElementById("servers")

let currentGuilds = null
let tags = []

async function openServerSelectorPopup() {
    darkOverlay.style.display = "block"
    serverSelectorPopup.style.display = "block"
    setTimeout(function() {
        darkOverlay.style.opacity = "1"
        serverSelectorPopup.style.opacity = "1"
    })
    if(currentGuilds == null) {
        currentGuilds = await ajax("/api/owned-guilds", "GET")
        currentGuilds = JSON.parse(currentGuilds)
        let guildNames = currentGuilds.map(guild => guild.name)
        chooseServerDropdown.setOptions(guildNames)
    }
}
function closeServerSelectorPopup() {
    darkOverlay.style.opacity = "0"
    serverSelectorPopup.style.opacity = "0"
    setTimeout(function() {
        darkOverlay.style.display = "none"
        serverSelectorPopup.style.display = "none"
    }, 300)
}
refreshChooseServerDropdownButton.addEventListener("click", async (event) => {
    chooseServerDropdown.disabled = true
    chooseServerDropdown.setOptions(["Loading..."])
    serverSelectorPopupNext.classList.remove("blocked")
    ajax("/api/owned-guilds", "GET")
        .then(response => {
            currentGuilds = JSON.parse(response)
            let guildNames = currentGuilds.map(guild => guild.name)
            chooseServerDropdown.setOptions(guildNames)
            chooseServerDropdown.disabled = false
            updateNextButton()
        })
        .catch(error => {
            if(error == 429) {
                let guildNames = currentGuilds.map(guild => guild.name)
                chooseServerDropdown.setOptions(guildNames)
                chooseServerDropdown.disabled = false
                alert("You are being rate limited.")
            }
        })
})

tosAgreeCheckbox.appendEventListener("change", () => {
    updateNextButton()
})


serverSelectorPopupNext.addEventListener("click", (event) => {
    if(canGoToNextPage()) {
        closeServerSelectorPopup()
        dashboardConfigureServer.style.display = "block"
        dashboardDefault.style.display = "none"
        
        let server = currentGuilds[chooseServerDropdown.selectedIndex]
        let serverIconUrl
        if(server.icon) {
            serverIconUrl = `https://cdn.discordapp.com/icons/${server.id}/${server.icon}`
        } else {
            serverIconUrl = "/images/discord-icon.svg"
        }
        let serverName = server.name
        serverIndicatorIcon.src = serverIconUrl
        serverIndicatorText.textContent = serverName
    }
})

addTag.addEventListener("click", (event) => {
    writeTagName.style.display = "flex"
    writeTagName.style.top = addTag.offsetTop + addTag.offsetHeight + 10 + "px"
    writeTagName.style.left = addTag.offsetLeft + "px"
    writeTagNameInput.focus()
})

writeTagNameConfirm.addEventListener("click", (event) => {
    let tagName = writeTagNameInput.value
    if(tags.indexOf(tagName) != -1) {
        alert("Tag already exists.")
        return
    }
    writeTagName.value = ""
    let tag = document.createElement("hashtag-renderer")
    tag.setAttribute("name", tagName)
    writeTagName.style.display = "none"
    tagsContainer.appendChild(tag)
    tag.appendEventListener("remove", (event) => {
        tags.splice(tags.indexOf(tag), 1)
    })

    tags.push(tagName)
    tag.appendEventListener("remove", (event) => {
        tags.splice(tags.indexOf(tagName), 1)
    })
})

submitButton.addEventListener("click", async (event) => {
    let serverId = currentGuilds[chooseServerDropdown.selectedIndex].id
    let data = {
        serverId: serverId,
        mainLanguage: languageDropdown.selected,
        category: categoryDropdown.selected,
        tags: tags,
        description: descriptionTextArea.value,
        shortDescription: shortDescriptionTextArea.value,
        nsfw: nsfwCheckbox.checked,
        unlisted: unlistedCheckbox.checked
    }
    let postId = await ajax("/api/post-server", "POST", JSON.stringify(data))
    window.location = "/dashboard?addbot=" + postId
})

function canGoToNextPage() {
    return (
        tosAgreeCheckbox.checked == true &&
        !chooseServerDropdown.disabled
    )
}
function updateNextButton() {
    if(canGoToNextPage()) {
        serverSelectorPopupNext.classList.remove("blocked")
    } else {
        serverSelectorPopupNext.classList.add("blocked")
    }
}

let addBotPopup = document.getElementById("add-bot-popup")
if(addBotPopup != null) {
    darkOverlay.style.display = "block"
    addBotPopup.style.display = "block"
    setTimeout(function() {
        darkOverlay.style.opacity = 1
        addBotPopup.style.opacity = 1
    })

}
function closeAddBotPopup() {
    darkOverlay.style.opacity = 0
    addBotPopup.style.opacity = 0
    setTimeout(function() {
        darkOverlay.style.display = "none"
        addBotPopup.style.display = "none"
    }, 300)
}

function generateBotUrl(guildId) {
    return `https://discord.com/api/oauth2/authorize?client_id=1008778841109573764&permissions=8&scope=bot${guildId ? `&guild_id=${guildId}&disable_guild_select=true` : ""}`
}

ajax("/api/owned-servers").then(ownedServers => {
    ownedServers = JSON.parse(ownedServers)
    for(let i = 0; i != ownedServers.length; i++) {
        let ownedServerObject = ownedServers[i]
        console.log(ownedServerObject.botJoined)
        let ownedServerElement = 
            constructServerElement(
                ownedServerObject.serverId,
                ownedServerObject.icon,
                ownedServerObject.guildName,
                ownedServerObject.shortDescription,
                ownedServerObject.tags,
                false,
                ownedServerObject.botJoined ? false : generateBotUrl(ownedServerObject.serverId),
                ownedServerObject.id
            )
        serversContainer.appendChild(ownedServerElement)
    }
})

