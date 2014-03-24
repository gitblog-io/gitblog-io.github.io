angular.module "easyblog", [
  'ngRoute'
  'angularLocalStorage'
  'easyblog.templates'
]

.config [
  '$routeProvider'
  '$locationProvider'
  ($routeProvider, $locationProvider)->
    $locationProvider.hashPrefix('!')
    $routeProvider
      .when '/:user/:repo/:sha',
        templateUrl: 'templates/editor.html'
        controller: 'EditorController'
      .when '/:user/:repo',
        templateUrl: 'templates/list.html'
        controller: 'ListController'
      .when '/',
        templateUrl: 'templates/index.html'
        controller: 'IndexController'
      .otherwise
        redirectTo: '/'
    return
]

.run [
  '$rootScope'
  'storage'
  ($rootScope, storage)->
    $rootScope.loading = true
    $rootScope.progressText = 'Loading...'

    $rootScope.token = storage.get 'token'
    $rootScope.reponame = storage.get 'reponame'

    storage.bind $rootScope, 'token'
    storage.bind $rootScope, 'reponame'

    if $rootScope.token != ""
      $rootScope._gh = new Octokit( token:$rootScope.token )
    else
      window.location.replace('/');

    return
]