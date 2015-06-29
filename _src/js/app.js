$("<div id=\"mask\" data-toggle-menu></div>").appendTo($(document.body));

$('[data-toggle-menu]').on('click', function() {
  $(document.body).toggleClass('menu-open');
});

$(document.body).on("click", "a", function(e) {
  var dest, el, target;
  el = $(e.target).closest('a');
  target = el.attr("target");
  dest = el.attr("href");
  if ((!target || target.toLowerCase() !== "_blank") && (dest != null)) {
    $(document.body).removeClass();
  }
});

window.logError = function(errorMsg, url, lineNumber) {
  if (typeof ga === "function") {
    ga('send', 'event', "Global", "Exception", url + "(" + lineNumber + "): " + errorMsg);
  }
  if ((url == null) && (lineNumber == null)) {
    console.error(errorMsg);
    alert(errorMsg);
  }
};

$(window).on('error', function(e) {
  return window.logError(e.originalEvent.message, e.originalEvent.filename, e.originalEvent.lineno);
});

angular.module("gitblog", ['ngRoute', 'ngAnimate', 'angularLocalStorage', 'unsavedChanges', 'gitblog.templates']).config([
  '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.when('/about', {
      templateUrl: 'templates/about.html',
      controller: 'AboutController'
    }).when('/:user/:repo/:path*', {
      templateUrl: 'templates/post.html',
      controller: 'PostController',
      reloadOnSearch: false
    }).when('/:user/:repo', {
      templateUrl: 'templates/list.html',
      controller: 'ListController'
    }).when('/', {
      templateUrl: 'templates/index.html',
      controller: 'IndexController'
    }).when('/signout', {
      templateUrl: 'templates/blank.html',
      controller: 'SignoutController'
    }).otherwise({
      redirectTo: '/'
    });
  }
]).run([
  '$rootScope', 'storage', "$location", "$filter", "$q", function($scope, storage, $location, $filter, $q) {
    var gh, jekyllFilter;
    $(document.documentElement).removeClass("nojs").addClass("domready");
    $scope.loading = true;
    $scope.loadingText = 'Wait...';
    $scope.token = storage.get('token');
    $scope.reponame = storage.get('reponame');
    storage.bind($scope, 'token');
    storage.bind($scope, 'reponame');
    if ($scope.token !== "") {
      jekyllFilter = $filter("jekyll");
      $scope._gh = gh = new Octokit({
        token: $scope.token
      });
      try {
        gh.setCache(JSON.parse(sessionStorage.getItem('cache')) || {});
      } catch (_error) {
        sessionStorage.removeItem('cache');
      }
      $scope.saveCache = function() {
        return sessionStorage.setItem('cache', JSON.stringify($scope._gh.getCache()));
      };
      $scope.clearCache = function() {
        return sessionStorage.removeItem('cache');
      };
      $scope.reset = function() {
        var orgDefer, user, userDefer;
        $scope.repos = [];
        user = gh.getUser();
        userDefer = $q.defer();
        user.getInfo().then(function(info) {
          $scope.$evalAsync(function() {
            return $scope.username = info.login;
          });
          return user.getRepos();
        }, function(err) {
          return window.logError("get user info failed");
        }).then(function(repos) {
          var i, len, repo;
          repos = jekyllFilter(repos);
          for (i = 0, len = repos.length; i < len; i++) {
            repo = repos[i];
            repo._repo = gh.getRepo(repo.owner.login, repo.name);
          }
          $scope.$evalAsync(function() {
            return $scope.repos = $scope.repos.concat(repos);
          });
          return userDefer.resolve();
        }, function(err) {
          return window.logError("get user repo failed");
        });
        orgDefer = $q.defer();
        user.getOrgs().then(function(orgs) {
          var i, index, len, org, orgUser, promise, promises;
          promises = [];
          for (index = i = 0, len = orgs.length; i < len; index = ++i) {
            org = orgs[index];
            orgUser = gh.getOrg(org.login);
            promise = orgUser.getRepos();
            promises.push(promise);
          }
          return $q.all(promises);
        }, function(err) {
          return window.logError("get org info failed");
        }).then(function(resArrays) {
          $scope.$evalAsync(function() {
            var i, j, len, len1, repo, repos, res, results;
            results = [];
            for (i = 0, len = resArrays.length; i < len; i++) {
              res = resArrays[i];
              repos = jekyllFilter(res);
              for (j = 0, len1 = repos.length; j < len1; j++) {
                repo = repos[j];
                repo._repo = gh.getRepo(repo.owner.login, repo.name);
              }
              results.push($scope.repos = $scope.repos.concat(repos));
            }
            return results;
          });
          return orgDefer.resolve();
        }, function(err) {
          return window.logError("get org repo failed");
        });
        $scope.blogListReady = $q.all([userDefer.promise, orgDefer.promise]);
        return $scope.blogListReady.then(function() {
          $scope.$evalAsync(function() {
            return $scope.loading = false;
          });
          $scope.saveCache();
          return $scope.getRepo = function(username, reponame) {
            var i, len, ref, repo;
            ref = $scope.repos;
            for (i = 0, len = ref.length; i < len; i++) {
              repo = ref[i];
              if (repo.owner.login === username && repo.name === reponame) {
                return repo;
              }
            }
            return null;
          };
        }, function(err) {
          $scope.loading = false;
          return window.logError("get blog list failed");
        });
      };
      $scope.reset();
    } else {
      window.location.replace('/');
    }
  }
]);