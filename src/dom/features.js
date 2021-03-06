  /*----------------------------- DOM: FEATURES ------------------------------*/

  (function() {

    var isHostType = fuse.Object.isHostType;

    fuse.env.addTest({
      'ELEMENT_ADD_EVENT_LISTENER': function() {
        // true for all but IE
        return isHostType(fuse._doc, 'addEventListener');
      },

      'ELEMENT_ATTACH_EVENT': function() {
        // true for IE
        return isHostType(fuse._doc, 'attachEvent') &&
          !fuse.env.test('ELEMENT_ADD_EVENT_LISTENER');
      },

      'ELEMENT_BOUNDING_CLIENT_RECT': function() {
        // true for IE, Firefox 3
        return isHostType(fuse._docEl, 'getBoundingClientRect');
      },

      'ELEMENT_COMPARE_DOCUMENT_POSITION': function() {
        // true for Firefox and Opera 9.5+
        return isHostType(fuse._docEl, 'compareDocumentPosition');
      },

      'ELEMENT_COMPUTED_STYLE': function() {
        // true for all but IE
        return isHostType(fuse._doc, 'defaultView') &&
          isHostType(fuse._doc.defaultView, 'getComputedStyle');
      },

      'ELEMENT_CURRENT_STYLE': function() {
        // true for IE
        return isHostType(fuse._docEl, 'currentStyle') &&
          !fuse.env.test('ELEMENT_COMPUTED_STYLE');
      },

      'ELEMENT_CONTAINS': function() {
        // true for all but Safari 2
        if(isHostType(fuse._docEl, 'contains')) {
          var result, div = fuse._div;
          div.appendChild(div.cloneNode(false));
          div.appendChild(div.cloneNode(true));

          // ensure element.contains() returns the correct results;
          result = !div.firstChild.contains(div.childNodes[1].firstChild);
          emptyElement(div);
          return result;
        }
      },

      // features
      'ELEMENT_DO_SCROLL': function() {
        // true for IE
        return isHostType(fuse._docEl, 'doScroll');
      },

      'ELEMENT_GET_ATTRIBUTE_IFLAG': function() {
        // true for IE
        var div = fuse._div, result = false;
        try {
          div.setAttribute('align', 'center'); div.setAttribute('aLiGn', 'left');
          result = (div.getAttribute('aLiGn') == 'center' &&
            div.getAttribute('aLiGn', 1) == 'left');
          div.removeAttribute('align'); div.removeAttribute('aLiGn');
        } catch(e) { }
        return result;
      },

      'ELEMENT_HAS_ATTRIBUTE': function() {
        // true for all but IE
        var result, option = fuse._doc.createElement('option');
        if (isHostType(option, 'hasAttribute')) {
          option.setAttribute('selected', 'selected');
          result = !!option.hasAttribute('selected');
        }
        return result;
      },

      'ELEMENT_INNER_HTML': function() {
        var div = fuse._div;
        try { div.innerHTML = '<p><\/p>' } catch(e) { }
        return !!div.firstChild;
      },

      'ELEMENT_INNER_TEXT': function() {
        // true for IE
        return !fuse.env.test('ELEMENT_TEXT_CONTENT') &&
          typeof fuse._div.innerText == 'string';
      },

      'ELEMENT_MS_CSS_FILTERS': function() {
        // true for IE
        var docEl = fuse._docEl, elemStyle = docEl.style;
        return isHostType(docEl, 'filters') &&
          typeof elemStyle.filter == 'string' &&
          typeof elemStyle.opacity != 'string';
      },

      'ELEMENT_REMOVE_NODE': function() {
        // true for IE and Opera
        return isHostType(fuse._docEl, 'removeNode');
      },

      'ELEMENT_SOURCE_INDEX': function() {
        // true for IE and Opera
        return isHostType(fuse._doc, 'all') &&
          typeof fuse._docEl.sourceIndex == 'number'
      },

      'ELEMENT_TEXT_CONTENT': function() {
        // true for all but IE and Safari 2
        return typeof fuse._div.textContent == 'string';
      },

      'ELEMENT_UNIQUE_NUMBER': function() {
        // IE's uniqueNumber property starts at 1 when the browser session begins.
        // To avoid a conflict with the document's data id of 1 we check
        // uniqueNumber on a dummy element first.
        return typeof fuse._div.uniqueNumber == 'number' &&
          typeof fuse._docEl.uniqueNumber == 'number' &&
          fuse._div.uniqueNumber != fuse._docEl.uniqueNumber;
      },

      /*---------------------------- DOM BUGS --------------------------------*/

      'ATTRIBUTE_NODES_SHARED_ON_CLONED_ELEMENTS': function() {
        // true for some IE6
        var clone, div = fuse._div, node = fuse._doc.createAttribute('id');
        node.value = 'x';
        div.setAttributeNode(node);
        clone = div.cloneNode(false);
        div.setAttribute('id', 'y');
        return !!((node = clone.getAttributeNode('id')) && node.value == 'y');
      },

      'BODY_ACTING_AS_ROOT': function() {
        // true for IE Quirks, Opera 9.25
        var body = fuse._body, div = fuse._div, docEl = fuse._docEl;
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
        envAddTest('BODY_SCROLL_COORDS_ON_DOCUMENT_ELEMENT',
          ++docEl.scrollTop && docEl.scrollTop == scrollTop + 1);
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
        var body = fuse._body, bs = body.style, backup = bs.cssText;
        bs.cssText += ';position:absolute;top:0;margin:1px 0 0 0;';
        var result = body.offsetTop == 1;
        bs.cssText = backup;
        return result;
      },

      'BUTTON_VALUE_CHANGES_AFFECT_INNER_CONTENT': function() {
        // true for IE6/7
        var node, doc = fuse._doc, button = doc.createElement('button');
        button.appendChild(doc.createTextNode('y'));
        button.setAttribute('value', 'x');
        return ((node = button.getAttributeNode('value')) && node.value) != 'x';
      },

      'ELEMENT_COMPUTED_STYLE_DEFAULTS_TO_ZERO': function() {
        if (fuse.env.test('ELEMENT_COMPUTED_STYLE')) {
          // true for Opera
          var result, des = fuse._docEl.style, backup = des.cssText;
          des.position = 'static';
          des.top = des.left = '';

          var style = fuse._doc.defaultView.getComputedStyle(fuse._docEl, null);
          result = (style && style.top == '0px' && style.left == '0px');
          des.cssText = backup;
          return result;
        }
      },

      'ELEMENT_COMPUTED_STYLE_DIMENSIONS_EQUAL_BORDER_BOX': function() {
        if (fuse.env.test('ELEMENT_COMPUTED_STYLE')) {
          // true for Opera 9.2x
          var docEl = fuse._docEl, des = docEl.style, backup = des.paddingBottom;
          des.paddingBottom = '1px';
          var style = fuse._doc.defaultView.getComputedStyle(docEl, null),
           result = style && (parseInt(style.height) || 0) ==  docEl.offsetHeight;
          des.paddingBottom = backup;
          return result;
        }
      },

      'ELEMENT_COMPUTED_STYLE_HEIGHT_IS_ZERO_WHEN_HIDDEN': function() {
        if (fuse.env.test('ELEMENT_COMPUTED_STYLE')) {
          // true for Opera
          var des = fuse._docEl.style, backup = des.display;
          des.display = 'none';

          // In Safari 2 getComputedStyle() will return null for elements with style display:none
          var style = fuse._doc.defaultView.getComputedStyle(fuse._docEl, null),
           result = style && style.height == '0px';

          des.display = backup;
          return result;
        }
      },

      'ELEMENT_COORD_OFFSETS_DONT_INHERIT_ANCESTOR_BORDER_WIDTH': function() {
        // true for all but IE8
        var result, value, body = fuse._body, div = fuse._div,
         bs = fuse._body.style, backup = bs.cssText;

        body.appendChild(div);
        value = div.offsetLeft;
        bs.cssText += ';border: 1px solid transparent;';

        result = value == div.offsetLeft;
        bs.cssText = backup;
        body.removeChild(div);
        return result;
      },

      'ELEMENT_TABLE_INNER_HTML_INSERTS_TBODY': function() {
        // true for IE and Firefox 3
        var result, div = fuse._div;
        if (fuse.env.test('ELEMENT_INNER_HTML')) {
          div.innerHTML = '<table><tr><td><\/td><\/tr><\/table>';
          result = getNodeName(div.firstChild.firstChild) == 'TBODY';
          div.innerHTML = '';
        }
        return result;
      },

      'INPUT_VALUE_PROPERTY_SETS_ATTRIBUTE': function() {
        // true for IE
        var input = fuse._doc.createElement('input');
        input.setAttribute('value', 'x');
        input.value = 'y';
        return input.cloneNode(false).getAttribute('value') == 'y';
      },

      'NAME_ATTRIBUTE_IS_READONLY': function() {
        // true for IE6/7
        var result, div = fuse._div,
         node = div.appendChild(fuse._doc.createElement('input'));

        node.name = 'x';
        result = !div.getElementsByTagName('*')['x'];
        emptyElement(div);
        return result;
      },

      'TABLE_ELEMENTS_RETAIN_OFFSET_DIMENSIONS_WHEN_HIDDEN': function() {
        // true for IE7 and lower
        var result, doc = fuse._doc, body = fuse._body,
         table = doc.createElement('table'),
         tbody = table.appendChild(doc.createElement('tbody')),
         tr    = tbody.appendChild(doc.createElement('tr')),
         tr    = tr.appendChild(doc.createElement('td'));

        tbody.style.display = 'none';
        tr.style.width = '1px';
        body.appendChild(table);

        result = !!table.firstChild.offsetWidth;
        destroyElement(table, body);
        return result;
      }
    });

    envAddTest((function() {
      function createInnerHTMLTest(source, innerHTML, targetNode) {
        return function() {
          var element, div = fuse._div, result = true;
          if (fuse.env.test('ELEMENT_INNER_HTML')) {
            div.innerHTML = source;
            element = div.firstChild;
            if (targetNode) element = element.getElementsByTagName(targetNode)[0];
            try {
              element.innerHTML = innerHTML;
              result = element.innerHTML.toLowerCase() != innerHTML;
            } catch(e) { }
            div.innerHTML = '';
          }
          return result;
        };
      }

      return {
        'ELEMENT_COLGROUP_INNER_HTML_BUGGY': createInnerHTMLTest(
          '<table><colgroup><\/colgroup><tbody><\/tbody><\/table>',
          '<col><col>', 'colgroup'
        ),

        'ELEMENT_OPTGROUP_INNER_HTML_BUGGY': createInnerHTMLTest(
          '<select><optgroup><\/optgroup><\/select>',
          '<option>x<\/option>', 'optgroup'
        ),

        'ELEMENT_SELECT_INNER_HTML_BUGGY': createInnerHTMLTest(
          '<select><option><\/option><\/select>', '<option>x<\/option>'
        ),

        'ELEMENT_INNER_HTML_IGNORES_SCRIPTS': createInnerHTMLTest(
          '<div><\/div>', '<script><\/script>'
        ),

        'ELEMENT_TABLE_INNER_HTML_BUGGY': createInnerHTMLTest(
          // left out tbody to test if it's auto inserted
          '<table><tr><td><\/td><\/tr><\/table>', '<tr><td><p>x<\/p><\/td><\/tr>'
        )
      };
    })());

    envAddTest((function() {
      function createScriptTest(testType) {
        return function() {
          var evalFailed, hasText, reEvaled, htmlEvaled,
           div     = fuse._div,
           doc     = fuse._doc,
           head    = fuse._headEl,
           code    = 'fuse.' + fuse.uid +'=1',
           script  = doc.createElement('script'),
           useText = typeof script.text === 'string';

          try { script.appendChild(doc.createTextNode(code)) } catch (e) { }
          useText && (script.text = code + '+1');

          head.insertBefore(script, head.firstChild);
          hasText = fuse[fuse.uid] == 2;
          evalFailed = !fuse[fuse.uid];

          code += '+2';
          if (script.firstChild) {
            script.firstChild.data = code;
          } else if (useText) {
            script.text = code;
          }

          reEvaled = fuse[fuse.uid] == 3;
          destroyElement(script);

          if (fuse.env.test('ELEMENT_INNER_HTML')) {
            div.innerHTML = 'x<script>' + code + '+1<\/script>';
            div.appendChild(head.insertBefore(div.lastChild, head.firstChild));
            div.innerHTML = '';
          }
          htmlEvaled = fuse[fuse.uid] == 4;
          delete fuse[fuse.uid];

          envAddTest({
            'ELEMENT_SCRIPT_HAS_TEXT_PROPERTY': hasText,

            'ELEMENT_SCRIPT_FAILS_TO_EVAL_TEXT': evalFailed,

            'ELEMENT_SCRIPT_REEVALS_TEXT': reEvaled,

            'ELEMENT_EVALS_SCRIPT_FROM_INNER_HTML': htmlEvaled
          });

          return ({ '1': hasText, '2': evalFailed, '3': reEvaled, '4': htmlEvaled })[testType];
        };
      }

      return {
        'ELEMENT_SCRIPT_HAS_TEXT_PROPERTY': createScriptTest('1'),

        'ELEMENT_SCRIPT_FAILS_TO_EVAL_TEXT': createScriptTest('2'),

        'ELEMENT_SCRIPT_REEVALS_TEXT': createScriptTest('3'),

        'ELEMENT_EVALS_SCRIPT_FROM_INNER_HTML': createScriptTest('4')
      };
    })());
  })();
