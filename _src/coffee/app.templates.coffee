angular.module "easyblog.templates", [
  'templates/editor.html'
  'templates/list.html'
  'templates/index.html'
  'templates/blog-list.html'
]

angular.module "templates/blog-list.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/blog-list.html",
        """
        <div class="media" ng-repeat="repo in repos">
          <a class="pull-left" ng-href="{{repo.owner.html_url}}" target="_blank">
            <img class="media-object" ng-src="{{repo.owner.avatar_url}}" style="width: 64px; height: 64px;">
          </a>
          <div class="media-body">
            <a ng-href="#!/{{repo.full_name}}"><h4 class="media-heading">{{repo.owner.login}}</h4></a>
            <p class="text-muted">
              <a href="{{repo.html_url}}" target="_blank">{{repo.name}}</a>
              Last updated at <time>{{repo.updated_at}}</time>
            </p>
            <p class="text-muted">{{repo.description}}</p>
          </div>
        </div>
        """
      )
  ]

angular.module "templates/editor.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/editor.html",
        """
        <textarea class="form-control" rows="25">{{file}}</textarea>
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
            <a ng-href="#!/{{username}}/{{reponame}}/{{post.info.sha}}">{{post.urlTitle}}</a>
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