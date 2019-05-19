var ids = {
    //load secrets and ids from environment...
    google: {
        clientID: process.env.GClientId,
        clientSecret: process.env.GClientSecret,
        callbackURL: process.env.GClientCallbackUrl
    }
  };
  
  module.exports = ids;