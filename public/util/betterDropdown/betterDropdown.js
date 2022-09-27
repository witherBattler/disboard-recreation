class BetterDropdown extends HTMLElement {
    constructor() {
        super()
        this.events = {
            change: []
        }
        this.disabled = false
        this.selectedIndex = 0
        this.selected = null
    }
    connectedCallback() {
        let options = this.options
        this.selected = options[0]
        let special = this.getAttribute("special")

        let shadow = this.attachShadow({ mode: "open" })
        let style = document.createElement("link")
        style.setAttribute("rel", "stylesheet")
        style.setAttribute("href", "util/betterDropdown/betterDropdown.css")
        shadow.appendChild(style)

        let dropdown = document.createElement("div")
        dropdown.setAttribute("style", this.getAttribute("style"))
        dropdown.setAttribute("class", "dropdown")
        dropdown.style.width = this.getAttribute("width") || "100%"
        dropdown.style.fontSize = this.getAttribute("font-size") || "25px"
        dropdown.addEventListener("click", () => {
            if(this.disabled) return
            if(dropdownOptions.style.height == this.dropdownOptionsHeight + "px") {
                dropdownOptions.style.height = "0px"
                dropdownOptions.style.opacity = "0"
                dropdownIcon.style.transform = "rotate(0deg)"
            } else {
                dropdownOptions.style.height = this.dropdownOptionsHeight + "px"
                dropdownOptions.style.opacity = "1"
                dropdownIcon.style.transform = "rotate(180deg)"
            }
        })
        window.addEventListener("mousedown", (event) => {
            if(dropdown.matches(":hover") || dropdownOptions.matches(":hover")) {
                return
            }
            dropdownOptions.style.height = "0px"
            dropdownOptions.style.opacity = "0"
            dropdownIcon.style.transform = "rotate(0deg)"
        })

        let dropdownLabel = document.createElement("div")
        dropdownLabel.setAttribute("class", "dropdownLabel")
        dropdownLabel.innerText = this.getAttribute("selected") || options[0]
        this.dropdownLabel = dropdownLabel

        let dropdownIconContainer = document.createElement("div")
        dropdownIconContainer.setAttribute("class", "dropdownIconContainer")

        let dropdownIcon = document.createElement("img")
        dropdownIcon.setAttribute("class", "dropdownIcon")
        dropdownIcon.src = "icons/dropdownTriangle.svg"
        this.dropdownIcon = dropdownIcon

        this.dropdownOptionsHeight = 0
        let dropdownOptions = document.createElement("div")
        dropdownOptions.setAttribute("style", this.getAttribute("style"))
        dropdownOptions.style.width = this.getAttribute("width") || "100%"
        dropdownOptions.style.fontSize = this.getAttribute("font-size") || "25px"
        for (let i = 0; i < options.length; i++) {
            let option = document.createElement("div")
            option.setAttribute("class", "dropdownOption")

            option.innerText = options[i]
            if(special == "font") {
                option.style.fontFamily = options[i]
            }
            option.addEventListener("click", () => {
                this.selectedIndex = i
                this.selected = options[i]
                dropdownLabel.innerText = options[i]
                dropdownOptions.style.height = "0"
                dropdownOptions.style.opacity = "0"
                dropdownIcon.style.transform = "rotate(0deg)"
                this.events.change.forEach(callback => callback(options[i]))
            })
            dropdownOptions.appendChild(option)
        }
        let borderRadius = this.getAttribute("border-radius")
        if(borderRadius == "left") {
            dropdown.style.borderTopLeftRadius = "5px"
            dropdown.style.borderBottomLeftRadius = "5px"
        }
        dropdownOptions.setAttribute("class", "dropdownOptions")
        this.dropdownOptionsHeight = options.length * 34 + 8
        this.dropdownOptionsElement = dropdownOptions

        dropdownIconContainer.appendChild(dropdownIcon)
        dropdown.appendChild(dropdownLabel)
        dropdown.appendChild(dropdownIconContainer)
        shadow.appendChild(style)
        shadow.appendChild(dropdown)
        shadow.appendChild(dropdownOptions)
    }
    get options() {
        return this.getAttribute("options").split(",")
    }
    setOptions(optionsArray) {
        this.selectedIndex = 0
        this.selected = optionsArray[0]

        this.dropdownLabel.innerText = optionsArray[0]
        this.setAttribute("options", optionsArray.join(","))

        let dropdownOptions = this.dropdownOptionsElement
        dropdownOptions.innerHTML = ""
        for (let i = 0; i < optionsArray.length; i++) {
            let option = document.createElement("div")
            option.setAttribute("class", "dropdownOption")
            option.innerText = optionsArray[i]
            option.addEventListener("click", () => {
                this.selectedIndex = i
                this.selected = optionsArray[i]
                this.dropdownLabel.innerText = optionsArray[i]
                dropdownOptions.style.height = "0"
                dropdownOptions.style.opacity = "0"
                this.dropdownIcon.style.transform = "rotate(0deg)"
                this.events.change.forEach(callback => callback(optionsArray[i]))
            })
            dropdownOptions.appendChild(option)
        }
        this.dropdownOptionsHeight = optionsArray.length * 34 + 8
    }
    appendEvent(event, callback) {
        this.events[event].push(callback)
    }
    set font(fontName) {
        this.dropdownLabel.style.fontFamily = fontName
    }
    setSelected(index) {
        this.selected = this.options[index]
        this.dropdownLabel.innerText = this.selected
        this.selectedIndex = index
    }
}

customElements.define('better-dropdown', BetterDropdown)