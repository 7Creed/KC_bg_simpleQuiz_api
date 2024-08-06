const rolesAllowed = (roles) => {
  return (req, res, next) => {
    try {
      // Ensure req.userDetails and req.userDetails.role exist
      if (!req.userDetails || !req.userDetails.role) {
        return res.status(403).send({
          message: "User details are missing or incomplete",
        });
      }

      // Check if the user's role is allowed
      if (roles.includes(req.userDetails.role)) {
        next();
      } else {
        res.status(403).send({
          message: "Your role can't access this route",
        });
      }
    } catch (error) {
      console.error("Error in rolesAllowed middleware:", error);
      res.status(500).send({
        message: "Internal server error",
      });
    }
  };
};

module.exports = rolesAllowed;
