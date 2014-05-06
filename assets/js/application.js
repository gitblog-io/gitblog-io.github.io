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
    ga('send', 'event', "Global", "Exception", "" + url + "(" + lineNumber + "): " + errorMsg);
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
          var repo, _i, _len;
          repos = jekyllFilter(repos);
          for (_i = 0, _len = repos.length; _i < _len; _i++) {
            repo = repos[_i];
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
          var index, org, orgUser, promise, promises, _i, _len;
          promises = [];
          for (index = _i = 0, _len = orgs.length; _i < _len; index = ++_i) {
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
            var repo, repos, res, _i, _j, _len, _len1, _results;
            _results = [];
            for (_i = 0, _len = resArrays.length; _i < _len; _i++) {
              res = resArrays[_i];
              repos = jekyllFilter(res);
              for (_j = 0, _len1 = repos.length; _j < _len1; _j++) {
                repo = repos[_j];
                repo._repo = gh.getRepo(repo.owner.login, repo.name);
              }
              _results.push($scope.repos = $scope.repos.concat(repos));
            }
            return _results;
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
            var repo, _i, _len, _ref;
            _ref = $scope.repos;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              repo = _ref[_i];
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

angular.module("gitblog").controller("IndexController", [
  "$scope", "$timeout", "$route", function($scope, $timeout, $route) {
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
              name: "" + $scope.username + ".github.io"
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
      var repo, _repo;
      if (repo = $scope.getRepo(username, reponame)) {
        $scope.$root.loading = true;
        $scope.$root.loadingText = "Wait...";
        _repo = repo._repo;
        return _repo.git.getTree('master', {
          recursive: true
        }).then(function(tree) {
          var configFileExists, configFileReg, file, postReg, posts, res, _i, _len;
          $scope.saveCache();
          posts = [];
          configFileExists = false;
          postReg = /^(_posts)\/(?:[\w\.-]+\/)*(\d{4})-(\d{2})-(\d{2})-(.+?)\.md$/;
          configFileReg = /^_config.yml$/;
          for (_i = 0, _len = tree.length; _i < _len; _i++) {
            file = tree[_i];
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
            } else if (configFileReg.test(file.path)) {
              configFileExists = true;
            }
          }
          if (configFileExists) {
            return $scope.$evalAsync(function() {
              $scope.$root.loading = false;
              $scope.reponame = reponame;
              $scope.username = username;
              return $scope.posts = posts;
            });
          }
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
      var deleteFunc, newPost, repo, save, searchAndShow, show, _repo;
      if (repo = $scope.getRepo(username, reponame)) {
        $scope.$root.loading = true;
        $scope.$root.loadingText = "Wait...";
        _repo = repo._repo;
        $scope.uploader = uploader.call($scope, _repo);
        save = function() {
          var branch, message, promise;
          $scope.$root.loading = true;
          $scope.$root.loadingText = "Saving...";
          branch = 　_repo.getBranch("master");
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
            branch = 　_repo.getBranch("master");
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
                }, 1500);
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
]);

angular.module("gitblog").directive("blogList", [
  function() {
    return {
      restrict: "A",
      templateUrl: "templates/blog-list.html"
    };
  }
]).directive("post", [
  "$timeout", function($timeout) {
    return {
      restrict: "A",
      templateUrl: "templates/editor.html",
      require: "?ngModel",
      link: function($scope, $element, $attr, ngModel) {
        var promise, update, ymlReg;
        if (ngModel == null) {
          return;
        }
        ymlReg = /^(?:---\r?\n)((?:.|\r?\n)*?)\r?\n---\r?\n/;
        ngModel.$formatters.push(function(modelValue) {
          var content, frontMatter;
          if (modelValue != null) {
            frontMatter = null;
            content = modelValue.replace(ymlReg, function(match, yml) {
              var e;
              try {
                frontMatter = jsyaml.safeLoad(yml);
                if (frontMatter.published == null) {
                  frontMatter.published = true;
                }
              } catch (_error) {
                e = _error;
                window.logError(e.toString());
              }
              return '';
            });
            $scope.$evalAsync(function() {
              $scope.frontMatter = frontMatter;
              return $scope.content = content;
            });
          }
          return modelValue;
        });
        update = function() {
          var content, frontMatter, viewValue, yml;
          yml = jsyaml.safeDump($scope.frontMatter, {
            skipInvalid: true
          });
          frontMatter = "---\n" + yml + "---\n";
          content = $scope.content;
          viewValue = frontMatter + content;
          ngModel.$setViewValue(viewValue);
          return $scope.$evalAsync();
        };
        promise = null;
        $scope.$watch('content', function(data, oldData) {
          if ((data != null) && (oldData != null) && data !== oldData) {
            if (promise != null) {
              $timeout.cancel(promise);
            }
            return promise = $timeout(update, 10);
          }
        });
        $scope.$watchCollection('frontMatter', function(data, oldData) {
          if ((data != null) && (oldData != null)) {
            if (promise != null) {
              $timeout.cancel(promise);
            }
            return promise = $timeout(update, 200);
          }
        });
        $(window).on("keydown", function(event) {
          if (event.ctrlKey || event.metaKey) {
            switch (String.fromCharCode(event.which).toLowerCase()) {
              case "s":
                event.preventDefault();
                if ($scope.postForm.$dirty) {
                  return $scope.$evalAsync(function() {
                    return $scope.save();
                  });
                }
            }
          }
        });
      }
    };
  }
]).directive('editor', [
  "$timeout", "UUID", function($timeout, UUID) {
    return {
      restrict: "EA",
      require: "?ngModel",
      link: function($scope, $element, $attrs, ngModel) {
        var editor, groups, loaded, onChange, opts, promise, session, update;
        if (ngModel == null) {
          return;
        }
        window.ace.config.set('basePath', '/assets/js/ace');
        editor = window.ace.edit($element[0]);
        editor.setFontSize(16);
        editor.setOptions({
          maxLines: Infinity
        });
        editor.setShowPrintMargin(false);
        editor.setHighlightActiveLine(false);
        editor.renderer.setShowGutter(false);
        editor.setTheme('ace/theme/tomorrow-markdown');
        session = editor.getSession();
        session.setUseWrapMode(true);
        session.setUseSoftTabs(true);
        session.setTabSize(2);
        session.setMode("ace/mode/markdown");
        ngModel.$formatters.push(function(value) {
          if (angular.isUndefined(value) || value === null || value === "") {
            $element.addClass("placeholder");
            return "";
          } else if (angular.isObject(value) || angular.isArray(value)) {
            window.logError("ace cannot use an object or an array as a model");
          } else {
            $element.removeClass("placeholder");
          }
          return value;
        });
        ngModel.$render = function() {
          session.setValue(ngModel.$viewValue);
        };
        loaded = false;
        update = function() {
          var viewValue;
          viewValue = session.getValue();
          ngModel.$setViewValue(viewValue);
          if (!loaded) {
            $scope.postForm.$setPristine();
            return loaded = true;
          }
        };
        promise = null;
        onChange = function() {
          if (promise != null) {
            $timeout.cancel(promise);
          }
          return promise = $timeout(update, 190, true);
        };
        session.on("change", onChange);
        editor.on("focus", function() {
          return $element.removeClass("placeholder");
        });
        editor.on("blur", function() {
          if (session.getValue() === "") {
            return $element.addClass("placeholder");
          }
        });
        $element.on("$destroy", function() {
          editor.session.$stopWorker();
          editor.destroy();
        });
        editor.commands.addCommand({
          name: "save",
          bindKey: {
            win: "Ctrl-S",
            mac: "Command-S"
          },
          exec: function(editor) {
            if ($scope.postForm.$dirty) {
              return $scope.$evalAsync(function() {
                return $scope.save();
              });
            }
          }
        });
        groups = [];
        opts = {
          dragClass: "drag",
          accept: 'image/*',
          readAsMap: {
            "image/*": "BinaryString"
          },
          readAsDefault: "BinaryString",
          on: {
            beforestart: function(e, file) {},
            load: function(e, file) {
              var groupID, path, position, postdate, text, uuid;
              uuid = UUID();
              text = "![image](<uploading-" + uuid + ">)";
              position = editor.getCursorPosition();
              if (position.column !== 0) {
                text = '\n' + text + '\n';
              } else {
                text = text + '\n';
              }
              editor.insert(text);
              postdate = $scope.filepath.match(/\d{4}-\d{2}-\d{2}/);
              path = "assets/post-images/" + postdate + '-' + uuid + '.' + file.extra.extension;
              groupID = file.extra.groupID;
              groups[groupID].files[path] = {
                isBase64: true,
                content: e.target.result
              };
              return groups[groupID].uuids[uuid] = path;
            },
            error: function(e, file) {
              return console.error(file.name + " error: " + e.toString());
            },
            skip: function(file) {
              return console.warn(file.name + " skipped");
            },
            groupstart: function(group) {
              return groups[group.groupID] = {
                files: {},
                uuids: {}
              };
            },
            groupend: function(group) {
              $scope.uploader.add(groups[group.groupID]).then(function(uuids) {
                var path, position, reg, uuid;
                position = editor.getCursorPosition();
                for (uuid in uuids) {
                  path = uuids[uuid];
                  reg = new RegExp("!\\[(\\w*)\\]\\(<uploading-" + uuid + ">\\)");
                  editor.replace("![$1](" + path + ")", {
                    needle: reg
                  });
                }
                editor.clearSelection();
                return editor.moveCursorToPosition(position);
              }, function(err) {
                var path, position, reg, uuid, uuids;
                window.logError("upload image failed");
                uuids = err.uuids;
                position = editor.getCursorPosition();
                for (uuid in uuids) {
                  path = uuids[uuid];
                  reg = new RegExp("!\\[(\\w*)\\]\\(<uploading-" + uuid + ">\\)");
                  editor.replace("(!image upload failed)", {
                    needle: reg
                  });
                }
                editor.clearSelection();
                return editor.moveCursorToPosition(position);
              });
              return groups[group.id] = null;
            }
          }
        };
        $(document.body).fileReaderJS(opts);
        $element.fileClipboard(opts);
        (function(self) {
          var checkLine, customWorker;
          checkLine = function(currentLine) {
            var line;
            line = self.lines[currentLine];
            if (line.length !== 0) {
              if (line[0].type.indexOf("markup.heading.multi") === 0) {
                self.lines[currentLine - 1].forEach(function(previousLineObject) {
                  previousLineObject.type = "markup.heading";
                });
              }
            }
          };
          customWorker = function() {
            var currentLine, doc, endLine, len, processedLines, startLine, workerStart;
            if (!self.running) {
              return;
            }
            workerStart = new Date();
            currentLine = self.currentLine;
            endLine = -1;
            doc = self.doc;
            while (self.lines[currentLine]) {
              currentLine++;
            }
            startLine = currentLine;
            len = doc.getLength();
            processedLines = 0;
            self.running = false;
            while (currentLine < len) {
              self.$tokenizeRow(currentLine);
              endLine = currentLine;
              while (true) {
                checkLine(currentLine);
                currentLine++;
                if (!self.lines[currentLine]) {
                  break;
                }
              }
              processedLines++;
              if ((processedLines % 5 === 0) && (new Date() - workerStart) > 20) {
                self.running = setTimeout(customWorker, 20);
                self.currentLine = currentLine;
                return;
              }
            }
            self.currentLine = currentLine;
            if (startLine <= endLine) {
              self.fireUpdateEvent(startLine, endLine);
            }
          };
          self.$worker = function() {
            self.lines.splice(0, self.lines.length);
            self.states.splice(0, self.states.length);
            self.currentLine = 0;
            customWorker();
          };
        })(editor.session.bgTokenizer);
      }
    };
  }
]).directive("customInput", [
  function() {
    return {
      restrict: "A",
      require: "?ngModel",
      link: function($scope, $element, $attrs, ngModel) {
        if (ngModel == null) {
          return;
        }
        $element.prop("contenteditable", true);
        $element.prop("spellcheck", true);
        ngModel.$render = function() {
          $element.text(ngModel.$viewValue || '');
        };
        $element.on("keydown", function(e) {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        }).on("blur keyup change", function() {
          return $scope.$evalAsync();
        }).on("input", function() {
          ngModel.$setViewValue($element.text().replace(/[\n\r]/g, " "));
        });
      }
    };
  }
]).directive("switch", [
  function() {
    return {
      restrict: "E",
      require: "?ngModel",
      scope: {
        value: '=ngModel'
      },
      replace: true,
      template: "<div class=\"btn-group\">\n  <button type=\"button\" class=\"btn\" ng-click=\"value = false\" ng-class=\"{'btn-default':value, 'btn-primary active':!value}\">Draft</button>\n  <button type=\"button\" class=\"btn\" ng-click=\"value = true\" ng-class=\"{'btn-default':!value, 'btn-primary active':value}\">Public</button>\n</div>",
      link: function($scope, $element, $attr, ngModel) {
        $scope.$watch("value", function(value, old) {
          if ((value != null) && (old != null) && value !== old) {
            ngModel.$setViewValue(value);
          }
        });
      }
    };
  }
]);

angular.module("gitblog").factory("utils", [
  function() {
    return {
      filterRepos: function(repos, names) {}
    };
  }
]).filter("jekyll", [
  function() {
    var userPage;
    userPage = /([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9][A-Za-z0-9-]+)\.github\.(?:io|com)/i;
    return function(repos) {
      if (!(repos instanceof Array)) {
        return null;
      }
      return repos.filter(function(repo) {
        var res;
        if (res = repo.full_name.match(userPage)) {
          if (res[1].toLowerCase() === res[2].toLowerCase()) {
            return true;
          }
        }
        return false;
      });
    };
  }
]).factory("githubUpload", [
  "$rootScope", "$q", function($rootScope, $q) {
    return function(files, uuids, _repo) {
      var d;
      d = $q.defer();
      return {
        promise: d.promise,
        upload: function() {
          var branch, message;
          branch = _repo.getBranch('master');
          message = "Upload image by gitblog.io at " + (new Date()).toLocaleString();
          branch.writeMany(files, message).then(function(res) {
            var uuid;
            for (uuid in uuids) {
              uuids[uuid] = '/' + uuids[uuid];
            }
            d.resolve(uuids, res);
          }, function(err) {
            err.uuids = uuids;
            d.reject(err);
          });
          return d.promise;
        }
      };
    };
  }
]).factory("uploader", [
  "githubUpload", function(githubUpload) {
    var upload;
    upload = githubUpload;
    return function(_repo) {
      var process, processing, queue, recurse, self;
      self = this;
      queue = [];
      processing = false;
      recurse = function() {
        if (queue.length > 0) {
          queue[0].upload().then(function() {
            queue.shift();
            recurse();
          }, function(err) {
            console.log(err);
            queue.shift();
            recurse();
          });
        } else {
          processing = false;
        }
      };
      process = function() {
        if (!processing) {
          processing = true;
          recurse();
        }
      };
      return {
        add: function(group) {
          var res;
          res = upload(group.files, group.uuids, _repo);
          queue.push(res);
          process();
          return res.promise;
        }
      };
    };
  }
]).factory("UUID", [
  function() {
    return function() {
      var d, uuid;
      d = (new Date()).getTime();
      return uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r;
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : r & 0x7 | 0x8).toString(16);
      });
    };
  }
]);

angular.module("gitblog.templates", ['templates/editor.html', 'templates/list.html', 'templates/index.html', 'templates/blog-list.html', 'templates/post.html', 'templates/about.html']);

angular.module("templates/blog-list.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/blog-list.html", "<li ng-repeat=\"repo in repos track by repo.name\">\n  <a ng-href=\"#!/{{repo.full_name}}\">\n    <img ng-src=\"{{repo.owner.avatar_url}}\" class=\"avatar\">\n    {{repo.owner.login}}\n  </a>\n</li>");
  }
]);

