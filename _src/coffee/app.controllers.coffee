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

        $scope.userRepos = {}
        userDefer = user.getInfo()
        .then (info)->
          console.log info
          # $scope.$root.username = info.login
          $scope.userRepos.username= info.login
          user.getRepos()
        , (err)->
          console.error err
        .then (repos)->
          $scope.userRepos.repos = repos
        , (err)->
          console.error err

        $scope.orgRepos = []
        orgDefer = user.getOrgs()
        .then (orgs)->
          $scope.orgs = []
          for org, index in orgs
            $scope.orgRepos.push
              username: org.login
            orgUser = gh.getUser(org.login)
            orgUser.getRepos()
            .then ((index)->
              (repos)->
                $scope.orgRepos[index].repos = repos
            )(index)
            , (err)->
              console.error err
          return
        , (err)->
          console.error err

    return

]