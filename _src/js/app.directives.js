app.directive("blogList", [
  function() {
    return {
      restrict: "A",
      templateUrl: "templates/blog-list.html"
    };
  }
]).directive("post", [
  "$timeout", function($timeout) {
    return {
      restrict: "A",
      templateUrl: "templates/editor.html",
      require: "?ngModel",
      link: function($scope, $element, $attr, ngModel) {
        var promise, update, ymlReg;
        if (ngModel == null) {
          return;
        }
        ymlReg = /^(?:---\r?\n)((?:.|\r?\n)*?)\r?\n---\r?\n/;
        $scope.advanced = false;
        ngModel.$formatters.push(function(modelValue) {
          var content, frontMatterRaw;
          if (modelValue != null) {
            frontMatterRaw = "";
            content = modelValue.replace(ymlReg, function(match, yml) {
              frontMatterRaw = yml;
              return '';
            });
            $scope.$evalAsync(function() {
              $scope.frontMatterRaw = frontMatterRaw;
              return $scope.content = content;
            });
          }
          return modelValue;
        });
        update = function() {
          var viewValue;
          viewValue = ("---\n" + $scope.frontMatterRaw + "\n---\n") + $scope.content;
          return ngModel.$setViewValue(viewValue);
        };
        promise = null;
        $scope.$watch('content', function(data, oldData) {
          if ((data != null) && (oldData != null) && data !== oldData) {
            if (promise != null) {
              $timeout.cancel(promise);
            }
            return promise = $timeout(update, 10);
          }
        });
        $scope.$watch('frontMatterRaw', function(data, oldData) {
          if ((data != null) && (oldData != null) && data !== oldData) {
            if (promise != null) {
              $timeout.cancel(promise);
            }
            return promise = $timeout(update, 10);
          }
        });
        angular.element(window).on("keydown", function(event) {
          if (event.ctrlKey || event.metaKey) {
            switch (String.fromCharCode(event.which).toLowerCase()) {
              case "s":
                event.preventDefault();
                if ($scope.postForm.$dirty) {
                  return $scope.$evalAsync(function() {
                    return $scope.save();
                  });
                }
            }
          }
        });
      }
    };
  }
]).directive("frontmatterRaw", [
  "$timeout", function($timeout) {
    return {
      restrict: "A",
      require: "?ngModel",
      link: function($scope, $element, $attr, ngModel) {
        var promise, update;
        if (ngModel == null) {
          return;
        }
        ngModel.$formatters.push(function(modelValue) {
          var e, frontMatter;
          if (modelValue != null) {
            frontMatter = null;
            try {
              frontMatter = jsyaml.safeLoad(modelValue);
              if (frontMatter.published == null) {
                frontMatter.published = true;
              }
            } catch (_error) {
              e = _error;
              console.warn(e.toString());
            }
            $scope.$evalAsync(function() {
              return $scope.frontMatter = frontMatter;
            });
          }
          return modelValue;
        });
        update = function() {
          var yml;
          yml = jsyaml.safeDump($scope.frontMatter, {
            skipInvalid: true
          });
          return ngModel.$setViewValue(yml);
        };
        promise = null;
        $scope.$watchCollection('frontMatter', function(data, oldData) {
          if ((data != null) && (oldData != null) && data !== oldData) {
            if (promise != null) {
              $timeout.cancel(promise);
            }
            return promise = $timeout(update, 200);
          }
        });
      }
    };
  }
]).directive('frontmatterEditor', [
  "$timeout", function($timeout) {
    return {
      restrict: "A",
      require: "?ngModel",
      link: function($scope, $element, $attrs, ngModel) {
        var editor, loaded, onChange, promise, session, update;
        if (ngModel == null) {
          return;
        }
        window.ace.config.set('basePath', '/assets/js/ace');
        editor = window.ace.edit($element[0]);
        editor.setFontSize(16);
        editor.setOptions({
          maxLines: Infinity
        });
        editor.setShowPrintMargin(false);
        editor.setHighlightActiveLine(false);
        editor.setTheme('ace/theme/tomorrow-markdown');
        session = editor.getSession();
        session.setUseWrapMode(true);
        session.setUseSoftTabs(true);
        session.setTabSize(2);
        session.setMode("ace/mode/yaml");
        ngModel.$formatters.push(function(value) {
          if (angular.isUndefined(value) || value === null || value === "") {
            $element.addClass("placeholder");
            return "";
          } else if (angular.isObject(value) || angular.isArray(value)) {
            window.logError("ace cannot use an object or an array as a model");
          } else {
            $element.removeClass("placeholder");
          }
          return value;
        });
        ngModel.$render = function() {
          session.setValue(ngModel.$viewValue);
        };
        loaded = false;
        update = function(setValue) {
          var e, frontMatter, valid, viewValue;
          viewValue = session.getValue();
          valid = true;
          try {
            frontMatter = jsyaml.safeLoad(viewValue);
          } catch (_error) {
            e = _error;
            valid = false;
            session.setAnnotations([
              {
                row: e.mark.line,
                column: e.mark.column,
                text: e.message,
                type: "error"
              }
            ]);
          }
          ngModel.$setValidity("yaml", valid);
          if (valid) {
            session.clearAnnotations();
            if (setValue === true) {
              $scope.$evalAsync(function() {
                return ngModel.$setViewValue(viewValue);
              });
            }
          }
          if (!loaded) {
            $scope.postForm.$setPristine();
            return loaded = true;
          }
        };
        promise = null;
        onChange = function() {
          if (promise != null) {
            $timeout.cancel(promise);
          }
          return promise = $timeout(update, 190, true);
        };
        session.on("change", onChange);
        editor.on("focus", function() {
          return $element.removeClass("placeholder");
        });
        editor.on("blur", function() {
          if (session.getValue() === "") {
            $element.addClass("placeholder");
          }
          if (promise != null) {
            $timeout.cancel(promise);
          }
          return update(true);
        });
        return $element.on("$destroy", function() {
          editor.session.$stopWorker();
          editor.destroy();
        });
      }
    };
  }
]).directive('postEditor', [
  "$timeout", "UUID", function($timeout, UUID) {
    return {
      restrict: "A",
      require: "?ngModel",
      link: function($scope, $element, $attrs, ngModel) {
        var editor, groups, loaded, onChange, opts, promise, session, update;
        if (ngModel == null) {
          return;
        }
        window.ace.config.set('basePath', '/assets/js/ace');
        editor = window.ace.edit($element[0]);
        editor.setFontSize(16);
        editor.setOptions({
          maxLines: Infinity
        });
        editor.setShowPrintMargin(false);
        editor.setHighlightActiveLine(false);
        editor.renderer.setShowGutter(false);
        editor.renderer.setPadding(0);
        editor.setTheme('ace/theme/tomorrow-markdown');
        session = editor.getSession();
        session.setUseWrapMode(true);
        session.setUseSoftTabs(true);
        session.setTabSize(2);
        session.setMode("ace/mode/markdown");
        session.setWrapLimitRange(74, 74);
        ngModel.$formatters.push(function(value) {
          if (angular.isUndefined(value) || value === null || value === "") {
            $element.addClass("placeholder");
            return "";
          } else if (angular.isObject(value) || angular.isArray(value)) {
            window.logError("ace cannot use an object or an array as a model");
          } else {
            $element.removeClass("placeholder");
          }
          return value;
        });
        ngModel.$render = function() {
          session.setValue(ngModel.$viewValue);
        };
        loaded = false;
        update = function() {
          var viewValue;
          viewValue = session.getValue();
          ngModel.$setViewValue(viewValue);
          if (!loaded) {
            $scope.postForm.$setPristine();
            return loaded = true;
          }
        };
        promise = null;
        onChange = function() {
          if (promise != null) {
            $timeout.cancel(promise);
          }
          return promise = $timeout(update, 190, true);
        };
        session.on("change", onChange);
        editor.on("focus", function() {
          return $element.removeClass("placeholder");
        });
        editor.on("blur", function() {
          if (session.getValue() === "") {
            return $element.addClass("placeholder");
          }
        });
        $element.on("$destroy", function() {
          editor.session.$stopWorker();
          editor.destroy();
        });
        editor.commands.addCommand({
          name: "save",
          bindKey: {
            win: "Ctrl-S",
            mac: "Command-S"
          },
          exec: function(editor) {
            if ($scope.postForm.$dirty) {
              return $scope.$evalAsync(function() {
                return $scope.save();
              });
            }
          }
        });
        groups = [];
        opts = {
          dragClass: "drag",
          accept: 'image/*',
          readAsMap: {
            "image/*": "BinaryString"
          },
          readAsDefault: "BinaryString",
          on: {
            beforestart: function(e, file) {},
            load: function(e, file) {
              var groupID, path, position, postdate, text, uuid;
              uuid = UUID();
              text = "![image](<uploading-" + uuid + ">)";
              position = editor.getCursorPosition();
              if (position.column !== 0) {
                text = '\n' + text + '\n';
              } else {
                text = text + '\n';
              }
              editor.insert(text);
              postdate = $scope.filepath.match(/\d{4}-\d{2}-\d{2}/);
              path = "assets/post-images/" + postdate + '-' + uuid + '.' + file.extra.extension;
              groupID = file.extra.groupID;
              groups[groupID].files[path] = {
                isBase64: true,
                content: e.target.result
              };
              return groups[groupID].uuids[uuid] = path;
            },
            error: function(e, file) {
              return console.error(file.name + " error: " + e.toString());
            },
            skip: function(file) {
              return console.warn(file.name + " skipped");
            },
            groupstart: function(group) {
              return groups[group.groupID] = {
                files: {},
                uuids: {}
              };
            },
            groupend: function(group) {
              $scope.uploader.add(groups[group.groupID]).then(function(uuids) {
                var path, position, reg, uuid;
                position = editor.getCursorPosition();
                for (uuid in uuids) {
                  path = uuids[uuid];
                  reg = new RegExp("!\\[(\\w*)\\]\\(<uploading-" + uuid + ">\\)");
                  editor.replace("![$1](" + path + ")", {
                    needle: reg
                  });
                }
                editor.clearSelection();
                return editor.moveCursorToPosition(position);
              }, function(err) {
                var path, position, reg, uuid, uuids;
                window.logError("upload image failed");
                uuids = err.uuids;
                position = editor.getCursorPosition();
                for (uuid in uuids) {
                  path = uuids[uuid];
                  reg = new RegExp("!\\[(\\w*)\\]\\(<uploading-" + uuid + ">\\)");
                  editor.replace("(!image upload failed)", {
                    needle: reg
                  });
                }
                editor.clearSelection();
                return editor.moveCursorToPosition(position);
              });
              return groups[group.id] = null;
            }
          }
        };
        FileReaderJS.setupDrop(document.body, opts);
        FileReaderJS.setupClipboard($element[0], opts);
        (function(self) {
          var checkLine, customWorker;
          checkLine = function(currentLine) {
            var line;
            line = self.lines[currentLine];
            if (line.length !== 0) {
              if (line[0].type.indexOf("markup.heading.multi") === 0 && currentLine >=1) {
                self.lines[currentLine - 1].forEach(function(previousLineObject) {
                  previousLineObject.type = "markup.heading";
                });
              }
            }
          };
          customWorker = function() {
            var currentLine, doc, endLine, len, processedLines, startLine, workerStart;
            if (!self.running) {
              return;
            }
            workerStart = new Date();
            currentLine = self.currentLine;
            endLine = -1;
            doc = self.doc;
            while (self.lines[currentLine]) {
              currentLine++;
            }
            startLine = currentLine;
            len = doc.getLength();
            processedLines = 0;
            self.running = false;
            while (currentLine < len) {
              self.$tokenizeRow(currentLine);
              endLine = currentLine;
              while (true) {
                checkLine(currentLine);
                currentLine++;
                if (!self.lines[currentLine]) {
                  break;
                }
              }
              processedLines++;
              if ((processedLines % 5 === 0) && (new Date() - workerStart) > 20) {
                self.running = setTimeout(customWorker, 20);
                self.currentLine = currentLine;
                return;
              }
            }
            self.currentLine = currentLine;
            if (startLine <= endLine) {
              self.fireUpdateEvent(startLine, endLine);
            }
          };
          self.$worker = function() {
            self.lines.splice(0, self.lines.length);
            self.states.splice(0, self.states.length);
            self.currentLine = 0;
            customWorker();
          };
        })(editor.session.bgTokenizer);
      }
    };
  }
]).directive("customInput", [
  function() {
    return {
      restrict: "A",
      require: "?ngModel",
      link: function($scope, $element, $attrs, ngModel) {
        if (ngModel == null) {
          return;
        }
        $element.prop("contenteditable", true);
        $element.prop("spellcheck", true);
        ngModel.$render = function() {
          $element.text(ngModel.$viewValue || '');
        };
        $element.on("keydown", function(e) {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        }).on("blur keyup change", function() {
          return $scope.$evalAsync();
        }).on("input", function() {
          ngModel.$setViewValue($element.text().replace(/[\n\r]/g, " "));
        });
      }
    };
  }
]).directive("switch", [
  function() {
    return {
      restrict: "E",
      require: "?ngModel",
      scope: {
        value: '=ngModel'
      },
      replace: true,
      template: "<div class=\"btn-group\">\n  <button type=\"button\" class=\"btn\" ng-click=\"value = false\" ng-class=\"{'btn-default':value, 'btn-primary active':!value}\">Draft</button>\n  <button type=\"button\" class=\"btn\" ng-click=\"value = true\" ng-class=\"{'btn-default':!value, 'btn-primary active':value}\">Public</button>\n</div>",
      link: function($scope, $element, $attr, ngModel) {
        $scope.$watch("value", function(value, old) {
          if ((value != null) && (old != null) && value !== old) {
            ngModel.$setViewValue(value);
          }
        });
      }
    };
  }
]);