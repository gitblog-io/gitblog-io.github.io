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

    $scope.loading = true
    $scope.progressText = 'Authenticating...'

    if error?
      console.error errorDescription

    else if code? and remoteState? and localState?
      if remoteState is localState
        $http.get "https://easyblog-oauth.herokuapp.com/authenticate/" + code
          .success (data)->
            if data.token?
              storage.set 'access_token', data.token
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
  "storage"
  ($scope, storage)->
    token = storage.get 'access_token'
    if token?
      $scope.$root.loading = false
      window.alert "auth ok"
]