angular.module "easyblog"

.directive "blogList", [->
  restrict: "A"
  templateUrl: "templates/blog-list.html"
  controller: "BlogListController"
]