angular.module("templates/post.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/post.html", "<article post ng-model=\"post\"></article>");
  }
]);

angular.module("templates/editor.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/editor.html", "<form name=\"postForm\" unsaved-warning-form>\n  <div class=\"action text-right\">\n    <a class=\"btn btn-default\" ng-href=\"#!/{{username}}/{{reponame}}\">Back</a>\n    <button class=\"btn btn-danger\" ng-click=\"delete()\" ng-if=\"!new\">Delete</button>\n    <switch ng-model=\"frontMatter.published\"></switch>\n    <button ng-disabled=\"postForm.title.$invalid\" class=\"btn btn-success\" ng-click=\"save()\">Save</button>\n  </div>\n  <header class=\"page-header\">\n    <h1 name=\"title\" required custom-input class=\"post-title\" data-placeholder=\"Title\" ng-model=\"frontMatter.title\"></h1>\n    <h3 name=\"tagline\" custom-input class=\"post-tagline\" data-placeholder=\"Tagline\" ng-model=\"frontMatter.tagline\"></h3>\n  </header>\n  <br>\n  <div class=\"page-content\">\n    <div class=\"drag-area\">Drop to upload</div>\n    <!--<textarea name=\"content\" class=\"form-control\" placeholder=\"Story...\" ng-model=\"post\"></textarea>-->\n    <div class=\"placeholder\" editor ng-model=\"content\" data-placeholder=\"Your story\"></div>\n  </div>\n</form>");
  }
]);

