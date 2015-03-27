Package.describe({
  summary: "Login service for Trakt accounts",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use(['underscore', 'random']);
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use(['underscore', 'service-configuration'], ['client', 'server']);
  api.use(['random', 'templating'], 'client');

  api.addFiles(
      ['trakt_configure.html', 'trakt_configure.js'],
      'client');

  api.addFiles('trakt_server.js', 'server');
  api.addFiles('trakt_client.js', 'client');

  api.addFiles('trakt_login_button.css', 'client');

  api.addFiles("trakt.js");
});
