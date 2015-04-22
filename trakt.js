Accounts.oauth.registerService('trakt');

if (Meteor.isClient) {
    Meteor.loginWithTrakt = function(options, callback) {
    // support a callback without options
    if (! callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Trakt.requestCredential(options, credentialRequestCompleteCallback);
    };

    Meteor.methods({
        'getTrakt' : function(token, username, type) {
            console.log(Trakt.getWatched(token, username, type));
            return;
        }
    })
} else {
  Accounts.addAutopublishFields({
    //forLoggedInUser: _.map(
    // publish access token since it can be used from the client (if
    // transmitted over ssl or on
    // localhost). https://developers.trakt.com/accounts/docs/OAuth2UserAgent
    // refresh token probably shouldn't be sent down.
    //Trakt.whitelistedFields.concat(['accessToken', 'expiresAt']), // don't publish refresh token
    //function (subfield) { return 'services.trakt' + subfield; }),

    //forOtherUsers: _.map(
    // even with autopublish, no legitimate web app should be
    // publishing all users' emails
    //_.without(Trakt.whitelistedFields, 'email', 'verified_email'),
    //function (subfield) { return 'services.trakt.' + subfield; })
    //}

    forLoggedInUser: _.map(
        Trakt.whitelistedFields.concat(['accessToken', 'expiresAt']), // don't publish refresh token
        function (subfield) { return 'services.trakt.' + subfield; }),
    forOtherUsers: []
  });
}
