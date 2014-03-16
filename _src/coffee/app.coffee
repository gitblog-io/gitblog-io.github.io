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
      .when '/auth',
        templateUrl: 'templates/auth.html'
        controller: 'AuthController'
        reloadOnSearch: false
      .when '/:user/:repo/:filepath',
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
  ($rootScope)->
    $rootScope.loading = true
    $rootScope.progressText = 'Loading...'
    return
]