let toast = document.getElementById("toast")

if(loggedIn) {
    let sendReviewButton = document.getElementById("send-review-button")
    let reviewTextArea = document.getElementById("review-textarea")
    let starElements = Array.from(document.getElementById("stars-create-review").children).reverse()
    let currentlySelectedStars = 0
    for(let i = 0; i != starElements.length; i++) {
        let starElement = starElements[i]
        starElement.addEventListener("mousedown", (event) => {
            currentlySelectedStars = 5 - i
            for(let j = 0; j != starElements.length; j++) {
                let jStarElement = starElements[j]
                // if i is lower or equals j, the star is empty.
                // otherwise, it's filled
                if (i <= j) {
                    jStarElement.classList.remove("empty")
                    jStarElement.classList.add("filled")
                } else if (i > j) {
                    jStarElement.classList.remove("filled")
                    jStarElement.classList.add("empty")
                }
            }
        })
    }
    sendReviewButton.addEventListener("click", async (event) => {
        if(currentlySelectedStars == 0) {
            showToast("Select a rating before sending your review.")
            return
        }
        let response = await ajax("/api/post-review", "POST", {
            rating: currentlySelectedStars,
            text: reviewTextArea.value,
            serverId: serverData.id
        })
    })
}


function showToast(message) {
    toast.style.top = "30px"
    toast.textContent = message
    setTimeout(function() {
        toast.style.top = "-70px"
    }, 3000)
}