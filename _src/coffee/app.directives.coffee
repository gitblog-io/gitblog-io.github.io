angular.module "easyblog"

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

    ngModel.$formatters.push (modelValue)->

      if modelValue?
        frontMatter = null

        content = modelValue.replace ymlReg, (match, yml)->
          try
            frontMatter = jsyaml.safeLoad yml
            if !frontMatter.published? then frontMatter.published = true
          catch e
            console.error e

          return ''

        $scope.$evalAsync ->
          $scope.frontMatter = frontMatter
          $scope.content = content

      return modelValue

    update = ->
      yml = jsyaml.safeDump $scope.frontMatter, skipInvalid: true
      frontMatter = "---\n#{yml}---\n"
      content = $scope.content
      viewValue = frontMatter + content
      ngModel.$setViewValue(viewValue)
      $scope.$apply()

    promise = null
    $scope.$watch 'content', (data, oldData)->
      if data? and oldData? and data isnt oldData
        $timeout.cancel promise if promise?
        promise = $timeout update, 10

    $scope.$watchCollection 'frontMatter', (data, oldData)->
      if data? and oldData?
        $timeout.cancel promise if promise?
        promise = $timeout update, 200

]

.directive 'editor', ["$timeout", "UUID", ($timeout, UUID)->
  restrict:"EA"
  require:"?ngModel"
  link:($scope, $element, $attrs, ngModel)->
    return unless ngModel?

    # textarea = $element.prev("textarea")
    # textarea.hide()

    editor = window.ace.edit($element[0])
    editor.setFontSize 16
    editor.setOptions
      maxLines: Infinity
    editor.setShowPrintMargin false
    editor.setHighlightActiveLine false
    editor.renderer.setShowGutter false

    session = editor.getSession()
    session.setUseWrapMode true
    session.setMode "ace/mode/markdown"

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

    ngModel.$formatters.push (value) ->
      if angular.isUndefined(value) or value is null or value == ""
        $element.addClass "placeholder"
        return ""
      else if angular.isObject(value) or angular.isArray(value)
        throw new Error("ace cannot use an object or an array as a model")
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

    groups = {}

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
          console.errpr file.name + " error: " + e.toString()

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
          groups[group.id] = null

    $(document.body).fileReaderJS(opts);
    $element.fileClipboard(opts);

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
      $scope.$apply()
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