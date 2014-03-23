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
            .then ((index, username)->
              (repos)->
                $scope.orgRepos[index].repos = repos
            )(index, org.login)
            , (err)->
              console.error err
          return
        , (err)->
          console.error err

        $.when.apply window, [repoDefer, userDefer, orgDefer]
        .then (sth)->
          console.log arguments
        , (err)->
          console.error arguments
    else
      window.location.replace('/');

    return
]