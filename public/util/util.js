let timeConversionData = [
	["second", "seconds", 1000], 
	["minute", "minutes", 60], 
	["hour", "hours", 60], 
	["day", "days", 24], 
	["week", "weeks", 7],
	["month", "months", 4.34524],
	["year", "years", 12],
	["decade", "decades", 10],
	["century", "centuries", 10]
]
function convertTimeFromMS(time) {
	time = Math.max(time, 1000)
	let timeConversionDataIndex = 0
	while(time / timeConversionData[timeConversionDataIndex][2] >= 1) {
		time = time / timeConversionData[timeConversionDataIndex][2]
		timeConversionDataIndex++
		if(timeConversionDataIndex >= timeConversionData.length) {
			break
		}
	}
	let t = timeConversionData[timeConversionDataIndex - 1][1]
	let timeNumber = Math.floor(time)
    if(timeNumber == 1) {
        t = timeConversionData[timeConversionDataIndex - 1][0]
    }
	return timeNumber + " " + t
}

function ajax(url, method, data) {
    // fetch
    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                "Content-Type": "application/json"
            },
            method: method,
            body: data
        }).then(res => res.text().then(json => {
            resolve(json)
        }))
    }).catch(err => {
        reject(err)
    })
}

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

function constructServerElement(id, name, mode, addBot, icon, description, tags, join, cordifyServerId) {
    const serverElement = document.createElement("div")
    serverElement.className = "server"

    const serverTopElement = document.createElement("div")
    serverTopElement.className = "server-top"

    const iconElement = document.createElement("img")
    iconElement.draggable = "false"
    if(icon != null) {
        iconElement.src = `https://cdn.discordapp.com/icons/${id}/${icon}`
    } else {
        iconElement.src = "images/discord-icon.svg"
    }

    const serverNameElement = document.createElement("h3")
    serverNameElement.textContent = name

    serverTopElement.appendChild(iconElement)
    serverTopElement.appendChild(serverNameElement)

    const buttonsContainer = document.createElement("div")
    serverTopElement.appendChild(buttonsContainer)

    switch(mode) {
        case "dashboard":
            let addBotButton
            if(addBot) {
                addBotButton = document.createElement("button")
                addBotButton.textContent = "Add bot"
                addBotButton.addEventListener("click", (event) => {
                    window.location = addBot
                })
                buttonsContainer.appendChild(addBotButton)
            }
            break
        case "display":
            
            serverTopElement.addEventListener("click", (event) => {
                if(joinButton.matches(":hover") || viewButton.matches(":hover")) {
                    return
                }
                window.open("/api/join-server/" + cordifyServerId)
            })
            let joinButton
            joinButton = document.createElement("button")
            joinButton.textContent = "Join"
            joinButton.addEventListener("click", (event) => {
                window.open(join)
            })
            buttonsContainer.appendChild(joinButton)
            break
    }
    let viewButton
    viewButton = document.createElement("button")
    viewButton.textContent = "View"
    viewButton.addEventListener("click", (event) => {
        window.open("/server/" + cordifyServerId)
    })
    buttonsContainer.appendChild(viewButton)

    
    // server top
    

    

    


    


    

    


    // server bottom
    const serverBottomElement = document.createElement("div")
    serverBottomElement.className = "server-bottom"

    const descriptionElement = document.createElement("p")
    descriptionElement.textContent = description || "No description."
    if(description.length == 0) {
        descriptionElement.className = "no-description"
    }

    const tagsContainerElement = document.createElement("div")
    tagsContainerElement.className = "tags"

    for(let i = 0; i != tags.length; i++) {
        const tagElement = document.createElement("div")
        tagElement.className = "tag"
        tagElement.textContent = "#" + tags[i]
        tagsContainerElement.appendChild(tagElement)
    }

    
    if(mode == "dashboard") {
        let settingsContainer = document.createElement("div")
        settingsContainer.classList.add("settings-container")
        tagsContainerElement.appendChild(settingsContainer)

        statsButton = document.createElement("img")
        statsButton.classList.add("settings-button")
        if(addBot) {
            statsButton.classList.add("blocked")
        }
        statsButton.src = "icons/stats.svg"
        statsButton.addEventListener("click", (event) => {
            if(!addBot) {
                window.open("/stats/" + cordifyServerId)
            } else {
                showToast("Cannot view stats: the bot hasn't joined this server.")
            }
        })

        settingsContainer.appendChild(statsButton)

        let settingsButton = document.createElement("img")
        settingsButton.classList.add("settings-button")
        settingsButton.src = "/icons/server-settings.svg"

        settingsButton.addEventListener("click", (event) => {
            window.open("/edit-server/" + cordifyServerId)
        })

        settingsContainer.appendChild(settingsButton)
    }
    

    serverBottomElement.appendChild(descriptionElement)
    serverBottomElement.appendChild(tagsContainerElement)

    // adding top and bottom to server
    serverElement.appendChild(serverTopElement)
    serverElement.appendChild(serverBottomElement)

    return serverElement
}

