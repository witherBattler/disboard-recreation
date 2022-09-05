const notLoggedInCloseButton = document.getElementById("not-logged-in-close")
const notLoggedInPopup = document.getElementById("not-logged-in-popup")
const notLoggedInBackground = document.getElementById("not-logged-in-background")
const notLoggedInContext = document.getElementById("not-logged-in-popup-context")

notLoggedInCloseButton.addEventListener("click", (event) => {
    closeNotLoggedInPopup()
})

function showNotLoggedInPopup(context) {
    notLoggedInContext.textContent = context
    notLoggedInPopup.style.display = "block"
    notLoggedInBackground.style.display = "block"
    setTimeout(function() {
        notLoggedInPopup.style.opacity = "1"
        notLoggedInBackground.style.opacity = "1"
    })
}
function closeNotLoggedInPopup() {
    notLoggedInPopup.style.opacity = "0"
    notLoggedInBackground.style.opacity = "0"
    setTimeout(function() {
        notLoggedInPopup.style.display = "none"
        notLoggedInBackground.style.display = "none"
    }, 300)
}