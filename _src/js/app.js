(function(){
  // 一些初始化DOM和绑定事件的操作
  var bodyElement = angular.element(document.body),
      btnMenuElement = angular.element(window.document.getElementById('btn-open-menu'));
  
  bodyElement.append("<div id=\"mask\" data-toggle-menu></div>");

  btnMenuElement.on('click', function() {
    bodyElement.toggleClass('menu-open');

    var targetElement = e.target;
    if (targetElement.tagName === 'A') {
      if ((!targetElement || targetElement.href.toLowerCase() !== "_blank") && (targetElement.href != null)) {
        bodyElement.removeClass();
      }
    };
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

  window.addEventListener('error', function(e) {
    return window.logError(e.originalEvent.message, e.originalEvent.filename, e.originalEvent.lineno);
  });
})();


// app是全局模块，代表整个APP
var app = angular.module("gitblog", ['ngRoute', 'ngAnimate', 'angularLocalStorage', 'unsavedChanges', 'gitblog.templates']);

// 绑定路由
app.config([
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
])
// 加载完module的依赖之后，初始化
.run([
  '$rootScope', 'storage', "$filter", "$q", function($scope, storage, $filter, $q) {
    var gh, jekyllFilter;
    angular.element(document.documentElement).removeClass("nojs").addClass("domready");

    // 设置$scope的初始状态
    $scope.loading = true;
    $scope.loadingText = 'Wait...';

    // 读取localStorage
    $scope.token = storage.get('token');
    $scope.reponame = storage.get('reponame');
    storage.bind($scope, 'token');
    storage.bind($scope, 'reponame');

    if ($scope.token !== "") {
      jekyllFilter = $filter("jekyll");
      $scope._gh = gh = new Octokat({
        token: $scope.token
      });


      // try {
      //   gh.setCache(JSON.parse(sessionStorage.getItem('cache')) || {});
      // } catch (_error) {
      //   
      //   sessionStorage.removeItem('cache');
      // }

      $scope.saveCache = function() {
        return sessionStorage.setItem('cache', JSON.stringify($scope._gh.getCache()));
      };

      $scope.clearCache = function() {
        return sessionStorage.removeItem('cache');
      };


      $scope.reset = function() {
        var orgDefer = $q.defer(),
            userDefer = $q.defer(); 

        $scope.repos = [];
      
        gh.user.fetch()
        .then(function(user){ // 异步获取用户信息
          getUserRepos(user);
        }, function(err) {
          return window.logError("get user info failed");
        });

        gh.user.orgs.fetch()
        .then(function(orgs){
          var i, index, len, org, orgUser, promise, promises;
          promises = [];
          for (index = i = 0, len = orgs.length; i < len; index = ++i) {
            org = orgs[index];
            promise = org.repos.fetch();
            promises.push(promise);
          }
          return $q.all(promises);
        }, function(err) {
          return window.logError("get org info failed");
        })
        .then(function(repoArrays){
          getOrgRepos(repoArrays);
        }, function(err) {
          return window.logError("get org repo failed");
        });

        function getUserRepos(user) { // 异步获取该用户的所有repos
          user.repos.fetch().then(function(repos){
            var i, len, repo;

            repos = jekyllFilter(repos);
            // $scope.$evalAsync(function() {
            console.log(repos);
            $scope.repos = $scope.repos.concat(repos);
            // });
            userDefer.resolve()
          }, function(err) {
            return window.logError("get user repos failed");
          });
        }

        function getOrgRepos(repoArrays) {
          var i, j, len, len1, repo, repos, res, results;
          results = [];
          for (i = 0, len = repoArrays.length; i < len; i++) {
            repos = repoArrays[i];
            repos = jekyllFilter(repos);
            // for (j = 0, len1 = orgs.length; j < len1; j++) {
            //   org = orgs[j];
            //   repo._repo = gh.getRepo(repo.owner.login, repo.name);
            // }
            // console.log(orgs);
            results.push($scope.repos = $scope.repos.concat(repos));
          }
          orgDefer.resolve();
          return results;
        }
          

        // user.getInfo().then(function(info) {
        //   $scope.$evalAsync(function() {
        //     return $scope.username = info.login;
        //   });
        //   return user.repos();
        // }, function(err) {
        //   return window.logError("get user info failed");
        // }).then(function(repos) {
        //   var i, len, repo;
        //   repos = jekyllFilter(repos);
        //   for (i = 0, len = repos.length; i < len; i++) {
        //     repo = repos[i];
        //     repo._repo = gh.repo(repo.owner.login, repo.name);
        //   }
        //   $scope.$evalAsync(function() {
        //     return $scope.repos = $scope.repos.concat(repos);
        //   });
        // }, function(err) {
        //   return window.logError("get user repo failed");
        // });

        // orgDefer = $q.defer();
        // user.orgs.fetch().then(function(orgs) {
        //   var i, index, len, org, orgUser, promise, promises;
        //   promises = [];
        //   for (index = i = 0, len = orgs.length; i < len; index = ++i) {
        //     org = orgs[index];
        //     orgUser = gh.org(org.login);
        //     promise = orgUser.repos();
        //     promises.push(promise);
        //   }
        //   return $q.all(promises);
        // }, function(err) {
        //   return window.logError("get org info failed");
        // }).then(function(resArrays) {
        //   $scope.$evalAsync(function() {
        //     var i, j, len, len1, repo, repos, res, results;
        //     results = [];
        //     for (i = 0, len = resArrays.length; i < len; i++) {
        //       res = resArrays[i];
        //       repos = jekyllFilter(res);
        //       for (j = 0, len1 = repos.length; j < len1; j++) {
        //         repo = repos[j];
        //         repo._repo = gh.getRepo(repo.owner.login, repo.name);
        //       }
        //       results.push($scope.repos = $scope.repos.concat(repos));
        //     }
        //     return results;
        //   });
        //   // return orgDefer.resolve();
        // }, function(err) {
        //   return window.logError("get org repo failed");
        // });

        $scope.blogListReady = $q.all([userDefer.promise, orgDefer.promise]);
        
        return $scope.blogListReady.then(function() {
        //   // $scope.$evalAsync(function() {
            $scope.loading = false;
        //   // });
        //   // $scope.saveCache();
        //   // return $scope.getRepo = function(username, reponame) {
        //   //   var i, len, ref, repo;
        //   //   ref = $scope.repos;
        //   //   for (i = 0, len = ref.length; i < len; i++) {
        //   //     repo = ref[i];
        //   //     if (repo.owner.login === username && repo.name === reponame) {
        //   //       return repo;
        //   //     }
        //   //   }
        //   //   return null;
        //   // };
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