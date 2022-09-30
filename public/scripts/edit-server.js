let tagsContainer = document.getElementById("tags")
let tagsElements = tagsContainer.children
let nsfwCheckbox = document.getElementById("nsfw-checkbox")
let unlistedCheckbox = document.getElementById("unlisted-checkbox")
let languageDropdown = document.getElementById("language-dropdown")
let categoryDropdown = document.getElementById("category-dropdown")
let submitButton = document.getElementById("submit-button")

let changes = {}
for(let i = 0; i != tagsElements.length; i++) {
    let tagElement = tagsElements[i]
    tagElement.appendEventListener("remove", (name) => {
        tags = tags.filter(tag => tag != name)
        changes.tags = tags
    })
}

onTagAdd(function(tag) {
    console.log("asdf")
    changes.tags = tags
})

nsfwCheckbox.appendEventListener("change", (value) => {
    changes.nsfw = value
})

unlistedCheckbox.appendEventListener("change", (value) => {
    changes.unlisted = value
})

languageDropdown.appendEvent("change", (value) => {
    changes.mainLanguage = value
})

categoryDropdown.appendEvent("change", (value) => {
    changes.category = value
})

submitButton.addEventListener("click", async (event) => {
    if(Object.keys(changes).length == 0) {
        showToast("No changes have been made.")
        return
    }
    let response = await ajax(`/api/edit-server/${serverData.id}`, "POST", JSON.stringify(changes))
    if(response.status == 200) {
        window.location = "/"
    } else {
        showToast("A problem happened while trying to edit your server. Try again later.")
    }
})