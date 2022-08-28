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
        let response = await ajax("/api/post-review", "POST", JSON.stringify({
            rating: currentlySelectedStars,
            text: reviewTextArea.value,
            serverId: serverData.id
        }))
    })
}


function showToast(message) {
    toast.style.top = "30px"
    toast.textContent = message
    setTimeout(function() {
        toast.style.top = "-70px"
    }, 3000)
}

let starElementsAverage = Array.from(document.getElementById("stars-average-rating").children)
let reviewsSummaryLabel = document.getElementById("reviews-summary-label")
ajax(`/api/reviews-data?ids=${serverData.reviews.join(",")}`).then(reviews => {
    // average
    reviews = JSON.parse(reviews)
    let reviewsRatings = reviews.map(review => review.rating) // array with ratings
    let averageReview = getArrayAverage(reviewsRatings) // average of all reviews in reviewsRatings
    let starAverage = getStarAmount(averageReview) // rounded to nearest 0.5
    let starAverageCopy = starAverage
    for(let i = 0; i != starElementsAverage.length; i++) {
        let star = starElementsAverage[i]
        if(starAverageCopy >= 1) { // this star is filled
            starAverageCopy -= 1
            star.classList.add("filled")
        } else if(starAverageCopy == 0.5) { // this star is half filled / half empty
            starAverageCopy -= 0.5
            star.classList.add("half-empty")
        } else { // this star is empty
            star.classList.add("empty")
        }
    }
    reviewsSummaryLabel.textContent = `${starAverage} out of 5: ${getRatingDefinition(starAverage)}`
})
