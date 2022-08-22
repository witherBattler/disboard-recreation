function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/")
}

function categoryIsValid(category) {
    return valueIs(category, "Community", "Gaming", "Anime - Manga", "Music", "Technology", "Language", "Movies", "Media", "Programming", "Other")
}

function valueIs(value1, ...values) {
    for (let value of values) {
        if (value == value1) {
            return true
        }
    }
    return false
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

let idChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
function generateId(length) {
    let id = ""
    for(let i = 0; i != length; i++) {
        id += idChars[randomNumber(0, idChars.length - 1)]
    }
    return id
}
module.exports = {
    loggedIn,
    categoryIsValid,
    valueIs,
    randomNumber,
    generateId
}