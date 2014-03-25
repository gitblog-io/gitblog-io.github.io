$("<div id=\"mask\" data-toggle-menu></div>").appendTo($("#main"))

$('[data-toggle-menu]')
.on 'click', ->
  $(document.body).toggleClass 'menu-open'
  return

$(document.body)
.on "click", "a", (e)->
  el = $(e.target).closest('a')
  target = el.attr "target"
  dest = el.attr "href"
  if (!target or target.toLowerCase() != "_blank") and dest?
    $(document.body).removeClass()
  return

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
      .when '/:user/:repo/:path*',
        templateUrl: 'templates/post.html'
        controller: 'PostController'
        reloadOnSearch: false
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