angular.module("templates/list.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/list.html", "<div class=\"action text-right\">\n  <a class=\"btn btn-success\" ng-href=\"#!/{{username}}/{{reponame}}/new\">New Post</a>\n</div>\n<div class=\"page-header text-center\">\n  <h1>Posts</h1>\n  <small class=\"text-muted\" ng-bind-template=\"in {{reponame}}\"></small>\n</div>\n<div class=\"list-item\" ng-repeat=\"post in posts | orderBy : 'date' : true\">\n  <h3>\n    <a ng-href=\"#!/{{post.user}}/{{post.repo}}/{{post.info.path}}\">{{post.urlTitle}}</a>\n    <small ng-if=\"post.type=='_drafts'\">(draft)</small>\n  </h3>\n  <small><time class=\"text-muted\">{{post.date | date : 'MM/dd/yyyy'}}</time></small>\n</div>\n<div ng-show=\"!loading && !posts.length\" class=\"jumbotron text-center\">\n  <h3>No posts there.</h3>\n  <a class=\"btn btn-success btn-lg\" ng-href=\"#!/{{username}}/{{reponame}}/new\">New Post</a>\n</div>");
  }
]);

angular.module("templates/index.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/index.html", "<div class=\"page-header text-center\">\n  <h1>Blogs</h1>\n  <small class=\"text-muted\" ng-show=\"username\">of {{username}}</small>\n</div>\n<div class=\"index-wrap\">\n  <div class=\"media list-item\" ng-repeat=\"repo in repos track by repo.name\">\n    <div class=\"pull-left\">\n      <img ng-src=\"{{repo.owner.avatar_url}}\" class=\"media-object avatar avatar-large\">\n    </div>\n    <div class=\"media-body\">\n      <h3 class=\"media-heading\"><a ng-href=\"#!/{{repo.full_name}}\">{{repo.owner.login}}</a> <small>{{repo.name}}</small></h3>\n      <div class=\"text-muted\"><small>{{repo.description}}</small></div>\n      <div class=\"text-muted\">\n        <small>Last updated at <time>{{repo.updated_at}}</time></small>\n      </div>\n    </div>\n  </div>\n</div>\n<div ng-show=\"!loading && !repos.length\" class=\"jumbotron text-center\">\n  <h3>No blogs there.</h3>\n  <button class=\"btn btn-primary btn-lg\" ng-click=\"createBlog()\">Create One</button>\n</div>");
  }
]);

