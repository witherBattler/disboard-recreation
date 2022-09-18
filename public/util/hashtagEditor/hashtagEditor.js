let addTag = document.getElementById("add-tag")
let writeTagName = document.getElementById("write-tag-name")
let writeTagNameInput = document.getElementById("write-tag-name-input")
let writeTagNameConfirm = document.getElementById("write-tag-name-confirm")
let tags = []

addTag.addEventListener("click", (event) => {
    writeTagName.style.display = "flex"
    writeTagName.style.top = addTag.offsetTop + addTag.offsetHeight + 10 + "px"
    writeTagName.style.left = addTag.offsetLeft + "px"
    writeTagNameInput.focus()
})

writeTagNameConfirm.addEventListener("click", (event) => {
    confirmTagNameWrite()
})
function confirmTagNameWrite() {
    let tagName = writeTagNameInput.value
    if(tags.indexOf(tagName) != -1) {
        showToast("Tag already exists.")
        return
    }
    writeTagNameInput.value = ""
    let tag = document.createElement("hashtag-renderer")
    tag.setAttribute("name", tagName)
    writeTagName.style.display = "none"
    tagsContainer.appendChild(tag)
    tag.appendEventListener("remove", (event) => {
        tags.splice(tags.indexOf(tag), 1)
    })

    tags.push(tagName)
    tag.appendEventListener("remove", (event) => {
        tags.splice(tags.indexOf(tagName), 1)
    })
}
writeTagNameInput.addEventListener("keydown", (event) => {
    if(event.key == "Enter") {
        confirmTagNameWrite()
    }
})

document.body.addEventListener("mousedown", (event) => {
    if(writeTagNameConfirm.matches(":hover")) {
        return
    }
    writeTagNameInput.value = ""
    writeTagName.style.display = "none"
})