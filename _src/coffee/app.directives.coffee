angular.module "easyblog"

.directive "blogList", [->
  restrict: "A"
  templateUrl: "templates/blog-list.html"
  controller: "BlogListController"
]

.directive "post", ["$timeout", ($timeout)->
  restrict: "A"
  templateUrl: "templates/editor.html"
  require: "?ngModel"
  scope:true
  link:($scope, $element, $attr, ngModel)->
    return unless ngModel?

    ymlReg = /^(?:---\n)((?:.|\n)*?)\n---\n/

    ngModel.$formatters.push (modelValue)->

      if modelValue?
        frontMatter = null

        content = modelValue.replace ymlReg, (match, yml)->
          try
            frontMatter = jsyaml.safeLoad yml
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
      $scope.$evalAsync ->
        ngModel.$setViewValue(viewValue)

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

.directive 'editor', ["$timeout", ($timeout)->
  restrict:"EA"
  require:"?ngModel"
  link:($scope, $element, $attrs, ngModel)->
    return unless ngModel?

    textarea = $element.prev("textarea")
    textarea.hide()

    editor = window.ace.edit($element[0])
    editor.setTheme "ace/theme/tomorrow"
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
      if angular.isUndefined(value) or value is null
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

    update = ->
      viewValue = session.getValue()
      $scope.$evalAsync ->
        ngModel.$setViewValue(viewValue)

    promise = null
    onChange = ->
      $timeout.cancel promise if promise?
      promise = $timeout update, 190, true

    session.on "change", onChange

    $element.on "$destroy", ->
      editor.session.$stopWorker()
      editor.destroy()
      return
]