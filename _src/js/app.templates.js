angular.module("gitblog.templates", ['templates/editor.html', 'templates/list.html', 'templates/index.html', 'templates/blog-list.html', 'templates/post.html', 'templates/about.html', 'templates/blank.html']);

angular.module("templates/blog-list.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/blog-list.html", "<li ng-repeat=\"repo in repos track by repo.name\">\n  <a ng-href=\"#!/{{repo.full_name}}\">\n    <img ng-src=\"{{repo.owner.avatar_url}}s=140\" class=\"avatar\">\n    {{repo.owner.login}}\n  </a>\n</li>");
  }
]);

angular.module("templates/post.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/post.html", "<article post ng-model=\"post\"></article>");
  }
]);

angular.module("templates/editor.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/editor.html", "<form name=\"postForm\" unsaved-warning-form>\n  <div class=\"action text-right\">\n    <a class=\"btn btn-default\" ng-href=\"#!/{{username}}/{{reponame}}\">Back</a>\n    <button class=\"btn btn-danger\" ng-click=\"delete()\" ng-if=\"!new\">Delete</button>\n    <switch name=\"published\" ng-model=\"frontMatter.published\"></switch>\n    <button ng-disabled=\"postForm.$invalid\" class=\"btn btn-success\" ng-click=\"save()\">Save</button>\n  </div>\n  <header class=\"page-header\" frontmatter-raw ng-model=\"frontMatterRaw\">\n    <h1 name=\"title\" required custom-input class=\"post-title\" data-placeholder=\"Title\" ng-model=\"frontMatter.title\"></h1>\n    <h3 name=\"tagline\" custom-input class=\"post-tagline\" data-placeholder=\"Tagline\" ng-model=\"frontMatter.tagline\"></h3>\n    <p class=\"text-right\"><a href=\"javascript:\" class=\"text-muted\" ng-click=\"advanced = !advanced\">{{advanced ? \"Hide\" : \"Edit\"}} raw frontmatter (advanded)</a></p>\n    <div ng-class=\"{hidden:!advanced}\">\n      <div name=\"frontmatter\" frontmatter-editor ng-model=\"frontMatterRaw\"></div>\n    </div>\n  </header>\n  <br>\n  <div class=\"page-content\">\n    <div class=\"drag-area\">Drop to upload</div>\n    <div class=\"placeholder\" post-editor ng-model=\"content\" data-placeholder=\"Your story\"></div>\n  </div>\n</form>");
  }
]);

angular.module("templates/list.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/list.html", "<div class=\"action text-right\">\n  <a class=\"btn btn-success\" ng-href=\"#!/{{username}}/{{reponame}}/new\">New Post</a>\n</div>\n<div class=\"page-header text-center\">\n  <h1>Posts</h1>\n  <small class=\"text-muted\" ng-bind-template=\"in {{reponame}}\"></small>\n</div>\n<div class=\"list-item\" ng-repeat=\"post in posts | orderBy : 'date' : true\">\n  <h3>\n    <a ng-href=\"#!/{{post.user}}/{{post.repo}}/{{post.info.path}}\">{{post.urlTitle}}</a>\n    <small ng-if=\"post.type=='_drafts'\">(draft)</small>\n  </h3>\n  <small><time class=\"text-muted\">{{post.date | date : 'MM/dd/yyyy'}}</time></small>\n</div>\n<div ng-show=\"!loading && posts.length == 0\" class=\"jumbotron text-center\">\n  <h3>No posts there.</h3>\n  <a class=\"btn btn-success btn-lg\" ng-href=\"#!/{{username}}/{{reponame}}/new\">New Post</a>\n</div>");
  }
]);

angular.module("templates/index.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/index.html", "<div class=\"action text-right\">\n  <a ng-href=\"#!/signout\">Sign out</a>\n</div>\n<div class=\"page-header text-center\">\n  <h1>Blogs</h1>\n  <small class=\"text-muted\" ng-show=\"username\">of {{username}}</small>\n</div>\n<div class=\"index-wrap\">\n  <div class=\"media list-item\" ng-repeat=\"repo in repos track by repo.name\">\n    <div class=\"pull-left\">\n      <img ng-src=\"{{repo.owner.avatar_url}}s=140\" class=\"media-object avatar avatar-large\">\n    </div>\n    <div class=\"media-body\">\n      <h3 class=\"media-heading\"><a ng-href=\"#!/{{repo.full_name}}\">{{repo.owner.login}}</a> <small>{{repo.name}}</small></h3>\n      <div class=\"text-muted\"><small>{{repo.description}}</small></div>\n      <div class=\"text-muted\">\n        <small>Last updated at <time>{{repo.updated_at}}</time></small>\n      </div>\n    </div>\n  </div>\n</div>\n<div ng-show=\"!loading && !repos.length\" class=\"jumbotron text-center\">\n  <h3>No blogs there.</h3>\n  <button class=\"btn btn-primary btn-lg\" ng-click=\"createBlog()\">Create One</button>\n</div>");
  }
]);

angular.module("templates/about.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/about.html", "<div class=\"page-header text-center\">\n  <h1>About gitblog</h1>\n  <small class=\"text-muted\">The easiest way to post on Github Pages</small>\n</div>\n<div class=\"text-center\">\n  <h3>Project</h3>\n  <p><a class=\"btn btn-primary\" target=\"_blank\" href=\"https://github.com/gitblog-io/gitblog-io.github.io/\"><i class=\"icon-github-alt\"></i> Gitblog</a></p>\n\n  <h3>Author</h3>\n  <p><a class=\"btn btn-primary\" target=\"_blank\" href=\"https://github.com/hyspace\"><i class=\"icon-cat\"></i> hyspace</a></p>\n\n  <h3>Bug report</h3>\n  <p><a target=\"_blank\" href=\"https://github.com/gitblog-io/gitblog-io.github.io/issues\">Issues</a></p>\n\n  <h3>Opensouce projects used in gitblog</h3>\n  <ul class=\"list-unstyled\">\n    <li><a target=\"_blank\" href=\"http://www.angularjs.org/\">Angular.js</a></li>\n    <li><a target=\"_blank\" href=\"http://ace.c9.io/\">Ace editor</a></li>\n    <li><a target=\"_blank\" href=\"https://github.com/philschatz/octokit.js\">Octokit.js</a></li>\n    <li><a target=\"_blank\" href=\"http://jquery.com/\">jQuery</a></li>\n    <li><a target=\"_blank\" href=\"http://getbootstrap.com/\">Bootstrap</a></li>\n    <li><a target=\"_blank\" href=\"http://lodash.com/\">lodash</a></li>\n    <li><a target=\"_blank\" href=\"http://nodeca.github.io/js-yaml/\">js-yaml</a></li>\n    <li><a target=\"_blank\" href=\"https://github.com/agrublev/angularLocalStorage\">angularLocalStorage</a></li>\n    <li><a target=\"_blank\" href=\"https://github.com/facultymatt/angular-unsavedChanges\">angular-unsavedChanges</a></li>\n  </ul>\n\n  <h3>Other projects</h3>\n  <ul class=\"list-unstyled\">\n    <li><a target=\"_blank\" href=\"https://stackedit.io/\">stackedit</a></li>\n    <li><a target=\"_blank\" href=\"http://prose.io/\">prose</a></li>\n  </ul>\n</div>");
  }
]);

angular.module("templates/blank.html", []).run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("templates/blank.html", "");
  }
]);