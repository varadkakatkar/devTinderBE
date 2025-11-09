const adminAuth = (req, res, next) => {
    console.log("Admin auth getting is checked");
    const token = "XYZ";
    const isAdminAuthorized = token === "XYZ";
    if (!isAdminAuthorized) {
        res.status(401).send("Unauthorized Request");
    } else {
        next();
    }

}



const userAuth = (req, res, next) => {
    console.log("User auth getting is checked");
    const token = "XYZ";
    const isAdminAuthorized = token === "XYZ";
    if (!isAdminAuthorized) {
        res.status(401).send("Unauthorized Request");
    } else {
        next();
    }

}

module.exports = {
    adminAuth,
    userAuth
};