const router = require("express").Router()
const passport = require("passport")

router.get("/", passport.authenticate("discord"))
router.get("/redirect", passport.authenticate("discord", {
    failureRedirect: "/forbidden",
}), (req, res) => {
    res.send("You are logged in")
})

module.exports = router;