app.factory("utils", [
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