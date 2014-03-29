angular.module "easyblog"

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
            $scope.saveCache()

            posts = []
            configFileExists = false

            postReg = /^(_posts|_drafts)\/(?:[\w\.-]+\/)*(\d{4})-(\d{2})-(\d{2})-(.+?)\.md$/
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
                $scope.posts = posts

    console.log "list"
]

.controller "PostController", [
  "$scope"
  "$routeParams"
  "$location"
  ($scope, $routeParams, $location)->
    username = $routeParams.user
    reponame = $routeParams.repo
    path = $routeParams.path
    sha = $routeParams.sha
    if username? and reponame? and path?
      $scope.blogListReady.then ->
        if repo = $scope.getRepo(username, reponame)
          _repo = repo._repo

          show = ->
            _repo.git.getBlob(sha)
            .then (post)->
              $scope.saveCache()

              $scope.$apply ->
                $scope.post = post
            , (err)->
              if err.status == 404
                searchAndShow()
              else
                console.error err.error

          searchAndShow = ->
            _repo.git.getTree('master', recursive:true)
            .then (tree)->
              $scope.saveCache()

              blob = _.findWhere tree,
                path: path
              if blob?
                sha = blob.sha
                $location.search('sha', sha)
                show()
              else
                console.error "file path not found"

          unless sha?
            searchAndShow()
          else
            show()



    console.log "edit"
]