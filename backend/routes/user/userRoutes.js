const { register, login, logout, loadUser, bookTickets } = require("../../controllers/user/user")
const auth = require("../../utils/auth")

const router = require("express").Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout",logout)
router.get("/loaduser",auth,loadUser)
router.post("/bookticket",bookTickets)

module.exports = router