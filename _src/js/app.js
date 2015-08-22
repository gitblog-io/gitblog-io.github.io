(function(){
  // 一些初始化DOM和绑定事件的操作
  var bodyElement = angular.element(document.body),
      btnMenuElement = angular.element(document.getElementById('btn-open-menu'));

  bodyElement.append("<div id=\"mask\" data-toggle-menu></div>");

  var maskMenuElement = angular.element(document.getElementById('mask'));

  var menuHandler = function(e) {
    bodyElement.toggleClass('menu-open');

    var targetElement = e.target;
    if (targetElement.tagName === 'A') {
      if ((!targetElement || targetElement.href.toLowerCase() !== "_blank") && (targetElement.href != null)) {
        bodyElement.removeClass();
      }
    };
  }

  btnMenuElement.on('click', menuHandler);
  maskMenuElement.on('click', menuHandler);

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
    return window.logError(e.message, e.filename, e.lineno);
  });
})();


// app是全局模块，代表整个APP
var app = angular.module("gitblog", ['ngRoute', 'ngAnimate', 'angularLocalStorage', 'unsavedChanges', 'gitblog.templates']);

// 绑定路由
app.config([
  '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.when('/', {
      templateUrl: 'templates/index.html',
      controller: 'IndexController'
    }).when('/about', {
      templateUrl: 'templates/about.html',
      controller: 'AboutController'
    }).when('/:user/:repo/:path*', {
      templateUrl: 'templates/post.html',
      controller: 'PostController',
      reloadOnSearch: false
    }).when('/:user/:repo', {
      templateUrl: 'templates/list.html',
      controller: 'ListController'
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
  '$rootScope', 'storage', "$filter", "gh", function($scope, storage, $filter, gh) {
    var jekyllFilter;
    angular.element(document.documentElement).removeClass("nojs").addClass("domready");

    // 设置$scope的初始状态
    $scope.loading = true;
    $scope.loadingText = 'Wait...';
    $scope.repos = [];

    // 读取localStorage
    $scope.token = storage.get('token');
    $scope.reponame = storage.get('reponame');
    storage.bind($scope, 'token');
    storage.bind($scope, 'reponame');

    if ($scope.token !== "") {
      // gh是一个service，可以认为是单例，初始化后全局可用
      gh.init($scope.token);

      // 遍历github上的当前用户的repos
      $scope.repos = gh.startFetchRepos();

      // 遍历完成之后
      gh.blogListReady().then(function() {
        $scope.loading = false;
        $scope.repos = gh.getRepos();
      }, function(err) {
        $scope.loading = false;
        return window.logError("get blog list failed");
      });

    } else {
      window.location.replace('/');
    }
  }
]);