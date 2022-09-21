let toast = document.getElementById("toast")

let previousTimeout = null
function showToast(message, hold = false) {
    toast.style.top = "30px"
    toast.textContent = message
    if(previousTimeout) {
        clearTimeout(previousTimeout)
    }
    if(!hold) {
        previousTimeout = setTimeout(function() {
            toast.style.top = "-70px"
        }, 3000)
    } else {
        previousTimeout = null
    }
}