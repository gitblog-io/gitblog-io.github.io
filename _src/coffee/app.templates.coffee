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
        <li ng-repeat="repo in repos">
          <a ng-href="#!/{{repo.full_name}}">
            <img ng-src="{{repo.owner.avatar_url}}" class="avatar">
            {{repo.owner.login}}
          </a>
          <!--<div class="body">
            <p class="text-muted">
              <a href="{{repo.html_url}}" target="_blank">{{repo.name}}</a>
              Last updated at <time>{{repo.updated_at}}</time>
            </p>
            <p class="text-muted">{{repo.description}}</p>
          </div>-->
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
        <article post ng-model="post" ng-if="post"></article>
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
          <div class="page-header">
            <h1 custom-input class="post-title" data-placeholder="Title" ng-model="frontMatter.title"></h1>
            <h2 custom-input class="post-tagline" data-placeholder="Tagline" ng-model="frontMatter.tagline"></h2>
          </div>
          <br><br>
          <div class="page-content">
            <textarea class="form-control" placeholder="Story..." ng-model="post"></textarea>
            <div class="placeholder" editor ng-model="content" data-placeholder="Story..."></div>
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
        <div class="page-header" ng-repeat="post in blogList | orderBy : post.date : reverse">
          <h5>
            <a ng-href="#!/{{post.user}}/{{post.repo}}/{{post.info.path}}?sha={{post.info.sha}}">{{post.urlTitle}}</a>
            <small ng-if="post.type=='_drafts'">(draft)</small>
          </h5>
          <time>{{post.date | date : 'MM/dd/yyyy'}}</time>
        </div>
        """
      )
  ]

angular.module "templates/index.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/index.html",
        """index"""
      )
  ]