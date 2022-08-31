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
        window.reload()
    })
}

let reviewsUsersLoaded = false

function showToast(message) {
    toast.style.top = "30px"
    toast.textContent = message
    setTimeout(function() {
        toast.style.top = "-70px"
    }, 3000)
}

let starElementsAverage = Array.from(document.getElementById("stars-average-rating").children)
let reviewsSummaryLabel = document.getElementById("reviews-summary-label")
let ratingSummaryCharts = Array.from(document.getElementsByClassName("rating-summary-chart"))
let popupBackground = document.getElementById("popup-background")
let reviewLeft = document.getElementById("review-left")
let reviewsPopup = document.getElementById("reviews-popup")
let reviewsCloseButton = document.getElementById("reviews-close-button")

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

    // shares
    let amounts = [] // array of amounts of reviews, where the rating is the index of the value
    for(let i = ratingSummaryCharts.length; i != 0; i--) {
        let amount = reviewsRatings.filter(rating => rating == i).length
        amounts.push(amount)
    }
    let shares = amounts.map(amount => amount / reviewsRatings.length)
    for(let i = 0; i != shares.length; i++) {
        ratingSummaryCharts[i].style.backgroundImage = constructHardEdgedGradient("white", "transparent", shares[i])
    }

    // reviews panel
    reviewLeft.addEventListener("click", async (event) => {
        showReviewsPopup()
        reviewsUsersLoaded = true
        let userIds = reviews.map(review => review.author)
        // let users = await ajax("/api/users?users=" + userIds.join(","), "GET", )
    })
    reviewsCloseButton.addEventListener("click", (event) => {
        hideReviewsPopup()
    })
    popupBackground.addEventListener("click", (event) => {
        if(!reviewsPopup.matches(":hover")) {
            hideReviewsPopup()
        }
    })
})

function showReviewsPopup() {
    popupBackground.style.display = "flex"
    reviewsPopup.style.display = "block"
    setTimeout(function() {
        popupBackground.style.opacity = "1"
        reviewsPopup.style.opacity = "1"

    })
}

function hideReviewsPopup() {
    popupBackground.style.opacity = "0"
    reviewsPopup.style.opacity = "0"
    setTimeout(function() {
        popupBackground.style.display = "none"
        reviewsPopup.style.display = "none"
    }, 300)
}