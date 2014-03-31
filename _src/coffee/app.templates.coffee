angular.module "easyblog.templates", [
  'templates/editor.html'
  'templates/list.html'
  'templates/index.html'
  'templates/blog-list.html'
  'templates/post.html'
]

angular.module "templates/blog-list.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/blog-list.html",
        """
        <li ng-repeat="repo in repos track by repo.name">
          <a ng-href="#!/{{repo.full_name}}">
            <img ng-src="{{repo.owner.avatar_url}}" class="avatar">
            {{repo.owner.login}}
          </a>
        </li>
        """
      )
  ]

angular.module "templates/post.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/post.html",
        """
        <article post ng-model="post"></article>
        """
      )
  ]

angular.module "templates/editor.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/editor.html",
        """
        <form>
          <div class="action text-right">
            <button class="btn btn-default" ng-click="delete()" ng-if="!new">Delete</button>
            <a class="btn btn-default" ng-href="#!/{{username}}/{{reponame}}" ng-if="new">Drop</a>
            <switch ng-model="frontMatter.published"></switch>
            <button class="btn btn-success" ng-click="save()">Save</button>
          </div>
          <header class="page-header">
            <h1 custom-input class="post-title" data-placeholder="Title" ng-model="frontMatter.title"></h1>
            <h3 custom-input class="post-tagline" data-placeholder="Tagline" ng-model="frontMatter.tagline"></h3>
          </header>
          <br>
          <div class="page-content">
            <textarea class="form-control" placeholder="Story..." ng-model="post"></textarea>
            <div class="placeholder" editor ng-model="content" data-placeholder="Your story"></div>
          </div>
        </form>
        """
      )
  ]

angular.module "templates/list.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/list.html",
        """
        <div class="action text-right">
          <a class="btn btn-success" ng-href="#!/{{username}}/{{reponame}}/new">New Post</a>
        </div>
        <div class="page-header text-center">
          <h1>Posts</h1>
          <small class="text-muted" ng-show="reponame">in {{reponame}}</small>
        </div>
        <div class="list-item" ng-repeat="post in posts | orderBy : post.date : reverse">
          <h3>
            <a ng-href="#!/{{post.user}}/{{post.repo}}/{{post.info.path}}?sha={{post.info.sha}}">{{post.urlTitle}}</a>
            <small ng-if="post.type=='_drafts'">(draft)</small>
          </h3>
          <small><time class="text-muted">{{post.date | date : 'MM/dd/yyyy'}}</time></small>
        </div>
        """
      )
  ]

angular.module "templates/index.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/index.html",
        """
        <div class="page-header text-center">
          <h1>Blogs</h1>
          <small class="text-muted" ng-show="username">of {{username}}</small>
        </div>
        <div class="index-wrap">
          <div class="media list-item" ng-repeat="repo in repos track by repo.name">
            <div class="pull-left">
              <img ng-src="{{repo.owner.avatar_url}}" class="media-object avatar avatar-large">
            </div>
            <div class="media-body">
              <h3 class="media-heading"><a ng-href="#!/{{repo.full_name}}">{{repo.owner.login}}</a> <small>{{repo.name}}</small></h3>
              <div class="text-muted"><small>{{repo.description}}</small></div>
              <div class="text-muted">
                <small>Last updated at <time>{{repo.updated_at}}</time></small>
              </div>
            </div>
          </div>
        </div>
        """
      )
  ]

