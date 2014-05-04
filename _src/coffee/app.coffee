$("<div id=\"mask\" data-toggle-menu></div>").appendTo($(document.body))

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

angular.module "gitblog", [
  'ngRoute'
  'ngAnimate'
  'angularLocalStorage'
  'unsavedChanges'
  'gitblog.templates'
]

.config [
  '$routeProvider'
  '$locationProvider'
  ($routeProvider, $locationProvider)->
    $locationProvider.hashPrefix('!')
    $routeProvider
      .when '/about',
        templateUrl: 'templates/about.html'
        controller: 'AboutController'
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
  "$location"
  "$filter"
  "$q"
  ($scope, storage, $location, $filter, $q)->
    $(document.documentElement)
    .removeClass("nojs")
    .addClass("domready")

    $scope.loading = true
    $scope.loadingText = 'Wait...'

    $scope.token = storage.get 'token'
    $scope.reponame = storage.get 'reponame'

    try
      $scope.cache = storage.get 'cache'
    catch
      $scope.cache = null

    storage.bind $scope, 'token'
    storage.bind $scope, 'reponame'
    storage.bind $scope, 'cache'

    if $scope.token != ""
      jekyllFilter = $filter("jekyll")

      $scope._gh = gh = new Octokit( token:$scope.token )

      if $scope.cache != "" then gh.setCache($scope.cache)

      $scope.saveCache = ->
        $scope.cache = $scope._gh.getCache()
      $scope.clearCache = ->
        $scope.cache = null

      $scope.repos = []

      user = gh.getUser()

      userDefer = $q.defer()
      user.getInfo()
      .then (info)->
        $scope.$apply ->
          $scope.username = info.login
        user.getRepos()
      , (err)->
        console.error err
      .then (repos)->
        repos = jekyllFilter(repos)
        for repo in repos
          repo._repo = gh.getRepo(repo.owner.login, repo.name)
        $scope.$apply ->
          $scope.repos = $scope.repos.concat repos
        userDefer.resolve()
      , (err)->
        console.error err

      orgDefer = $q.defer()
      user.getOrgs()
      .then (orgs)->
        promises = []
        for org, index in orgs
          orgUser = gh.getOrg(org.login)
          promise = orgUser.getRepos()
          promises.push promise
        $q.all promises
      , (err)->
        console.error err
      .then (resArrays)->
        $scope.$apply ->
          for res in resArrays
            repos = jekyllFilter(res)
            for repo in repos
              repo._repo = gh.getRepo(repo.owner.login, repo.name)
            $scope.repos = $scope.repos.concat repos
        orgDefer.resolve()
      , (err)->
        console.error err

      $scope.blogListReady = $q.all [userDefer.promise, orgDefer.promise]
      $scope.blogListReady
      .then ->
        $scope.saveCache()

        $scope.getRepo = (username, reponame)->
          for repo in $scope.repos
            if repo.owner.login == username and repo.name == reponame
              return repo
          return null
      , (err)->
        console.error arguments

    else
      window.location.replace('/');

    return
]