let toast = document.getElementById("toast")

    function showToast(message) {
        toast.style.top = "30px"
        toast.textContent = message
        setTimeout(function() {
            toast.style.top = "-70px"
        }, 3000)
    }