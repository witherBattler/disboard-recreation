let serversContainer = document.getElementById("servers")

ajax("/api/servers").then(servers => {
    servers = JSON.parse(servers)
    for(let i = 0; i != servers.length; i++) {
        const server = servers[i]
        const serverElement = constructServerElement(
            server.serverId,
            server.icon,
            server.guildName,
            server.shortDescription,
            server.tags,
            server.invite,
            false,
            server.id
        )
            
        serversContainer.appendChild(serverElement)
    }
    serversContainer.style.gridTemplateColumns = `repeat(${Math.min(4, servers.length)}, 500px)`
})