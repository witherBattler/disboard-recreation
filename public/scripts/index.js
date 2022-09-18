let serversContainer = document.getElementById("servers")
let searchButton = document.getElementById("search-bar-button")
let searchInput = document.getElementById("search-bar-input")
let searchResultsLabel = document.getElementById("search-results")
let currentSearchTerms = {
    search: null,
    category: null,
}
let currentlyRefreshingSearch = false
let categoriesSearchButtons = Array.from(document.querySelectorAll("#search-categories > .category"))
let lastCategoryButton = null

// on startup, show servers
ajax("/api/servers").then(servers => {
    servers = JSON.parse(servers)
    displayServers(servers)
})

// when triggered, show servers with the current search terms (search, category)
searchButton.addEventListener("click", async (event) => {
    serversContainer.innerHTML = ""
    currentSearchTerms.search = searchInput.value
    await reloadSearch(currentSearchTerms)
})
searchInput.addEventListener("keydown", async (event) => {
    if(event.key == "Enter") {
        serversContainer.innerHTML = ""
        currentSearchTerms.search = searchInput.value
        await reloadSearch(currentSearchTerms)
    }
})
for(let i = 0; i != categoriesSearchButtons.length; i++) {
    let button = categoriesSearchButtons[i]
    button.addEventListener("click", async (event) => {
        let buttonValue = button.dataset.value
        if(lastCategoryButton != null) {
            lastCategoryButton.style.color = null
            lastCategoryButton.style.backgroundColor = null
            lastCategoryButton.style.transform = null
        }
        if(currentSearchTerms.category == buttonValue) {
            currentSearchTerms.category = null
            lastCategoryButton = null
        } else {
            currentSearchTerms.category = buttonValue
            lastCategoryButton = button
            lastCategoryButton.style.color = "var(--special-color-1)"
            lastCategoryButton.style.backgroundColor = "white"
            lastCategoryButton.style.transform = "scale(1.1)"
        }
        serversContainer.innerHTML = ""
        await reloadSearch(currentSearchTerms)
    })
}

async function reloadSearch(searchTerms) {
    // to make it impossible to spam refresh
    if(currentlyRefreshingSearch) {
        return false
    }
    currentlyRefreshingSearch = true

    let servers = await ajax(constructSearchString(searchTerms))
    servers = JSON.parse(servers)
    displayServers(servers)
    searchResultsLabel.textContent = constructSearchDescription(searchTerms)

    currentlyRefreshingSearch = false
}
function displayServers(servers) {
    for(let i = 0; i != servers.length; i++) {
        const server = servers[i]
        const serverElement = constructServerElement(
            server.serverId,
            server.icon,
            server.guildName,
            server.shortDescription,
            server.tags,
            `/api/join-server/${server.id}`,
            false,
            server.id
        )
        serversContainer.appendChild(serverElement)
    }
    serversContainer.style.gridTemplateColumns = `repeat(${Math.min(4, servers.length)}, 500px)`
}