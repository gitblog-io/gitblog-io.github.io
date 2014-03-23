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
  'storage'
  ($rootScope, storage)->
    $rootScope.loading = true
    $rootScope.progressText = 'Loading...'

    $rootScope.token = storage.get 'token'
    $rootScope.username = storage.get 'username'
    $rootScope.reponame = storage.get 'reponame'
    $rootScope.listContent = storage.get 'listContent'
    $rootScope.listTime = storage.get 'listTime'
    $rootScope.draftContent = storage.get 'draftContent'
    $rootScope.draftPath = storage.get 'draftPath'
    $rootScope.draftTime = storage.get 'draftTime'

    storage.bind $rootScope, 'token'
    storage.bind $rootScope, 'username'
    storage.bind $rootScope, 'reponame'
    storage.bind $rootScope, 'listContent'
    storage.bind $rootScope, 'listTime'
    storage.bind $rootScope, 'draftContent'
    storage.bind $rootScope, 'draftPath'
    storage.bind $rootScope, 'draftTime'

    return
]