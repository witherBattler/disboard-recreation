class BetterCheckbox extends HTMLElement {
    constructor() {
        super()
        this.events = {
            change: []
        }
        this.checked = false
    }
    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" })
        
        let container = document.createElement("button")
        container.setAttribute("style", "padding: 0px; background-color: transparent; border: 3px solid white; border-radius: 5px; width: 25px; height: 25px; background-repeat: no-repeat; background-position: center; background-size: contain; cursor: pointer;")
        let listenedElement = 
            document.getElementById(this.getAttribute("listen-for-clicks")) ||
            container
            listenedElement.addEventListener("click", () => {
            this.checked = !this.checked
            this.events.change.forEach(event => event(this.checked))
            if(this.checked) {
                container.style.backgroundImage = "url(icons/checkMark.svg)"
            } else {
                container.style.backgroundImage = null
            }
        })

        shadow.appendChild(container)
    }
    appendEventListener(event, callback) {
        this.events[event].push(callback)
    }
}

customElements.define("better-checkbox", BetterCheckbox)