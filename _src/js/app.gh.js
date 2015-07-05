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

  self.getRepo = function(username, reponame){
    var repo;
    for (var i = allRepos.length - 1; i >= 0; i--) {
      repo = allRepos[i];
      if(repo.owner.login == username && repo.name == reponame){
        return repo;
      };
    };
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
]);