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

nsfwCheckbox.appendEventListener("change", (value) => {
    changes.nsfw = value
})

unlistedCheckbox.appendEventListener("change", (value) => {
    changes.unlisted = value
})

languageDropdown.appendEventListener("change", (value) => {
    changes.mainLanguage = value
})

categoryDropdown.appendEventListener("change", (value) => {
    changes.category = value
})
/* 
submitButton.addEventListener("click", async (event) => {
    let response = await ajax(`/api/edit-server/${serverData.id}`, JSON.stringify({

    }))
}) */