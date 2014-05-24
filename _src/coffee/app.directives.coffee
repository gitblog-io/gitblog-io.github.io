angular.module "gitblog"

.directive "blogList", [->
  restrict: "A"
  templateUrl: "templates/blog-list.html"
]

.directive "post", ["$timeout", ($timeout)->
  restrict: "A"
  templateUrl: "templates/editor.html"
  require: "?ngModel"
  link:($scope, $element, $attr, ngModel)->
    return unless ngModel?

    ymlReg = /^(?:---\r?\n)((?:.|\r?\n)*?)\r?\n---\r?\n/

    $scope.advanced = false

    ngModel.$formatters.push (modelValue)->

      if modelValue?
        frontMatterRaw = ""

        content = modelValue.replace ymlReg, (match, yml)->
          frontMatterRaw = yml
          return ''

        $scope.$evalAsync ->
          $scope.frontMatterRaw = frontMatterRaw
          $scope.content = content

      return modelValue

    update = ->
      viewValue = "---\n#{$scope.frontMatterRaw}---\n" + $scope.content
      ngModel.$setViewValue(viewValue)

    promise = null
    $scope.$watch 'content', (data, oldData)->
      if data? and oldData? and data isnt oldData
        $timeout.cancel promise if promise?
        promise = $timeout update, 10

    $scope.$watch 'frontMatterRaw', (data, oldData)->
      if data? and oldData? and data isnt oldData
        $timeout.cancel promise if promise?
        promise = $timeout update, 10

    $(window).on "keydown", (event) ->
      if event.ctrlKey or event.metaKey
        switch String.fromCharCode(event.which).toLowerCase()
          when "s"
            event.preventDefault()
            if $scope.postForm.$dirty
              $scope.$evalAsync ->
                $scope.save()

    return

]

.directive "frontmatterRaw", ["$timeout", ($timeout)->
  restrict: "A"
  require: "?ngModel"
  link:($scope, $element, $attr, ngModel)->
    return unless ngModel?

    ngModel.$formatters.push (modelValue)->

      if modelValue?
        frontMatter = null

        try
          frontMatter = jsyaml.safeLoad modelValue
          if !frontMatter.published? then frontMatter.published = true
        catch e
          console.warn e.toString()

        $scope.$evalAsync ->
          $scope.frontMatter = frontMatter

      return modelValue

    update = ->
      yml = jsyaml.safeDump $scope.frontMatter, skipInvalid: true
      ngModel.$setViewValue(yml)

    promise = null
    $scope.$watchCollection 'frontMatter', (data, oldData)->
      if data? and oldData? and data isnt oldData
        $timeout.cancel promise if promise?
        promise = $timeout update, 200

    return

]

.directive 'frontmatterEditor', [
  "$timeout"
  ($timeout)->
    restrict:"A"
    require:"?ngModel"
    link:($scope, $element, $attrs, ngModel)->
      return unless ngModel?

      window.ace.config.set('basePath', '/assets/js/ace')
      editor = window.ace.edit($element[0])
      editor.setFontSize 16
      editor.setOptions
        maxLines: Infinity
      editor.setShowPrintMargin false
      editor.setHighlightActiveLine false
      editor.setTheme('ace/theme/tomorrow-markdown')

      session = editor.getSession()
      session.setUseWrapMode true
      session.setUseSoftTabs true
      session.setTabSize 2
      session.setMode "ace/mode/yaml"

      ngModel.$formatters.push (value) ->
        if angular.isUndefined(value) or value is null or value == ""
          $element.addClass "placeholder"
          return ""
        else if angular.isObject(value) or angular.isArray(value)
          window.logError("ace cannot use an object or an array as a model")
        else
          $element.removeClass "placeholder"
        value

      ngModel.$render = ->
        session.setValue ngModel.$viewValue
        return

      loaded = false
      update = (setValue)->
        viewValue = session.getValue()
        valid = true
        try
          frontMatter = jsyaml.safeLoad viewValue
        catch e
          valid = false
          session.setAnnotations [
            row: e.mark.line
            column: e.mark.column
            text: e.message
            type: "error"
          ]

        ngModel.$setValidity("yaml", valid)

        if valid
          session.clearAnnotations()

          if setValue is true
            $scope.$evalAsync ->
              ngModel.$setViewValue(viewValue)

        # special situation for first load
        if !loaded
          $scope.postForm.$setPristine()
          loaded = true

      promise = null
      onChange = ->
        $timeout.cancel promise if promise?
        promise = $timeout update, 190, true

      session.on "change", onChange

      editor.on "focus", ->
        $element.removeClass "placeholder"

      editor.on "blur", ->
        if session.getValue() == ""
          $element.addClass "placeholder"

        $timeout.cancel promise if promise?
        update(true)


      $element.on "$destroy", ->
        editor.session.$stopWorker()
        editor.destroy()
        return

]

