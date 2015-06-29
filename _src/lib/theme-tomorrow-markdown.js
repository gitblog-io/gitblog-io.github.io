/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

ace.define('ace/theme/tomorrow-markdown', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-tomorrow-markdown";
exports.cssText = ".ace-tomorrow-markdown .ace_gutter {\
background: #f6f6f6;\
color: #4D4D4C\
}\
.ace-tomorrow-markdown .ace_print-margin {\
width: 1px;\
background: #f6f6f6\
}\
.ace-tomorrow-markdown {\
background-color: transparent;\
color: #4D4D4C;\
font-family: 'Menlo', 'Ubuntu Mono', 'Consolas', monospace!important;\
}\
.ace-tomorrow-markdown .ace_cursor {\
color: #AEAFAD\
}\
.ace-tomorrow-markdown .ace_marker-layer .ace_selection {\
background: #D6D6D6\
}\
.ace-tomorrow-markdown.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #FFFFFF;\
border-radius: 2px\
}\
.ace-tomorrow-markdown .ace_marker-layer .ace_step {\
background: rgb(255, 255, 0)\
}\
.ace-tomorrow-markdown .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #D1D1D1\
}\
.ace-tomorrow-markdown .ace_marker-layer .ace_active-line {\
background: #EFEFEF\
}\
.ace-tomorrow-markdown .ace_gutter-active-line {\
background-color : #dcdcdc\
}\
.ace-tomorrow-markdown .ace_marker-layer .ace_selected-word {\
border: 1px solid #D6D6D6\
}\
.ace-tomorrow-markdown .ace_invisible {\
color: #D1D1D1\
}\
.ace-tomorrow-markdown .ace_keyword,\
.ace-tomorrow-markdown .ace_meta,\
.ace-tomorrow-markdown .ace_storage,\
.ace-tomorrow-markdown .ace_storage.ace_type,\
.ace-tomorrow-markdown .ace_support.ace_type {\
color: #8959A8\
}\
.ace-tomorrow-markdown .ace_keyword.ace_operator {\
color: #3E999F\
}\
.ace-tomorrow-markdown .ace_constant.ace_character,\
.ace-tomorrow-markdown .ace_constant.ace_language,\
.ace-tomorrow-markdown .ace_constant.ace_numeric,\
.ace-tomorrow-markdown .ace_keyword.ace_other.ace_unit,\
.ace-tomorrow-markdown .ace_support.ace_constant,\
.ace-tomorrow-markdown .ace_variable.ace_parameter {\
color: #F5871F\
}\
.ace-tomorrow-markdown .ace_constant.ace_other {\
color: #666969\
}\
.ace-tomorrow-markdown .ace_invalid {\
color: #FFFFFF;\
background-color: #C82829\
}\
.ace-tomorrow-markdown .ace_invalid.ace_deprecated {\
color: #FFFFFF;\
background-color: #8959A8\
}\
.ace-tomorrow-markdown .ace_fold {\
background-color: #4271AE;\
border-color: #4D4D4C\
}\
.ace-tomorrow-markdown .ace_entity.ace_name.ace_function,\
.ace-tomorrow-markdown .ace_support.ace_function,\
.ace-tomorrow-markdown .ace_variable {\
color: #4271AE\
}\
.ace-tomorrow-markdown .ace_support.ace_class,\
.ace-tomorrow-markdown .ace_support.ace_type {\
color: #C99E00\
}\
.ace-tomorrow-markdown .ace_heading,\
.ace-tomorrow-markdown .ace_markup.ace_heading{\
  color: #000;\
}\
.ace-tomorrow-markdown .ace_string {\
color: #718C00\
}\
.ace-tomorrow-markdown .ace_entity.ace_name.ace_tag,\
.ace-tomorrow-markdown .ace_entity.ace_other.ace_attribute-name,\
.ace-tomorrow-markdown .ace_meta.ace_tag,\
.ace-tomorrow-markdown .ace_string.ace_regexp,\
.ace-tomorrow-markdown .ace_variable {\
color: #C82829\
}\
.ace-tomorrow-markdown .ace_comment {\
color: #8E908C\
}\
.ace-tomorrow-markdown .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bdu3f/BwAlfgctduB85QAAAABJRU5ErkJggg==) right repeat-y\
}\
.ace-tomorrow-markdown .ace_heading,\
.ace-tomorrow-markdown .ace_strong{\
  font-weight:bold;\
}\
.ace-tomorrow-markdown .ace_emphasis{\
  font-style: italic;\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
