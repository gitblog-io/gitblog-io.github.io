angular.module "easyblog"

.controller "AuthController", [
  "$routeParams"
  "$scope"
  "$location"
  "$http"
  "storage"
  ($routeParams, $scope, $location, $http, storage)->
    code = $routeParams.code
    remoteState = $routeParams.state
    error = $routeParams.error
    errorDescription = $routeParams.error_description
    errorURI = $routeParams.error_uri

    localState = sessionStorage.getItem('state')

    $scope.$root.loading = true
    $scope.$root.progressText = 'Authenticating...'

    if error?
      console.error errorDescription

    else if code? and remoteState? and localState?
      if remoteState is localState
        $http.get "https://easyblog-oauth.herokuapp.com/authenticate/" + code
          .success (data)->
            if data.token?
              $scope.$root.token = data.token
              $location
                .search('code', null)
                .search('state', null)
                .path( "/" )
                .replace()

            else
              console.error "token error"
          .error (data, status, headers, config)->
            console.error "token " + status

      else
        console.error "state mismatch"

    else
      console.error "auth error"

]

.controller "IndexController", [
  "$scope"
  "$location"
  ($scope, $location)->
    if $scope.token != ""
      # $scope.$root.loading = false
      if $scope.username != "" and $scope.reponame != ""
        $location.path( $scope.username + '/' + $scope.reponame)

      else
        gh = new Octokit( token:$scope.token )

        user = gh.getUser()

        names = []

        repoDefer = user.getRepos()
        .then (repos)->
          console.log repos

          repos

        , (err)->
          console.error err

        userDefer = user.getInfo()
        .then (info)->
          console.log info
          # $scope.$root.username = info.login
          names.push info.login

          info
        , (err)->
          console.error err

        orgDefer = user.getOrgs()
        .then (orgs)->
          console.log orgs
          for org in orgs
            names.push

          orgs
        , (err)->
          console.error err

        $.when.apply window, [repoDefer, userDefer, orgDefer]
        .then (sth)->
          console.log arguments
        , (err)->
          console.error arguments


]