function getArrayAverage(array) {
    let sum = array.reduce((sum, number) => sum + number)
    return sum / array.length
}

function getStarAmount(number) {
    return Math.round(number * 2) / 2
}

let ratingDefinitions = ["Bad", "Unimpressive", "Okay", "Good", "Perfect"]
function getRatingDefinition(rating) {
    return ratingDefinitions[Math.round(rating) - 1]
}

function constructHardEdgedGradient(color1, color2, cutAt) {
    return `linear-gradient(to right, ${color1} 0%, ${color1} ${cutAt * 100 + "%"}, ${color2} ${cutAt * 100 + "%"}, ${color2} 100%)`
}

function constructSearchString(searchTerms) {
    let toReturn = "/api/servers"
    if(searchTerms.search) {
        toReturn += "?search=" + searchTerms.search
        if(searchTerms.category) {
            toReturn += "&category=" + searchTerms.category
        }
    } else if(searchTerms.category) {
        toReturn += "?category=" + searchTerms.category
    }
    return toReturn
}
function constructSearchDescription(searchTerms) {
    let toReturn = ""
    if(searchTerms.search) {
        toReturn += `Showing results for "${searchTerms.search}"`
        if(searchTerms.category) {
            toReturn += ` in category "${searchTerms.category}"`
        }
    } else if(searchTerms.category) {
        toReturn += `Showing results for servers in category "${searchTerms.category}"`
    }
    return toReturn
}