angular.module("templates/about.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/about.html", "<div class=\"page-header text-center\">\n  <h1>About gitblog</h1>\n  <small class=\"text-muted\">The easiest way to post on Github Pages</small>\n</div>\n<div class=\"text-center\">\n  <h3>Project</h3>\n  <p><a class=\"btn btn-primary\" target=\"_blank\" href=\"https://github.com/gitblog-io/gitblog-io.github.io/\"><i class=\"icon-github-alt\"></i> Gitblog</a></p>\n\n  <h3>Author</h3>\n  <p><a class=\"btn btn-primary\" target=\"_blank\" href=\"https://github.com/hyspace\"><i class=\"icon-cat\"></i> hyspace</a></p>\n\n  <h3>Bug report</h3>\n  <p><a target=\"_blank\" href=\"https://github.com/gitblog-io/gitblog-io.github.io/issues\">Issues</a></p>\n\n  <h3>Opensouce projects used in gitblog</h3>\n  <ul class=\"list-unstyled\">\n    <li><a target=\"_blank\" href=\"http://www.angularjs.org/\">Angular.js</a></li>\n    <li><a target=\"_blank\" href=\"http://ace.c9.io/\">Ace editor</a></li>\n    <li><a target=\"_blank\" href=\"https://github.com/philschatz/octokit.js\">Octokit.js</a></li>\n    <li><a target=\"_blank\" href=\"http://jquery.com/\">jQuery</a></li>\n    <li><a target=\"_blank\" href=\"http://getbootstrap.com/\">Bootstrap</a></li>\n    <li><a target=\"_blank\" href=\"http://lodash.com/\">lodash</a></li>\n    <li><a target=\"_blank\" href=\"http://nodeca.github.io/js-yaml/\">js-yaml</a></li>\n    <li><a target=\"_blank\" href=\"https://github.com/agrublev/angularLocalStorage\">angularLocalStorage</a></li>\n    <li><a target=\"_blank\" href=\"https://github.com/facultymatt/angular-unsavedChanges\">angular-unsavedChanges</a></li>\n  </ul>\n\n  <h3>Other projects</h3>\n  <ul class=\"list-unstyled\">\n    <li><a target=\"_blank\" href=\"https://stackedit.io/\">stackedit</a></li>\n    <li><a target=\"_blank\" href=\"http://prose.io/\">prose</a></li>\n  </ul>\n</div>");
  }
]);
