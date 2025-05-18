const isAdmin = (req, res, next) => {
    if (req.user.status === "Admin") {
        return next();
    }
    res.redirect(403, "/error");
}


module.exports = isAdmin;