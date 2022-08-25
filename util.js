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

function mergeObjects(object1, object2) {
    return {...object1, ...object2}
}


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
    console.log(time)
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

module.exports = {
    loggedIn,
    categoryIsValid,
    valueIs,
    randomNumber,
    generateId,
    mergeObjects,
    convertTimeFromMS
}