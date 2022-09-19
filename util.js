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


let fieldCheckers = {
    number(data, details) {
        if(typeof(data) != "number") {
            return false
        }
        let min = details.min || -Infinity
        let max = details.max || Infinity
        let canBeDecimal = details.canBeDecimal || true
        if(!canBeDecimal && Math.round(data) != data) {
            return false
        }
        if(data > max || data < min) {
            return false
        }
        return true
    },
    string(data, details) {
        if(typeof(data) != "string") {
            return false
        }
        let min = details.length || details.minLength || 0
        let max = details.length || details.maxLength || Infinity
        if(data.length < min || data.length > max) {
            return false
        }
        return true
    }
}

class Form {
    constructor() {
        this.fields = {}
        this.fieldCheckers = fieldCheckers
    }
    addField(name, type, details) {
        this.fields[name] = {
            type,
            details,
        }
        return this
    }
    check(form) {
        let formFieldsArray = Object.keys(form)
        let fieldsArray = Object.keys(this.fields)
        fieldsArray.forEach(field => {
            if(formFieldsArray.indexOf(field) == -1) {
                return false
            }
        })

        // first 
        for(let i = 0; i != fieldsArray.length; i++) {
            let fieldName = fieldsArray[i]
            let formField = form[fieldName]
            let field = this.fields[fieldName]
            let fieldChecker = this.fieldCheckers[field.type]
            let result = fieldChecker(formField, field.details)
            if(!result) {
                return false
            }
        }

        return true
    }
}

let reviewForm = new Form()
    .addField("rating", "number", { min: 1, max: 5, canBeDecimal: false })
    .addField("text", "string", { maxLength: 250 })
    .addField("serverId", "string", { length: 6 })


function compareObjects(object1, object2) {
    return JSON.stringify(object1) == JSON.stringify(object2)
}

const rateLimitedAccounts = {

}
function accountIsRateLimited(action, id) {
    if(rateLimitedAccounts[id] && rateLimitedAccounts[id].indexOf(action) != -1) {// is rate limited at something and at that action, it is rate limited
        return true
    }
    return false
}
function rateLimitAccount(action, id, ms) {
    rateLimitedAccounts[id] = rateLimitedAccounts[id] || []
    rateLimitedAccounts[id].push(action)
    setTimeout(function() {
        rateLimitedAccounts[id].filter(element => element != action)
    }, ms)
}
function createRateLimitAccountMiddleware(action, ms = 10000) {
    return function(req, res, next) {
        if(!accountIsRateLimited(action, req.user.id)) {
            rateLimitAccount(action, req.user.id, ms)
            next()
        } else {
            res.sendStatus(429)
        }
    }
}
let serverPostingRateLimitMiddleware = createRateLimitAccountMiddleware("post-server")

module.exports = {
    loggedIn,
    categoryIsValid,
    valueIs,
    randomNumber,
    generateId,
    mergeObjects,
    convertTimeFromMS,
    Form,
    reviewForm,
    compareObjects,
    accountIsRateLimited,
    rateLimitAccount,
    createRateLimitAccountMiddleware,
    serverPostingRateLimitMiddleware
}

