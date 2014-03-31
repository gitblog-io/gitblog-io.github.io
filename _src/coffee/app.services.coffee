angular.module "easyblog"

.factory "utils", [->
  filterRepos:(repos, names)->
]

.filter "jekyll", [->
  userPage = /([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9][A-Za-z0-9-]*)\.github\.(?:io|com)/
  (repos)->
    return null unless repos instanceof Array
    _.filter repos, (repo)->
      if res = repo.full_name.match userPage
        if res[1] == res[2]
          return true
      return false
]