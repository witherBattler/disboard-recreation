const router = require("express").Router()
const passport = require("passport")

router.get("/", passport.authenticate("discord"), (req, res) => {
    res.send(200)
})
router.get("/redirect", passport.authenticate("discord", {
    failureRedirect: "/forbidden",
}), (req, res) => {
    res.redirect("/dashboard")
})


module.exports = router;