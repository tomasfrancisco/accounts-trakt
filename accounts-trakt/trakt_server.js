Trakt = {};

// https://developers.trakt.com/accounts/docs/OAuth2Login#userinfocall
//Google.whitelistedFields = ['id', 'email', 'verified_email', 'name', 'given_name',
//                   'family_name', 'picture', 'locale', 'timezone', 'gender'];


OAuth.registerService('trakt', 2, null, function(query) {

  var response = getTokens(query);
  var accessToken = response.accessToken;
  //var idToken = response.idToken;
  var identity = getIdentity(accessToken);

  console.log(accessToken);
  console.log(identity);

  var serviceData = {
    id: response.username,
    accessToken: accessToken,
    expiresAt: (+new Date) + (1000 * response.expiresIn)
  };

  //var fields = _.pick(identity, Google.whitelistedFields);
  //_.extend(serviceData, fields);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;

  return {
    serviceData: serviceData
    ,options: {
      profile: {
        name: identity.name
      }
    }
  };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
var getTokens = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://api-v2launch.trakt.tv/oauth/token", {params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('trakt', config),
        grant_type: 'authorization_code'
      }});
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Trakt. " + err.message),
                   {response: err.response});
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Trakt. " + response.data.error);
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      idToken: response.data.id_token
    };
  }
};

var getIdentity = function (accessToken) {
  try {
    var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
    if (!config)
      throw new ServiceConfiguration.ConfigError();
    //console.log(accessToken);
    //console.log(config.clientId);

    var options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
        'trakt-api-version': '2',
        'trakt-api-key': config.clientId
      },
      params: {
        access_token: accessToken
      }
    };

    return HTTP.get(
      "https://api-v2launch.trakt.tv/users/settings",
      options);
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Trakt. " + err.message),
                   {response: err.response});
  }
};


Trakt.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