.directive 'postEditor', ["$timeout", "UUID", ($timeout, UUID)->
  restrict:"A"
  require:"?ngModel"
  link:($scope, $element, $attrs, ngModel)->
    return unless ngModel?

    # textarea = $element.prev("textarea")
    # textarea.hide()
    window.ace.config.set('basePath', '/assets/js/ace')
    editor = window.ace.edit($element[0])
    editor.setFontSize 16
    editor.setOptions
      maxLines: Infinity
    editor.setShowPrintMargin false
    editor.setHighlightActiveLine false
    editor.renderer.setShowGutter false
    editor.renderer.setPadding 0
#    editor.renderer.setPrimtMarginColumn 60
    editor.setTheme('ace/theme/tomorrow-markdown')

    session = editor.getSession()
    session.setUseWrapMode true
    session.setUseSoftTabs true
    session.setTabSize 2
    session.setMode "ace/mode/markdown"
    session.setWrapLimitRange 74,74

    ngModel.$formatters.push (value) ->
      if angular.isUndefined(value) or value is null or value == ""
        $element.addClass "placeholder"
        return ""
      else if angular.isObject(value) or angular.isArray(value)
        window.logError("ace cannot use an object or an array as a model")
      else
        $element.removeClass "placeholder"
      value

    ngModel.$render = ->
      session.setValue ngModel.$viewValue
      return

    loaded = false
    update = ->
      viewValue = session.getValue()
      ngModel.$setViewValue(viewValue)
      if !loaded
        $scope.postForm.$setPristine()
        loaded = true

    promise = null
    onChange = ->
      $timeout.cancel promise if promise?
      promise = $timeout update, 190, true

    session.on "change", onChange

    editor.on "focus", ->
      $element.removeClass "placeholder"

    editor.on "blur", ->
      if session.getValue() == ""
        $element.addClass "placeholder"

    $element.on "$destroy", ->
      editor.session.$stopWorker()
      editor.destroy()
      return

    # Key binding

    editor.commands.addCommand
      name: "save"
      bindKey:
        win: "Ctrl-S"
        mac: "Command-S"

      exec: (editor) ->
        if $scope.postForm.$dirty
          $scope.$evalAsync ->
            $scope.save()


    # File upload
    groups = []

    opts =
      dragClass: "drag"
      accept: 'image/*'
      readAsMap:
        "image/*": "BinaryString"

      readAsDefault: "BinaryString"
      on:
        beforestart: (e, file) ->
          #todo: limit file size

        load: (e, file) ->

          uuid = UUID()

          # insert mark
          text = "![image](<uploading-#{uuid}>)"
          position = editor.getCursorPosition()
          if position.column != 0
            text = '\n' + text + '\n'
          else
            text = text + '\n'
          editor.insert text

          postdate = $scope.filepath.match(/\d{4}-\d{2}-\d{2}/)
          path = "assets/post-images/" + postdate + '-' + uuid + '.' + file.extra.extension


          groupID = file.extra.groupID
          groups[groupID].files[path]=
            isBase64: true
            content: e.target.result

          groups[groupID].uuids[uuid] = path

        error: (e, file) ->
          console.error file.name + " error: " + e.toString()

        skip: (file) ->
          console.warn file.name + " skipped"

        groupstart: (group) ->
          groups[group.groupID] =
            files: {}
            uuids: {}

        groupend: (group) ->
          $scope.uploader.add groups[group.groupID]
          .then (uuids)->
            position = editor.getCursorPosition()

            for uuid, path of uuids
              reg = new RegExp("!\\[(\\w*)\\]\\(<uploading-#{uuid}>\\)")
              editor.replace "![$1](#{path})", needle:reg

            editor.clearSelection()
            editor.moveCursorToPosition position
          , (err)->
            window.logError "upload image failed"
            uuids = err.uuids
            position = editor.getCursorPosition()

            for uuid, path of uuids
              reg = new RegExp("!\\[(\\w*)\\]\\(<uploading-#{uuid}>\\)")
              editor.replace "(!image upload failed)", needle:reg

            editor.clearSelection()
            editor.moveCursorToPosition position

          groups[group.id] = null

    $(document.body).fileReaderJS(opts);
    $element.fileClipboard(opts);

    # Make bold titles...
    ((self) ->
      checkLine = (currentLine) ->
        line = self.lines[currentLine]
        if line.length isnt 0
          if line[0].type.indexOf("markup.heading.multi") is 0
            self.lines[currentLine - 1].forEach (previousLineObject) ->
              previousLineObject.type = "markup.heading"
              return

        return
      customWorker = ->

        # Duplicate from background_tokenizer.js
        return  unless self.running
        workerStart = new Date()
        currentLine = self.currentLine
        endLine = -1
        doc = self.doc
        currentLine++  while self.lines[currentLine]
        startLine = currentLine
        len = doc.getLength()
        processedLines = 0
        self.running = false
        while currentLine < len
          self.$tokenizeRow currentLine
          endLine = currentLine
          loop
            checkLine currentLine # benweet
            currentLine++
            break unless self.lines[currentLine]

          # only check every 5 lines
          processedLines++
          if (processedLines % 5 is 0) and (new Date() - workerStart) > 20
            self.running = setTimeout(customWorker, 20) # benweet
            self.currentLine = currentLine
            return
        self.currentLine = currentLine
        self.fireUpdateEvent startLine, endLine  if startLine <= endLine
        return
      self.$worker = ->
        self.lines.splice 0, self.lines.length
        self.states.splice 0, self.states.length
        self.currentLine = 0
        customWorker()
        return

      return
    )(editor.session.bgTokenizer)

    return
]

.directive "customInput", [->
  restrict:"A"
  require:"?ngModel"
  link:($scope, $element, $attrs, ngModel)->
    return unless ngModel?

    $element.prop("contenteditable", true)
    $element.prop("spellcheck", true)

    ngModel.$render = ->
      $element.text ngModel.$viewValue || ''
      return

    $element
    .on "keydown", (e)->
      if e.keyCode == 13
        e.preventDefault()
      return
    .on "blur keyup change", ->
      $scope.$evalAsync()
    .on "input", ->
      ngModel.$setViewValue($element.text().replace(/[\n\r]/g, " "))
      return

    return
]

.directive "switch", [->
  restrict:"E"
  require:"?ngModel"
  scope:
    value:'=ngModel'
  replace:true
  template:"""
    <div class="btn-group">
      <button type="button" class="btn" ng-click="value = false" ng-class="{'btn-default':value, 'btn-primary active':!value}">Draft</button>
      <button type="button" class="btn" ng-click="value = true" ng-class="{'btn-default':!value, 'btn-primary active':value}">Public</button>
    </div>
  """
  link:($scope, $element, $attr, ngModel)->
    $scope.$watch "value", (value, old)->
      if value? and old? and value isnt old
        ngModel.$setViewValue(value)
      return

    return

]