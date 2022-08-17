console.log("scripts/dashboard.js")

let darkOverlay = document.getElementById("dark-overlay")
let serverSelectorPopup = document.getElementById("server-selector-popup")

function openServerSelectorPopup() {
    darkOverlay.style.display = "block"
    serverSelectorPopup.style.display = "block"
    setTimeout(function() {
        darkOverlay.style.opacity = "1"
        serverSelectorPopup.style.opacity = "1"
    })
}
function closeServerSelectorPopup() {
    darkOverlay.style.opacity = "0"
    serverSelectorPopup.style.opacity = "0"
    setTimeout(function() {
        darkOverlay.style.display = "none"
        serverSelectorPopup.style.display = "none"
    }, 300)
}