angular.module "easyblog"

.controller "BlogListController", [
  "$scope"
  "$location"
  "$filter"
  "$q"
  ($scope, $location, $filter, $q)->
    jekyllFilter = $filter("jekyll")

    gh = $scope.$root._gh

    user = gh.getUser()

    $scope.repos = []

    userDefer = $q.defer()
    user.getInfo()
    .then (info)->
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
        $scope.$root.loading = false
      userDefer.resolve()
    , (err)->
      console.error err

    orgDefer = $q.defer()
    user.getOrgs()
    .then (orgs)->
      promises = []
      for org, index in orgs
        orgUser = gh.getUser(org.login)
        promise = orgUser.getRepos()
        promises.push promise
      $.when.apply @, promises
    , (err)->
      console.error err
    .then (resArrays...)->
      $scope.$apply ->
        for res in resArrays
          repos = jekyllFilter(res[0])
          for repo in repos
            repo._repo = gh.getRepo(repo.owner.login, repo.name)
          $scope.repos = $scope.repos.concat repos
        $scope.$root.loading = false
      orgDefer.resolve()
    , (err)->
      console.error err

    $scope.blogListReady = $q.all [userDefer.promise, orgDefer.promise]
    $scope.blogListReady
    .then ->
      $scope.getRepo = (username, reponame)->
        for repo in $scope.repos
          if repo.owner.login == username and repo.name == reponame
            return repo
        return null
    , (err)->
      console.error arguments

    # $scope.checkUsername = (username)->
    #   if $scope.$root.loading then return null
    #   if _.some $scope.userRepo.repos, (repo.)->
    #     if repo.
    #     return true
    #   else
    #     if _.some $scope.orgRepos, (orgRepo)->
    #       if orgRepo.user.login == username
    #         return true
    #       else
    #         return false

    return
]

.controller "IndexController", [->
  console.log "index"
]

.controller "ListController", [
  "$scope"
  "$routeParams"
  ($scope, $routeParams)->
    username = $routeParams.user
    reponame = $routeParams.repo
    if username? and reponame?
      $scope.blogListReady.then ->
        if repo = $scope.getRepo(username, reponame)
          _repo = repo._repo
          _repo.git.getTree('master', recursive:true)
          .then (tree)->
            posts = []
            configFileExists = false

            postReg = /^(_posts|_drafts)\/(?:[\w\.-]\/)*(\d{4})-(\d{2})-(\d{2})-([\w\.-]+?)\.md$/
            configFileReg = /^_config.yml$/
            for file in tree
              if file.type != 'blob' then continue
              if res = file.path.match postReg
                posts.push
                  user:username
                  repo:reponame
                  type:res[1]
                  date:new Date(parseInt(res[2], 10), parseInt(res[3], 10) - 1, parseInt(res[4], 10))
                  urlTitle:res[5]
                  info:file
              else if configFileReg.test file.path
                configFileExists = true

            if configFileExists
              $scope.$apply ->
                $scope.reponame = reponame
                $scope.blogList = posts

    console.log "list"
]

.controller "PostController", [
  "$scope"
  "$routeParams"
  ($scope, $routeParams)->
    username = $routeParams.user
    reponame = $routeParams.repo
    sha = $routeParams.sha
    if username? and reponame? and sha?
      $scope.blogListReady.then ->
        if repo = $scope.getRepo(username, reponame)
          _repo = repo._repo
          _repo.git.getBlob(sha)
          .then (post)->
            $scope.$apply ->
              $scope.post = post

    console.log "edit"
]