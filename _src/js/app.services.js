app.service("gh", ["$q", "$filter", function($q, $filter){
    var self = this,
        octokat,
        orgDefer = $q.defer(),
        userDefer = $q.defer(),
        allRepos = []; 

    jekyllFilter = $filter("jekyll");

    // public functions
    self.init = function(token){
      octokat = new Octokat({
        token: token
      });
    }

    self.startFetchRepos = function(){
      getUser();
      getOrgs();
    }

    self.getRepos = function(){
      return allRepos;
    }

    self.blogListReady = function(){
      return $q.all([userDefer.promise, orgDefer.promise]);
    }

    // private funcitons
    function getUser(){
      octokat.user.fetch().then(function(user){ // 异步获取用户信息
          return getUserRepos(user);
        }, function(err) {
          return window.logError("get user info failed");
        })
    }

    function getOrgs(){
      octokat.user.orgs.fetch()
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
    }
    
    function getUserRepos(user) { // 异步获取该用户的所有repos
      user.repos.fetch().then(function(repos){
        var i, len, repo;

        repos = jekyllFilter(repos);

        userDefer.resolve();
        return allRepos = allRepos.concat(repos);
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
        results = allRepos = allRepos.concat(repos);
      }

      orgDefer.resolve();
      return results;
    }
    
  }
  ]).factory("utils", [
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
        if (res = repo.fullName.match(userPage)) {
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