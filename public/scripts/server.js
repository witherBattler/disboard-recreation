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
        location.reload()
    })
}

let reviewsUsersLoaded = false
let reviewUsers = {}
let reviewsCopy = null
let currentReviewsMode = 0

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
let reviewsContainer = document.getElementById("reviews-container")
let starsDropdown = document.getElementById("stars-dropdown")

if(serverData.reviews.length > 0) {
    ajax(`/api/reviews-data?ids=${serverData.reviews.join(",")}`).then(reviews => {
        // average
        reviews = JSON.parse(reviews)
        reviewsCopy = reviews
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
    })
} else {
    for(let i = 0; i != starElementsAverage.length; i++) {
        let star = starElementsAverage[i]
        star.classList.add("empty")
    }
}
// reviews panel
let reviewsRendered = false
let starsChartContainers = document.getElementsByClassName("stars-chart-container")
reviewLeft.addEventListener("click", async (event) => {
    for(let i = 0; i != starsChartContainers.length; i++) {
        let starsChartContainer = starsChartContainers[i]
        if(starsChartContainer.matches(":hover")) {
            return
        }
    }
    showReviewsPopup()
    starsDropdown.setSelected(0)
    currentReviewsMode = 0
    if(reviewsCopy && !reviewsRendered) { // execute only if loaded, and only if there are reviews // and only if didn't render yet
        reviewsUsersLoaded = true
        await fetchReviewsUsers()
    }
    renderReviews(reviewsCopy)
    reviewsRendered = true
})


for(let i = 0; i != starsChartContainers.length; i++) {
    let starsChartContainer = starsChartContainers[i]
    starsChartContainer.addEventListener("click", async (event) => {
        let rating = 5 - i
        showReviewsPopup()
        starsDropdown.setSelected(i + 1)
        currentReviewsMode = rating
        reviewsContainer.innerHTML = ""
        if(!reviewsRendered) {
            await fetchReviewsUsers()
        }
        renderReviews(reviewsCopy.filter(review => review.rating == rating))
        reviewsRendered = true
    })
}

reviewsCloseButton.addEventListener("click", (event) => {
    hideReviewsPopup()
})
popupBackground.addEventListener("click", (event) => {
    if(!reviewsPopup.matches(":hover")) {
        hideReviewsPopup()
    }
})

function renderReviews(reviews) {
    for(let i = 0; i != reviews.length; i++) {
        let review = reviews[i]
        let user = reviewUsers[review.author]
        let upvoted = false
        let downvoted = false
        if(loggedIn) {
            upvoted = review.upvotes.indexOf(user.id) != -1
            downvoted = review.downvotes.indexOf(user.id) != -1
        }
        let reviewElement = constructReviewElement(user.id, user.avatar, user.username, review.rating, review.createdAt, review.text, upvoted, review.upvotes.length, downvoted, review.downvotes.length)
        reviewsContainer.appendChild(reviewElement)
    }
}

function showReviewsPopup() {
    popupBackground.style.display = "flex"
    reviewsPopup.style.display = "flex"
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
async function fetchReviewsUsers() {
    let userIds = reviewsCopy.map(review => review.author)
    let users = await ajax("/api/users?users=" + userIds.join(","), "GET")

    users = JSON.parse(users)
    for(let i = 0; i != users.length; i++) {
        reviewUsers[users[i].id] = users[i]
    }
}

starsDropdown.appendEvent("change", () => {
    if(starsDropdown.selected != "All") {
        let starsCount = 6 - starsDropdown.selectedIndex
        reviewsContainer.innerHTML = ""
        renderReviews(reviewsCopy.filter(review => review.rating == starsCount))
        currentReviewsMode = starsCount
    } else {
        reviewsContainer.innerHTML = ""
        renderReviews(reviewsCopy)
        currentReviewsMode = 0
    }
})