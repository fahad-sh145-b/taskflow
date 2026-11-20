const User = require('./models/user');

const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "Authentication required",
                });
            }

            let userRole = req.user.role;

            // If token has no role or didn't match, verify directly against the database
            if (!userRole || !allowedRoles.includes(userRole)) {
                const userId = req.user._id || req.user.id;
                if (userId) {
                    const userDoc = await User.findById(userId);
                    if (userDoc) {
                        userRole = userDoc.role;
                        req.user.role = userRole;
                    }
                }
            }

            // Admins and root owner always have full access
            if (userRole === "admin" || req.user.email === "shaikhbashiruddinmohdhajishaik@gmail.com") {
                return next();
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    message: "Access denied. Insufficient permissions",
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
};

module.exports = authorizeRoles;
