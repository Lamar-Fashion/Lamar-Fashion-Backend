'use strict';

// export permissions middleware
module.exports = (capability) => {
  return (req, res, next) => {
    try {
      // check if the client has the permission to do this thing or not
      if (req.user.capabilities.includes(capability)) {
        next();
      } else {
        console.error("ERROR - Access Denied");
        next('Access Denied');
      }
    } catch (e) {
      console.error("ERROR - something wrong: ", e);
      next('something wrong!');
    }
  };
};
