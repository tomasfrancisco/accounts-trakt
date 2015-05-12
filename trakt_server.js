Trakt = {};

// https://developers.trakt.com/accounts/docs/OAuth2Login#userinfocall
//Google.whitelistedFields = ['id', 'email', 'verified_email', 'name', 'given_name',
//                   'family_name', 'picture', 'locale', 'timezone', 'gender'];
Trakt.whitelistedFields = ['id', 'username', 'name', 'gender', 'picture', 'accessToken'];

OAuth.registerService('trakt', 2, null, function(query) {

  var response = getTokens(query);
  var accessToken = response.accessToken;
  //var idToken = response.idToken;
  var identity = getIdentity(accessToken);

    console.log(accessToken);

  var serviceData = {
    id: response.idToken,
    accessToken: accessToken,
    refreshToken: response.refreshToken,
    expiresAt: (+new Date) + (1000 * response.expiresIn)
  };


  var fields = _.pick(identity, Trakt.whitelistedFields);
  _.extend(serviceData, fields);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;


  return {
      serviceData: serviceData,
      options: {
          profile: {
              name: identity.data.user.name,
              username: identity.data.user.username,
              picture: identity.data.user.images.avatar.full,
              accessToken: accessToken
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

var getMovie = function(id) {
    try {
        var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
        if (!config)
            throw new ServiceConfiguration.ConfigError();

        var options = {
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': config.clientId
            }
        };

        return HTTP.get(
            'https://api-v2launch.trakt.tv/movies/' +
            id +
            "?extended=full",
            options);
    } catch (err) {
        throw _.extend(new Error("Failed to fetch movies from Trakt. " + err.message),
            {response: err.response});
    }
}


Trakt.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};

Meteor.methods({
    getWatched: function (username, type) {

        try {
            var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
            if (!config)
                throw new ServiceConfiguration.ConfigError();


            var options = {
                headers: {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': config.clientId
                }
            };


            return HTTP.get(
                "https://api-v2launch.trakt.tv/users" +
                "/" + username +
                "/watched" +
                "/" + type,
                options);

        } catch (err) {

            throw _.extend(new Error("Failed to fetch watched from Trakt. " + err.message),
                {response: err.response});
        }
    },

    getSettings: function(accessToken) {
        try {
            var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
            if (!config)
                throw new ServiceConfiguration.ConfigError();

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
            throw _.extend(new Error("Failed to fetch settings from Trakt. " + err.message),
                {response: err.response});
        }
    },

    getFriends: function(username) {
        try {
            var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
            if (!config)
                throw new ServiceConfiguration.ConfigError();

            var options = {
                headers: {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': config.clientId
                }
            };

            return HTTP.get(
                'https://api-v2launch.trakt.tv/users/' +
                username +
                '/following',
                options);
        } catch (err) {
            throw _.extend(new Error("Failed to fetch friends from Trakt. " + err.message),
                {response: err.response});
        }
    },

    getMovie: function(id) {
        try {
            var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
            if (!config)
                throw new ServiceConfiguration.ConfigError();

            var options = {
                headers: {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': config.clientId
                }
            };

            return HTTP.get(
                'https://api-v2launch.trakt.tv/movies/' +
                id +
                "?extended=full",
                options);
        } catch (err) {
            throw _.extend(new Error("Failed to fetch movie from Trakt. " + err.message),
                {response: err.response});
        }
    },

    getStats: function(username) {
        try {
            var config = ServiceConfiguration.configurations.findOne({service: 'trakt'});
            if (!config)
                throw new ServiceConfiguration.ConfigError();


            var options = {
                headers: {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': config.clientId
                }
            };


            return HTTP.get(
                "https://api-v2launch.trakt.tv/users" +
                "/" + username +
                "/stats",
                options);

        } catch (err) {

            throw _.extend(new Error("Failed to fetch stats from Trakt. " + err.message),
                {response: err.response});
        }
    },

    getStatsGenres: function(username) {

        var moviesStats = {};

        var watchedMovies = Meteor.call("getWatched", username, 'movies');
        var watchedMoviesTotal = 0;

        var watchedGenres = {};
        watchedMovies.data.forEach(function(entry) {
            var genres = Meteor.call("getMovie", entry.movie.ids.trakt).data.genres;
            console.log(genres);
            genres.forEach(function(genre) {
               if(watchedGenres[genre] === undefined) {
                   watchedGenres[genre] = 1;
               } else {
                   watchedGenres[genre] = watchedGenres[genre] + 1;
               }
                watchedMoviesTotal = watchedMoviesTotal + 1;
            });
        });

        console.log(watchedGenres);

        for(key in watchedGenres) {
            watchedGenres[key] = watchedGenres[key] / watchedMoviesTotal;
        }

        console.log(watchedGenres);
        return watchedGenres;
    }
});



