angular.module "easyblog.templates", [
  'templates/editor.html'
  'templates/list.html'
  'templates/index.html'
  'templates/blog-list.html'
  'templates/post.html'
  'templates/progress.html'
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

angular.module "templates/progress.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/progress.html",
        """
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="200px" height="200px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve">
          <g id="layer-cat">
            <g>
              <g>
                <polygon points="137.336,64.466 137.336,117.181 116.25,117.181 110.979,117.181 89.893,117.181 84.623,117.181 63.536,117.181 63.536,64.466 84.622,85.552 116.25,85.552"/>
              </g>
              <rect class="cat-eye" transform-origin="84.622 117.18" x="84.622" y="101.367" fill="#FFFFFF" width="5.271" height="15.813"/>
              <rect class="cat-eye" transform-origin="110.979 117.18" x="110.979" y="101.367" fill="#FFFFFF" width="5.271" height="15.813"/>
            </g>
          </g>
          <g id="layer-line">
            <line stroke="#000000" stroke-width="3" stroke-miterlimit="10" x1="24" y1="118.5" x2="177" y2="118.5"/>
          </g>
          <g id="layer-pencil">
            <g>
              <path d="M44.78,86.211c-2.721,1.408-4.764,3.753-5.617,6.434c-0.72,2.261-0.543,4.611,0.49,6.615l4.213,8.072
                c0.011,0.023,0.015,0.05,0.029,0.074c0.006,0.014,0.018,0.023,0.023,0.037l0.004-0.004l8.942,17.134
                c0.404,0.785,1.006,1.454,1.736,1.954l9.746,6.35c0.028,0.013,0.806,0.471,1.233,0.607c2.425,0.771,5.021-0.571,5.795-3.002
                c0.155-0.483,0.222-1.492,0.228-1.528l0.589-11.536c0.019-0.885-0.185-1.758-0.596-2.547L58.382,89.555
                C56.002,84.958,50.03,83.489,44.78,86.211z"></path>
              <path fill="#FFD268" d="M66.072,111.494c-1.166-0.26-2.38-0.291-3.587-0.146l-8.092-15.654c2.524,0.005,4.805,1.14,5.889,3.24
                c0.009,0.014,0.01,0.027,0.018,0.04l0.021-0.013l6.694,12.819C66.702,111.681,66.4,111.567,66.072,111.494z"></path>
              <path fill="#FFC334" d="M61.139,111.612c-0.919,0.224-1.832,0.521-2.698,0.97c-1.013,0.521-1.894,1.212-2.692,1.971L47.59,98.772
                c0.716-0.809,1.596-1.519,2.644-2.061c0.893-0.463,1.819-0.748,2.736-0.899L61.139,111.612z"></path>
              <path fill="#E2AF38" d="M54.779,115.545c-0.838,1.015-1.494,2.147-1.899,3.361l-6.668-12.775c-0.973-1.941-0.703-4.229,0.5-6.185
                L54.779,115.545z"></path>
              <path fill="#666666" d="M68.969,128.8c-0.012,0.146-0.04,0.607-0.112,0.903c-0.341,1.027-1.446,1.599-2.479,1.27
                c-0.206-0.083-0.542-0.281-0.666-0.354l-4.368-2.847c0.417-1.446,1.469-2.812,3.071-3.642c1.625-0.842,3.384-0.92,4.817-0.395
                L68.969,128.8z"></path>
              <path fill="#EACEBE" d="M69.298,122.396c-1.695-0.508-3.667-0.379-5.488,0.562c-1.727,0.894-3.027,2.365-3.639,4.052l-4.131-2.691
                c-0.273-0.188-0.514-0.461-0.704-0.766c-1-3.094,0.765-6.798,4.315-8.632c3.753-1.939,8.061-1.053,9.853,1.932
                c0.028,0.172,0.056,0.341,0.052,0.515L69.298,122.396z"></path>
              <path fill="#D76F6E" d="M56.042,90.768l1.457,2.794c-0.283-0.09-0.546-0.211-0.844-0.278c-2.5-0.552-5.21-0.167-7.632,1.086
                c-2.7,1.395-4.737,3.732-5.6,6.417l-1.434-2.747c-0.708-1.372-0.821-3.007-0.315-4.597c0.644-2.021,2.217-3.804,4.318-4.894
                c1.973-1.021,4.115-1.324,6.036-0.854C53.819,88.136,55.244,89.228,56.042,90.768L56.042,90.768z"></path>
            </g>
          </g>
        </svg>
        <div class="text">{{loadingText}}</div>
        """
      )
  ]

