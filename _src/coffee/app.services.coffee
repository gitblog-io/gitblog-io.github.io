angular.module "easyblog"

.factory "utils", [->
  filterRepos:(repos, names)->
]

.filter "jekyll", [->
  userPage = /([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9][A-Za-z0-9-]+)\.github\.(?:io|com)/
  (repos)->
    return null unless repos instanceof Array
    _.filter repos, (repo)->
      if res = repo.full_name.match userPage
        if res[1] == res[2]
          return true
      return false
]

.factory "githubUpload", ["$rootScope", "$q", ($rootScope, $q)->
  (files, uuids, _repo)->
    d = $q.defer()

    promise: d.promise
    upload:->
      branch = _repo.getBranch('master')
      message = "Upload image by easyblog.github.io at " + (new Date()).toLocaleString()

      branch.writeMany(files, message)
      .then (res)->
        for uuid of uuids
          uuids[uuid] = '/' + uuids[uuid]
        d.resolve uuids, res
        return
      , (err)->
        d.reject(err)
        return
      d.promise
]

.factory "uploader", [
  "githubUpload"
  (githubUpload)->
    upload = githubUpload
    (_repo)->
      self = @
      queue = []
      processing = false

      recurse = ()->
        if queue.length > 0
          queue[0].upload()
          .then ->
            queue.shift()
            recurse()
            return
          , (err)->
            console.log err
            queue.shift()
            recurse()
            return
        else
          processing = false
        return

      process = ()->
        if !processing
          processing = true
          recurse()
        return

      add: (group)->
        res = upload(group.files, group.uuids, _repo)
        queue.push res
        process()

        res.promise


]

.factory "UUID", [->
  ->
    d = (new Date()).getTime()
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c)->
      r = (d + Math.random()*16)%16 | 0
      d = Math.floor(d/16)
      return (if c=='x' then r else (r&0x7|0x8)).toString(16)
]