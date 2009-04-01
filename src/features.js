  /*-------------------------------- FEATURES --------------------------------*/

  (function() {
    function createTester(cache) {
      function Tester() {
        var name, o = Tester._object, i = 0;
      	while (name = arguments[i++]) {
          if (typeof o[name] === 'function')
            o[name] = o[name]();
          if (o[name] !== true)
            return false;
        }
        return true;
      };

      Tester.set = function(name, value) {
        var o = this._object;
        if (typeof name === 'object'){
          for (var i in name) o[i] = name[i];
        } else o[name] = value;
      };

      Tester.unset = function(name) {
        var o = this._object;
        if (typeof name === 'string') delete o[name];
        else {
          for (var i in name) delete o[i];
        }
      };

      Tester._object = cache || { };
      return Tester;
    }

    Bug = Fuse.Browser.Bug = createTester();
    Feature = Fuse.Browser.Feature = createTester();
  })();

  Feature.set({
    'CREATE_ELEMENT_WITH_HTML': function() {
      try { // true for IE
        var div = Fuse._doc.createElement('<div id="x">');
        return div.id === 'x';
      } catch(e) {
        return false;
      }
    },

    'DOCUMENT_ALL_COLLECTION': function() {
      // true for all but Firefox
       isHostObject(Fuse._doc, 'all');
    },

    'DOCUMENT_CREATE_EVENT': function() {
      // true for all but IE
      return isHostObject(Fuse._doc, 'createEvent');
    },

    'DOCUMENT_CREATE_EVENT_OBJECT': function() {
      // true for IE
      return isHostObject(Fuse._doc, 'createEventObject')
    },

    'DOCUMENT_RANGE': function(){
      // true for all but IE
      return isHostObject(Fuse._doc, 'createRange');
    },

    'DOCUMENT_RANGE_CREATE_CONTEXTUAL_FRAGMENT': function() {
      if (Feature('DOCUMENT_RANGE'))
        return isHostObject(Fuse._doc.createRange, 'createContextualFragment');
    },

    'DOCUMENT_STYLE_SHEETS_COLLECTION': function() {
      // true for all so far
      return isHostObject(Fuse._doc, 'styleSheets');
    },

    'ELEMENT_ADD_EVENT_LISTENER': function() {
      // true for all but IE
      return isHostObject(Fuse._doc, 'addEventListener');
    },

    'ELEMENT_ATTACH_EVENT': function() {
      // true for IE
      return isHostObject(Fuse._doc, 'attachEvent') &&
        !Feature('ELEMENT_ADD_EVENT_LISTENER');
    },

    'ELEMENT_BOUNDING_CLIENT_RECT': function() {
      // true for IE, Firefox 3
      return isHostObject(Fuse._docEl, 'getBoundingClientRect');
    },

    'ELEMENT_CLASS': function() {
      // true for all but Safari 2 and IE7-
      return isHostObject(global, 'Element') &&
        isHostObject(global.Element, 'prototype');
    },

    'ELEMENT_COMPUTED_STYLE': function() {
      // true for all but IE
      return isHostObject(Fuse._doc, 'defaultView') &&
        isHostObject(Fuse._doc.defaultView, 'getComputedStyle');
    },

    'ELEMENT_COMPARE_DOCUMENT_POSITION': function() {
      // true for Firefox and Opera 9.5+
      return isHostObject(Fuse._docEl, 'compareDocumentPosition');
    },

    'ELEMENT_CURRENT_STYLE': function() {
      // true for IE
      return isHostObject(Fuse._docEl, 'currentStyle') &&
        !Feature('ELEMENT_COMPUTED_STYLE');
    },

    'ELEMENT_DISPATCH_EVENT': function() {
      // true for all but IE
      return isHostObject(Fuse._docEl, 'dispatchEvent');
    },

    'ELEMENT_DO_SCROLL': function() {
      // true for IE
      return isHostObject(Fuse._docEl, 'doScroll');
    },

    'ELEMENT_EXTENSIONS': function() {
      // true for all but Safari 2 and IE7-
      return Feature('HTML_ELEMENT_CLASS') || Feature('ELEMENT_CLASS');
    },

    'ELEMENT_FIRE_EVENT': function() {
      // true for IE
      return isHostObject(Fuse._docEl, 'fireEvent');
    },

    'ELEMENT_GET_ATTRIBUTE_IFLAG': function() {
      // true for IE
      var div = Fuse._div, result = false;
      try {
        div.setAttribute('align', 'center'); div.setAttribute('aLiGn', 'left');
        result = (div.getAttribute('aLiGn') === 'center' &&
          div.getAttribute('aLiGn', 1) === 'left');
        div.removeAttribute('align'); div.removeAttribute('aLiGn');
      } catch(e) { }
      return result;
    },

    'ELEMENT_INNER_TEXT': function() {
      // true for IE
      return !Feature('ELEMENT_TEXT_CONTENT') &&
        typeof Fuse._div.innerText === 'string';
    },

    'ELEMENT_MS_CSS_FILTERS': function() {
      // true for IE
      return isHostObject(Fuse._docEl, 'filters') &&
        typeof Fuse._docEl.style.filter === 'string';
    },

    'ELEMENT_REMOVE_NODE': function() {
      // true for IE
      return isHostObject(Fuse._docEl, 'removeNode');
    },

    'ELEMENT_SOURCE_INDEX': function() {
      // true for IE and Opera
      return typeof Fuse._docEl.sourceIndex === 'number';
    },

    'ELEMENT_SPECIFIC_EXTENSIONS': function() {
      var docEl = Fuse._docEl, result = false;
      if (isHostObject(global, 'HTMLHtmlElement') &&
          isHostObject(global.HTMLHtmlElement, 'prototype') &&
         (docEl.constructor === HTMLHtmlElement || 
          docEl instanceof HTMLHtmlElement || Feature('OBJECT_PROTO') &&
          docEl['__proto__'] === HTMLHtmlElement.prototype)) {
        result = true;
      } else result = Feature('EMULATE_ELEMENT_CLASSES_WITH_PROTO');

      // TODO: Remove this browser sniff
      return Fuse.Browser.Agent.MobileSafari ? false : result;
    },

    'ELEMENT_TEXT_CONTENT': function() {
      // true for all but IE and Safari 2
      return typeof Fuse._div.textContent === 'string';
    },

    'EMULATE_ELEMENT_CLASSES_WITH_PROTO': function() {
      return Feature('OBJECT_PROTO') &&
        Fuse._div['__proto__'] !== Fuse._docEl['__proto__'];
    },

    'FUNCTION_TO_STRING_RETURNS_SOURCE': function() {
      // true for all but some mobile browsers
      function toStringTest(param1, param2) { var x = 1 }
      var source = toStringTest.toString();
      return source.indexOf('param1') > -1 && source.indexOf('x = 1') > -1;
    },

    'HTML_ELEMENT_CLASS': function() {
      // true for all but IE
      // (Safari 2 support is emulated in element.js)
      return isHostObject(global,'HTMLElement') &&
        isHostObject(global.HTMLElement, 'prototype');
    },

    'OBJECT_PROTO': function() {
      // true for Gecko and Webkit
      return isHostObject(Fuse._docEl, '__proto__') &&
        [ ]['__proto__'] === Array.prototype  &&
        { }['__proto__'] === Object.prototype;
    },

    'SELECTORS_API': function() {
      // true for IE8, WebKit (Safari 3, Chrome)
      var doc = Fuse._doc, docEl = Fuse._docEl;
      return isHostObject(doc, 'querySelector') &&
        isHostObject(doc,   'querySelectorAll') &&
        isHostObject(docEl, 'querySelector')    &&
        isHostObject(docEl, 'querySelectorAll');
    },

    'XPATH': function() {
      // true for all but IE
      return isHostObject(Fuse._doc, 'evaluate') &&
        isHostObject(global, 'XPathResult') &&
        typeof XPathResult.ORDERED_NODE_SNAPSHOT_TYPE === 'number';
    }
  });

  (function() {
    var div = Fuse._div, docEl = Fuse._docEl,
     // true for IE, Safari 3, Opera, Firefox 3+
     ELEMENT_CHILDREN_NODELIST = isHostObject(docEl, 'children'),
     // true for all but IE and Safari 2
     ELEMENT_CONTAINS = isHostObject(docEl, 'contains');

    div.innerHTML = '<div></div><div><div></div></div>';

    // ensure children collection only contains direct descendants
    if (ELEMENT_CHILDREN_NODELIST)
      ELEMENT_CHILDREN_NODELIST = div.children.length === div.childNodes.length;

    // ensure element.contains() returns the correct results;
    if (ELEMENT_CONTAINS)
      ELEMENT_CONTAINS = !div.firstChild.contains(div.childNodes[1].firstChild);

    div.innerHTML = '';

    Feature.set({
      'ELEMENT_CHILDREN_NODELIST': ELEMENT_CHILDREN_NODELIST,
      'ELEMENT_CONTAINS':          ELEMENT_CONTAINS
    });
  })();

  /*---------------------------------- BUGS ----------------------------------*/

  Bug.set({
    'ARRAY_CONCAT_ARGUMENTS_BUGGY': function() {
      // true for Opera
      return (function() { return Array.prototype.concat &&
        [].concat(arguments).length === 2 })(1, 2);
    },

    'ATTRIBUTE_NODES_PERSIST_ON_CLONED_ELEMENTS': function() {
      // true for IE
      var node, clone, div = Fuse._div;
      (node = document.createAttribute('name')).value = 'x';
      div.setAttributeNode(node);
      (clone = div.cloneNode(false)).setAttribute('name', 'y');
      div.removeAttribute('name');
      return (node = clone.getAttributeNode('name')) && node.value === 'x';
    },

    'BODY_ACTING_AS_ROOT': function() {
      // true for IE Quirks, Opera 9.25
      var body = Fuse._body, div = Fuse._div, docEl = Fuse._docEl;
      if (docEl.clientWidth === 0) return true;

      var ds = div.style, bs = body.style, des = docEl.style,
       bsBackup = bs.cssText, desBackup = des.cssText;

      bs.margin  = des.margin = '0';
      bs.height  = des.height = 'auto';
      ds.cssText = 'display:block;height:8500px;';

      body.insertBefore(div, body.firstChild);
      var result = docEl.clientHeight >= 8500;

      // check scroll coords
      var scrollTop = docEl.scrollTop;
      Bug.set('BODY_SCROLL_COORDS_ON_DOCUMENT_ELEMENT',
        ++docEl.scrollTop === scrollTop + 1);
      docEl.scrollTop = scrollTop;

      // cleanup
      body.removeChild(div);
      bs.cssText  = bsBackup;
      des.cssText = desBackup;
      ds.cssText  = '';

      return result;
    },

    'BODY_OFFSETS_INHERIT_ITS_MARGINS': function() {
      // true for Safari
      var body = Fuse._body, bs = body.style, backup = bs.cssText;
      bs.cssText += ';position:absolute;top:0;margin:1px 0 0 0;';
      var result = body.offsetTop === 1;
      bs.cssText = backup;
      return result;
    },

    'ELEMENT_COMPUTED_STYLE_DEFAULTS_TO_ZERO': function() {
      if (Feature('ELEMENT_COMPUTED_STYLE')) {
        // true for Opera
        var result, des = Fuse._docEl.style, backup = des.cssText;
        des.position = 'static';
        des.top = des.left = '';

        var style = Fuse._doc.defaultView.getComputedStyle(Fuse._docEl, null);
        result = (style && style.top === '0px' && style.left === '0px');
        des.cssText = backup;
        return result;
      }
    },

    'ELEMENT_COMPUTED_STYLE_DIMENSIONS_EQUAL_BORDER_BOX': function() {
      if (Feature('ELEMENT_COMPUTED_STYLE')) {
        // true for Opera 9.2x
        var docEl = Fuse._docEl, des = docEl.style, backup = des.paddingBottom;
        des.paddingBottom = '1px';
        var style = Fuse._doc.defaultView.getComputedStyle(docEl, null),
         result = style && (parseInt(style.height) || 0) ===  docEl.offsetHeight;
        des.paddingBottom = backup;
        return result;
      }
    },

    'ELEMENT_COMPUTED_STYLE_HEIGHT_IS_ZERO_WHEN_HIDDEN': function() {
      if (Feature('ELEMENT_COMPUTED_STYLE')) {
        // true for Opera
        var des = Fuse._docEl.style, backup = des.display;
        des.display = 'none';

        // In Safari 2 getComputedStyle() will return null for elements with style display:none
        var style = Fuse._doc.defaultView.getComputedStyle(Fuse._docEl, null),
         result = style && style.height === '0px';

        des.display = backup;
        return result;
      }
    },

    'ELEMENT_COORD_OFFSETS_DONT_INHERIT_ANCESTOR_BORDER_WIDTH': function() {
      // true for all but IE8
      var body = Fuse._body, div = Fuse._div, bs = Fuse._body.style, backup = bs.cssText;
      body.appendChild(div);
      var value = div.offsetLeft;
      bs.cssText += ';border: 1px solid transparent;';
      var result = (value === div.offsetLeft);
      bs.cssText = backup;
      body.removeChild(div);
      return result;
    },

    'ELEMENT_PROPERTIES_ARE_ATTRIBUTES': function() {
      // true for IE
      var div = Fuse._div;
      div[expando] = 'x';
      var result = div.getAttribute(expando) === 'x';
      div.removeAttribute(expando);
      if (typeof div[expando] !== 'undefined')
        delete div[expando];
      return result;
    },

    'ELEMENT_SCRIPT_FAILS_TO_EVAL_TEXT_PROPERTY_ON_INSERT': function() {
      var docEl = Fuse._docEl, element = Fuse._doc.createElement('script');
      element.text = 'Fuse.' + expando +' = true;';
      docEl.insertBefore(element, docEl.firstChild);
      var result = !Fuse[expando];
      docEl.removeChild(element);
      delete Fuse[expando];
      return result;
    },

    'ELEMENT_TABLE_INNERHTML_INSERTS_TBODY': function() {
      // true for IE and Firefox 3
      var div = Fuse._div;
      div.innerHTML = '<table><tr><td></td></tr></table>';
      var result = getNodeName(div.firstChild.firstChild) === 'TBODY';
      div.innerHTML = '';
      return result;
    },

    'REGEXP_WHITESPACE_CHARACTER_CLASS_BUGGY': function() {
      // true for Webkit and IE
      return !!'\x09\x0B\x0C\x20\xA0\x0A\x0D\u2028\u2029\u1680\u180e\u2000-\u200a\u202f\u205f\u3000'
        .replace(/\s+/, '').length;
    },

    'SELECTORS_API_CASE_INSENSITIVE_CLASSNAME': function() {
      // Safari 3 before 3.1.2 treat class names
      // case-insensitively in quirks mode.
      var div = Fuse._div, result = false;
      if (Feature('SELECTORS_API')) {
        div.id = expando;
        div.innerHTML = '<span class="X"></span>';
        result = div.querySelector('#'+ expando +' .x') !== null;
        div.id = div.innerHTML = '';
      }
      return result;
    },

    'STRING_REPLACE_COHERSE_FUNCTION_TO_STRING': function() {
      // true for Safari 2
      var func = function() { return '' };
      return 'a'.replace(/a/, func) === String(func);
    },

    'STRING_REPLACE_BUGGY_WITH_GLOBAL_FLAG_AND_EMPTY_PATTERN': function() {
      // true for Chrome
      var str = 'xy', replacement = function() { return 'o' };
      return !(str.replace(/()/g, 'o') === 'oxoyo' &&
        str.replace(new RegExp('', 'g'), replacement) === 'oxoyo' &&
        str.replace(/(y|)/g, replacement) === 'oxoo');
    },

    'STRING_REPLACE_SETS_REGEXP_LAST_INDEX': function() {
      // true for IE
      var pattern = /x/;
      'oxo'.replace(pattern, '');
      return !!pattern.lastIndex;
    }
  });

  Bug.set((function() {
    function createInnerHTMLTest(source, innerHTML, targetNode) {
      return function() {
        var div = Fuse._div, result = true;
        div.innerHTML = source;
        var element = div.firstChild;
        if (targetNode) element = element.getElementsByTagName(targetNode)[0];
        try {
          result = (element.innerHTML = innerHTML) &&
            element.innerHTML.toLowerCase() !== innerHTML;
        } catch(e) { }
        div.innerHTML = '';
        return result;
      };
    }

    return {
      'ELEMENT_COLGROUP_INNERHTML_BUGGY': createInnerHTMLTest(
        '<table><colgroup></colgroup><tbody></tbody></table>',
        '<col/><col/>', 'colgroup'
      ),

      'ELEMENT_OPTGROUP_INNERHTML_BUGGY': createInnerHTMLTest(
        '<select><optgroup></optgroup></select>',
        '<option>x</option>', 'optgroup'
      ),

      'ELEMENT_SELECT_INNERHTML_BUGGY': createInnerHTMLTest(
        '<select><option></option></select>', '<option>x</option>'
      ),

      'ELEMENT_TABLE_INNERHTML_BUGGY': createInnerHTMLTest(
        // left out tbody to test if it's auto inserted
        '<table><tr><td></td></tr></table>', '<tr><td><p>x</p></td></tr>'
      )
    };
  })());

  Bug.set((function() {
    function createCommentTest(conditional) {
      return function() {
        var div = Fuse._div;
        div.innerHTML = '<p>x</p><!--y-->';
        var result = conditional(div);
        div.innerHTML = '';
        return result;
      };
    }

    return {
      'COMMENT_NODES_IN_CHILDREN_NODELIST': createCommentTest(function(element) {
        // true for IE
        return Feature('ELEMENT_CHILDREN_NODELIST') && element.children.length === 2;
      }),

      'GET_ELEMENTS_BY_TAG_NAME_RETURNS_COMMENT_NODES': createCommentTest(function(element) {
        // true for IE
        return element.getElementsByTagName('*').length === 2;
      })
    };
  })());

  if (Feature('ELEMENT_CLASS')) {
    Bug.set((function() {
      function createElementInheritableTest(nodeName) {
        return function() {
          // IE8 bug:
          // Must reference Element as a property of global when assigning
          // properties to its prototype or it will create a seperate instance
          // for Element and global.Element.
          var element = Fuse._doc.createElement(nodeName),
           prototype = global.Element.prototype;
          prototype[expando] = true;
          var result = !element[expando];
          delete prototype[expando];
          return result;
        };
      }

      return {
        'ELEMENT_APPLET_FAILS_TO_INHERIT_FROM_PROTOTYPE':
          createElementInheritableTest('applet'),
        'ELEMENT_OBJECT_FAILS_TO_INHERIT_FROM_PROTOTYPE':
          createElementInheritableTest('object')
      };
    })());
  }
