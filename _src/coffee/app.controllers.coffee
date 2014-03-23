angular.module "easyblog"

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
    else
      window.location.replace('/');
]