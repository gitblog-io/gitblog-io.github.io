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
            $scope.repos = $scope.repos.concat(repos);
          }
          orgDefer.resolve();
        }

        $scope.blogListReady = $q.all([userDefer.promise, orgDefer.promise]);
        
        return $scope.blogListReady.then(function() {

            console.log($scope.repos);
            for (var i = $scope.repos.length - 1; i >= 0; i--) {
              console.log('http://avatars.githubusercontent.com/u/' + $scope.repos[i].owner.id + '?v=3');
            };
            $scope.loading = false;
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