Trakt = {};

// Request Google credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Trakt.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }

  var credentialToken = Random.secret();

  // always need this to get user id from trakt.
  //var requiredScope = ['profile'];
  //var scope = ['email'];
  //if (options.requestPermissions)
  //  scope = options.requestPermissions;
  //scope = _.union(scope, requiredScope);
  //var flatScope = _.map(scope, encodeURIComponent).join('+');

  // https://developers.trakt.com/accounts/docs/OAuth2WebServer#formingtheurl
  //var accessType = options.requestOfflineToken ? 'offline' : 'online';
  //var approvalPrompt = options.forceApprovalPrompt ? 'force' : 'auto';

  var loginStyle = OAuth._loginStyle('trakt', config, options);

  var loginUrl =
        'https://trakt.tv/oauth/authorize' +
        '?response_type=code' +
        '&client_id=' + config.clientId +
        '&redirect_uri=' + OAuth._redirectUri('trakt', config) +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken);

  // Use Google's domain-specific login page if we want to restrict creation to
  // a particular email domain. (Don't use it if restrictCreationByEmailDomain
  // is a function.) Note that all this does is change Google's UI ---
  // accounts-base/accounts_server.js still checks server-side that the server
  // has the proper email address after the OAuth conversation.
  //if (typeof Accounts._options.restrictCreationByEmailDomain === 'string') {
  //  loginUrl += '&hd=' + encodeURIComponent(Accounts._options.restrictCreationByEmailDomain);
  //}

  OAuth.launchLogin({
    loginService: "trakt",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: { height: 600 }
  });
};