function constructReviewElement(userId, icon, name, starsCount, createdAt, text, upvoted, upvotes, downvoted, downvotes, id) {
    const reviewContainer = document.createElement("div")
    reviewContainer.classList.add("review")

    const reviewInnerContainer = document.createElement("div")
    reviewInnerContainer.classList.add("review-inner-container")

    const reviewProfile = document.createElement("div")
    reviewProfile.classList.add("review-profile")

    const reviewProfileIcon = document.createElement("img")
    reviewProfileIcon.classList.add("review-profile-icon")
    reviewProfileIcon.src = `https://cdn.discordapp.com/avatars/${userId}/${icon}`

    const reviewProfileName = document.createElement("p")
    reviewProfileName.classList.add("review-profile-name")
    reviewProfileName.textContent = name

    const reviewSecondLevel = document.createElement("div")
    reviewSecondLevel.classList.add("review-second-level")

    const stars = document.createElement("div")
    stars.classList.add("stars")

    let starsList = []
    for(let i = 0; i != 5; i++) {
        let starElement = document.createElement("div")
        starElement.classList.add("star")
        if(starsCount >= 1) {
            starElement.classList.add("filled")
            starsCount -= 1
        } else if(starsCount == 0.5) {
            starElement.classList.add("half-empty")
            starsCount -= 0.5
        } else {
            starElement.classList.add("empty")
        }
        starsList.push(starElement)
        stars.appendChild(starElement)
    }

    const reviewDate = document.createElement("div")
    reviewDate.classList.add("review-date")
    reviewDate.textContent = `${convertTimeFromMS(Date.now() - createdAt)} ago`

    const reviewText = document.createElement("p")
    reviewText.classList.add("review-text")
    reviewText.textContent = text

    const reviewVote = document.createElement("div")
    reviewVote.classList.add("review-vote")

    const reviewUpvote = document.createElement("div")
    reviewUpvote.classList.add("review-upvote")

    const reviewUpvoteCount = document.createElement("p")
    reviewUpvoteCount.classList.add("review-upvote-count")
    reviewUpvoteCount.textContent = upvotes

    const reviewUpvoteIcon = document.createElement("img")
    reviewUpvoteIcon.classList.add("review-upvote-icon")
    reviewUpvoteIcon.src = "icons/upvote.svg"

    const reviewDownvote = document.createElement("div")
    reviewDownvote.classList.add("review-downvote")

    const reviewDownvoteCount = document.createElement("p")
    reviewDownvoteCount.classList.add("review-downvote-count")
    reviewDownvoteCount.textContent = downvotes

    const reviewDownvoteIcon = document.createElement("img")
    reviewDownvoteIcon.classList.add("review-downvote-icon")
    reviewDownvoteIcon.src = "icons/downvote.svg"

    if(downvoted) {
        reviewDownvote.classList.add("active")
        reviewDownvoteIcon.src = "icons/downvote-selected.svg"
    }
    if(upvoted) {
        reviewUpvote.classList.add("active")
        reviewUpvoteIcon.src = "icons/upvote-selected.svg"
    }
    if(loggedIn) {
        reviewUpvote.addEventListener("click", async (event) => {
            let response
            if(upvoted) {
                response = await ajax(`api/reviews/remove-upvote/${id}`, "POST")
            } else {
                response = await ajax(`api/reviews/add-upvote/${id}`, "POST")
            }
            response = JSON.parse(response)
            processReviewVoteResponse(response, reviewUpvote, reviewUpvoteCount, reviewUpvoteIcon, reviewDownvote, reviewDownvoteCount, reviewDownvoteIcon)
            upvoted = response.upvoted
            downvoted = response.downvoted
        })
        reviewDownvote.addEventListener("click", async (event) => {
            let response
            if(downvoted) {
                response = await ajax(`/api/reviews/remove-downvote/${id}`, "POST")
            } else {
                response = await ajax(`api/reviews/add-downvote/${id}`, "POST")
            }
            response = JSON.parse(response)
            processReviewVoteResponse(response, reviewUpvote, reviewUpvoteCount, reviewUpvoteIcon, reviewDownvote, reviewDownvoteCount, reviewDownvoteIcon)
            upvoted = response.upvoted
            downvoted = response.downvoted
        })
    } else {
        let func = function() {
            showNotLoggedInPopup("You need to be logged in to vote on reviews on Cordify. Why aren't you?!")
        }
        reviewUpvote.addEventListener("click", func)
        reviewDownvote.addEventListener("click", func)
    }

    // adding elements
    reviewContainer.appendChild(reviewInnerContainer)
    reviewInnerContainer.appendChild(reviewProfile)
    reviewInnerContainer.appendChild(reviewSecondLevel)
    reviewInnerContainer.appendChild(reviewText)
    reviewInnerContainer.appendChild(reviewVote)
    reviewProfile.appendChild(reviewProfileIcon)
    reviewProfile.appendChild(reviewProfileName)
    reviewSecondLevel.appendChild(stars)
    reviewSecondLevel.appendChild(reviewDate)
    reviewVote.appendChild(reviewUpvote)
    reviewVote.appendChild(reviewDownvote)
    reviewUpvote.appendChild(reviewUpvoteCount)
    reviewUpvote.appendChild(reviewUpvoteIcon)
    reviewDownvote.appendChild(reviewDownvoteCount)
    reviewDownvote.appendChild(reviewDownvoteIcon)

    return reviewContainer
}

function processReviewVoteResponse(response, elementUpvote, upvoteCount, iconUpvote, elementDownvote, downvoteCount, iconDownvote) {
    if(response.upvoted) {
        elementUpvote.classList.add("active")
        iconUpvote.src = "icons/upvote-selected.svg"
    } else {
        elementUpvote.classList.remove("active")
        iconUpvote.src = "icons/upvote.svg"
    }
    if(response.downvoted) {
        elementDownvote.classList.add("active")
        iconDownvote.src = "icons/downvote-selected.svg"
    } else {
        elementDownvote.classList.remove("active")
        iconDownvote.src = "icons/downvote.svg"
    }
    upvoteCount.textContent = response.upvotes.length
    downvoteCount.textContent = response.downvotes.length
}