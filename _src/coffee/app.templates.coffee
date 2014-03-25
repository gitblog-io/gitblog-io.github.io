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
            <img ng-src="{{repo.owner.avatar_url}}" style="width: 18px; height: 18px; vertical-align: text-bottom">
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
          <div class="form-group">
            <input class="form-control input-lg post-title" placeholder="Title" ng-model="frontMatter.title"/>
            <input class="form-control post-tagline" placeholder="Tagline" ng-model="frontMatter.tagline"/>
          </div>
          <br><br>
          <div class="form-group">
            <textarea class="form-control" placeholder="Story..." ng-model="content"></textarea>
            <div class="placeholder" editor ng-model="content" placeholder="Story..."></div>
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