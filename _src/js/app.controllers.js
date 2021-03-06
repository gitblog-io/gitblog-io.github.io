app.controller("IndexController", [
  "$scope", "$timeout", "$route", function($scope, $timeout, $route) {

    // create blog function
    return $scope.createBlog = function() {
      var newRepo, repo;
      $scope.$root.loading = true;
      $scope.$root.loadingText = "Forking sample repo...";
      repo = $scope.$root._gh.getRepo('gitblog-io', 'jekyll-bootstrap-for-fork');
      newRepo = $scope.$root._gh.getRepo($scope.username, 'jekyll-bootstrap-for-fork');
      repo.fork().then(function() {
        var t;
        $scope.$root.loadingText = "Checking if new repo is ready...";
        t = $timeout(function() {
          var caller;
          caller = arguments.callee;
          newRepo.getInfo().then(function() {
            $scope.$evalAsync(function() {
              return $scope.$root.loadingText = "Renaming the repo...";
            });
            newRepo.updateInfo({
              name: $scope.username + ".github.io"
            }).then(function() {
              $timeout.cancel(t);
              $scope.$root.loading = false;
              $scope.$root.loadingText = "Wait...";
              $scope.$root.reset();
            });
          }, function() {
            t = $timeout(caller, 5000);
          });
        }, 5000);
      }, function() {
        $scope.$root.loading = false;
        return window.logError('failed to fork');
      });
    };
  }
]).controller("AboutController", ["$scope", function($scope) {}]).controller("ListController", [
  "$scope", "$routeParams", "$location", function($scope, $routeParams, $location) {
    var reponame, username;
    username = $routeParams.user;
    reponame = $routeParams.repo;
    return $scope.blogListReady.then(function() {
      var _repo, repo;
      if (repo = $scope.getRepo(username, reponame)) {
        $scope.$root.loading = true;
        $scope.$root.loadingText = "Wait...";
        _repo = repo._repo;
        return _repo.git.getTree('master', {
          recursive: true
        }).then(function(tree) {
          var configFileExists, file, i, len, postReg, posts, res;
          $scope.saveCache();
          posts = [];
          configFileExists = false;
          postReg = /^(_posts)\/(?:[\w\.-]+\/)*(\d{4})-(\d{2})-(\d{2})-(.+?)\.(?:markdown|md)$/;
          for (i = 0, len = tree.length; i < len; i++) {
            file = tree[i];
            if (file.type !== 'blob') {
              continue;
            }
            if (res = file.path.match(postReg)) {
              posts.push({
                user: username,
                repo: reponame,
                type: res[1],
                date: new Date(parseInt(res[2], 10), parseInt(res[3], 10) - 1, parseInt(res[4], 10)),
                urlTitle: res[5],
                info: file
              });
            }
          }
          return $scope.$evalAsync(function() {
            $scope.posts = posts;
            $scope.reponame = reponame;
            $scope.username = username;
            return $scope.$root.loading = false;
          });
        });
      } else {
        window.logError("blog do not exist");
        return $location.path('/').replace();
      }
    });
  }
]).controller("PostController", [
  "$scope", "$routeParams", "$location", "$timeout", "uploader", function($scope, $routeParams, $location, $timeout, uploader) {
    var path, reponame, sha, username;
    username = $routeParams.user;
    reponame = $routeParams.repo;
    path = $routeParams.path;
    sha = $routeParams.sha;
    $scope.username = username;
    $scope.reponame = reponame;
    $scope.filepath = path;
    return $scope.blogListReady.then(function() {
      var _repo, deleteFunc, newPost, repo, save, searchAndShow, show;
      if (repo = $scope.getRepo(username, reponame)) {
        $scope.$root.loading = true;
        $scope.$root.loadingText = "Wait...";
        _repo = repo._repo;
        $scope.uploader = uploader.call($scope, _repo);
        save = function() {
          var branch, message, promise;
          $scope.$root.loading = true;
          $scope.$root.loadingText = "Saving...";
          branch = _repo.getBranch("master");
          message = "Update by gitblog.io at " + (new Date()).toLocaleString();
          promise = branch.write(path, $scope.post, message, false);
          promise.then(function(res) {
            return $scope.$evalAsync(function() {
              $scope.$root.loading = false;
              return $scope.postForm.$setPristine();
            });
          }, function(err) {
            $scope.$root.loading = false;
            return window.logError("save article failed");
          });
          return promise;
        };
        deleteFunc = function() {
          var branch, message, promise;
          if (window.confirm("Are you sure to delete " + $scope.filepath + "?")) {
            $scope.$root.loading = true;
            $scope.$root.loadingText = "Deleting...";
            branch = _repo.getBranch("master");
            message = "Update by gitblog.io at " + (new Date()).toLocaleString();
            promise = branch.remove(path, message);
            promise.then(function(res) {
              $scope.$evalAsync(function() {
                return $scope.$root.loadingText = "Redirecting to list...";
              });
              return $timeout(function() {
                return $location.path("/" + username + "/" + reponame).replace();
              }, 1500);
            }, function(err) {
              $scope.$root.loading = false;
              return window.logError("delete failed");
            });
            return promise;
          }
        };
        show = function() {
          return _repo.git.getBlob(sha).then(function(post) {
            $scope.saveCache();
            return $scope.$evalAsync(function() {
              $scope.$root.loading = false;
              $scope.post = post;
              $scope.save = save;
              return $scope["delete"] = deleteFunc;
            });
          }, function(err) {
            if (err.status === 404) {
              return searchAndShow();
            } else {
              $scope.$root.loading = false;
              return window.logError(err.error.toString());
            }
          });
        };
        searchAndShow = function() {
          return _repo.git.getTree('master', {
            recursive: true
          }).then(function(tree) {
            var blob;
            $scope.saveCache();
            blob = null;
            tree.some(function(file) {
              if (file.path === path) {
                blob = file;
                return true;
              }
              return false;
            });
            if (blob != null) {
              sha = blob.sha;
              return show();
            } else {
              $scope.$root.loading = false;
              return window.logError("file path not found");
            }
          });
        };
        newPost = "---\nlayout: post\ntitle:\ntagline:\ncategory: null\ntags: []\npublished: true\n---\n";
        if (sha == null) {
          if (path === "new") {
            $scope["new"] = true;
            $scope.$root.loading = false;
            $scope.post = newPost;
            return $scope.save = function() {
              var d, date, m, name, y;
              date = new Date();
              y = date.getFullYear();
              m = date.getMonth();
              m = m >= 10 ? m + 1 : "0" + (m + 1);
              d = date.getDate();
              d = d >= 10 ? d : "0" + d;
              name = $scope.frontMatter.title.replace(/\s/g, '-');
              path = "_posts/" + y + "-" + m + "-" + d + "-" + name + ".md";
              return save().then(function(res) {
                $scope.$evalAsync(function() {
                  $scope.$root.loading = true;
                  return $scope.$root.loadingText = "Redirecting to saved post..";
                });
                return $timeout(function() {
                  return $location.path("/" + username + "/" + reponame + "/" + path).replace();
                }, 2500);
              });
            };
          } else {
            return searchAndShow();
          }
        } else {
          return show();
        }
      } else {
        window.logError("blog do not exist");
        return $location.path('/').replace();
      }
    });
  }
]).controller("SignoutController", [
  "$scope", "storage", function($scope, storage) {
    storage.clearAll();
    $scope.clearCache();
    return window.location.replace('/');
  }
]);