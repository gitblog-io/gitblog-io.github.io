angular.module "easyblog.templates", [
  'templates/auth.html'
  'templates/editor.html'
  'templates/list.html'
  'templates/index.html'
]

angular.module "templates/auth.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/auth.html",
        ""
      )
  ]

angular.module "templates/editor.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/editor.html",
        ""
      )
  ]

angular.module "templates/list.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/list.html",
        ""
      )
  ]

angular.module "templates/index.html", []
  .run [
    "$templateCache"
    ($templateCache) ->
      $templateCache.put( "templates/index.html",
        ""
      )
  ]