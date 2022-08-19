class HashtagRenderer extends HTMLElement {
    constructor() {
        super()
        this.events = {
            remove: []
        }
    }
    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" })
        
        let style = document.createElement("link")
        style.setAttribute("rel", "stylesheet")
        style.setAttribute("href", "util/hashtagRenderer/hashtagRenderer.css")
        
        let container = document.createElement("button")
        container.setAttribute("class", "container")
        container.addEventListener("click", (event) => {
            this.events.remove.forEach(event => event())
            this.remove()
        })

        let label = document.createElement("div")
        label.setAttribute("class", "label")
        label.innerText = "#" + this.getAttribute("name")
        
        let removeButton = document.createElement("p")
        removeButton.setAttribute("class", "remove")
        removeButton.innerHTML = "&times;"
        

        container.appendChild(label)
        container.appendChild(removeButton)
        shadow.appendChild(style)
        shadow.appendChild(container)
    }
    appendEventListener(event, callback) {
        this.events[event].push(callback)
    }
}

customElements.define("hashtag-renderer", HashtagRenderer)