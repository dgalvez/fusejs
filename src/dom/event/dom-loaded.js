  /*--------------------------- EVENT: DOM-LOADED ----------------------------*/

  (function(createDispatcher) {

    var domLoadDispatcher = createDispatcher(2, 'dom:loaded'),

    winLoadDispatcher = createDispatcher(1, 'load'),

    domLoadWrapper = function(event) {
      var doc = fuse._doc, docEl = fuse._docEl, decorated = fuse(doc);
      if (!decorated.isLoaded()) {
        fuse._body     =
        fuse._scrollEl = doc.body;
        fuse._root     = docEl;

        if (fuse.env.test('BODY_ACTING_AS_ROOT')) {
          fuse._root = doc.body;
          fuse._info.root = fuse._info.body;
        }
        if (fuse.env.test('BODY_SCROLL_COORDS_ON_DOCUMENT_ELEMENT')) {
          fuse._scrollEl = docEl;
          fuse._info.scrollEl = fuse._info.docEl;
        }

        event = fuse.dom.Event(event || global.event, doc);
        event.type = 'dom:loaded';

        decorated.isLoaded = createGetter('isLoaded', true);
        domLoadDispatcher(event);
        decorated.stopObserving('DOMContentLoaded').stopObserving('dom:loaded');
      }
    },

    winLoadWrapper = function(event) {
      event || (event = global.event);
      var domData = fuse.dom.data;

      // make dom:loaded dispatch if it hasn't
      if (!fuse(fuse._doc).isLoaded()) {
        domLoadWrapper(event);
      }
      // try again later if dom:loaded is still executing handlers
      else if (domData[2] && domData[2].events['dom:loaded']) {
        return setTimeout(function() { winLoadWrapper(event); }, 10);
      }
      // prepare event wrapper
      event = fuse.dom.Event(event, global);
      event.type = 'load';
      winLoadDispatcher(event);

      // clear event cache
      fuse(global).stopObserving('load');
    };

    // Ensure that the dom:loaded event has finished executing its observers
    // before allowing the window onload event to proceed
    addObserver(fuse.get(fuse._doc).raw, 'dom:loaded',
      (getOrCreateCache(2, 'dom:loaded').dispatcher = domLoadWrapper));

    // Perform feature tests and define pseudo private
    // body/root properties when the dom is loaded
    addObserver(fuse.get(global).raw, 'load',
      (getOrCreateCache(1, 'load').dispatcher = winLoadWrapper));

  })(fuse.dom.Event.createDispatcher);

  /*--------------------------------------------------------------------------*/

  (function() {
    var cssPoller, readyStatePoller,

    FINAL_DOCUMENT_READY_STATES = { 'complete': 1, 'loaded': 1 },

    doc          = fuse._doc,

    decoratedDoc = fuse(doc),

    envTest      = fuse.env.test,

    isFramed     = true,

    isHostType   = fuse.Object.isHostType,

    isSameOrigin = fuse.Object.isSameOrigin,

    Poller = function(method) {
      var poller = this,
      callback = function() {
        if (!method() && poller.id != null) {
          poller.id = setTimeout(callback, 10);
        }
      };

      this.id = setTimeout(callback, 10);
    },

    cssDoneLoading = function() {
      return (isCssLoaded = fuse.Function.TRUE)();
    },

    fireDomLoadedEvent = function() {
      readyStatePoller.clear();
      cssPoller && cssPoller.clear();
      return !decoratedDoc.isLoaded() && !!decoratedDoc.fire('dom:loaded');
    },

    checkCssAndFire = function() {
      return decoratedDoc.isLoaded()
        ? fireDomLoadedEvent()
        : !!(isCssLoaded() && fireDomLoadedEvent());
    },

    getSheetElements = function() {
      var i = 0, link, links = doc.getElementsByTagName('LINK'),
       result = fuse.Array.fromNodeList(doc.getElementsByTagName('STYLE'));
      while (link = links[i++]) {
        if (link.rel.toLowerCase() === 'stylesheet')
          result.push(link);
      }
      return result;
    },

    getSheetObjects = function(elements) {
      for (var i = 0, result = [], element, sheet; element = elements[i++]; ) {
        sheet = getSheet(element);
        // bail when sheet is null/undefined on elements
        if (sheet == null) return false;
        if (isSameOrigin(sheet.href)) {
          result.push(sheet);
          if (!addImports(result, sheet))
            return false;
        }
      }
      return result;
    },

    checkDomLoadedState = function(event) {
      if (decoratedDoc.isLoaded()) {
        return readyStatePoller.clear();
      }
      // Not sure if readyState is ever `loaded` in
      // Safari 2.x but we check to be on the safe side
      if (FINAL_DOCUMENT_READY_STATES[doc.readyState] ||
          event && event.type === 'DOMContentLoaded') {
        readyStatePoller.clear();
        decoratedDoc.stopObserving('readystatechange', checkDomLoadedState);
        if (!checkCssAndFire()) cssPoller = new Poller(checkCssAndFire);
      }
    },

    addImports = function(collection, sheet) {
      addImports = function(collection, sheet) {
        // Catch errors on partially loaded elements. Firefox may also
        // error when accessing css rules of sources using the file:// protocol
        try {
          var ss, rules = getRules(sheet), length = rules.length;
        } catch(e) {
          return false;
        }
        while (length--) {
          // bail when sheet is null on rules
          ss = rules[length].styleSheet;
          if (ss === null) return false;
          if (ss && isSameOrigin(ss.href)) {
            collection.push(ss);
            if (!addImports(collection, ss))
              return false;
          }
        }
        return collection;
      };

      if (isHostType(sheet, 'imports')) {
        addImports = function(collection, sheet) {
          var length = sheet.imports.length;
          while (length--) {
            if (isSameOrigin(sheet.imports[length].href)) {
              collection.push(sheet.imports[length]);
              addImports(collection, sheet.imports[length]);
            }
          }
          return collection;
        };
      }
      return addImports(collection, sheet);
    },

    getStyle = function(element, styleName) {
      getStyle = function(element, styleName) {
        var style = element.ownerDocument.defaultView.getComputedStyle(element, null);
        return (style || element.style)[styleName];
      };

      if (!envTest('ELEMENT_COMPUTED_STYLE')) {
        getStyle = function(element, styleName) {
          return (element.currentStyle || element.style)[styleName];
        };
      }
      return getStyle(element, styleName);
    },

    getSheet = function(element) {
      getSheet = function(element) {
        return element.sheet;
      };

      if (isHostType(element, 'styleSheet')) {
        getSheet = function(element) {
          return element.styleSheet;
        };
      }
      return getSheet(element);
    },

    getRules = function(sheet) {
      getRules = function(sheet) {
        return sheet.cssRules;
      };

      if (isHostType(sheet, 'rules')) {
        getRules = function(sheet) {
          return sheet.rules;
        };
      }
      return getRules(sheet);
    },

    addRule = function(sheet, selector, cssText) {
      addRule = function(sheet, selector, cssText) {
        return sheet.insertRule(selector + '{' + cssText + '}', getRules(sheet).length);
      };

      if (isHostType(sheet, 'addRule')) {
        addRule = function(sheet, selector, cssText) {
          return sheet.addRule(selector, cssText);
        };
      }
      return addRule(sheet, selector, cssText);
    },

    removeRule = function(sheet, index) {
      removeRule = function(sheet, index) {
        return sheet.deleteRule(index);
      };

      if (isHostType(sheet, 'removeRule')) {
        removeRule = function(sheet, index) {
          return sheet.removeRule(index);
        };
      }
      return removeRule(sheet, index);
    },

    injectRules = function(sheetElements, cache) {
      var className, length, sheets = getSheetObjects(sheetElements);
      if (!sheets) return false;
      length = sheets.length;
      while (length--) {
        className = 'fuse_css_loaded_' + cache.length;
        cache.push({ 'className': className, 'sheet': sheets[length] });
        addRule(sheets[length], '.' + className, 'margin-top: -1234px!important;');
      }
      return true;
    },

    isCssLoaded = function() {
      var sheetElements = getSheetElements();
      if (!sheetElements.length) return cssDoneLoading();

      isCssLoaded = function() {
        var cache = [];
        if (!injectRules(sheetElements, cache)) return false;

        isCssLoaded = function() {
          var c, lastIndex, rules, length = cache.length, done = true;
          while (length--) {
            c = cache[length];
            rules = getRules(c.sheet);
            lastIndex = rules.length && rules.length - 1;

            // if styleSheet was still loading when test rule
            // was added it will have removed the rule.
            if (rules[lastIndex].selectorText.indexOf(c.className) > -1) {
              done = false;

              // if the styleSheet has only the test rule then skip
              if (rules.length === 1) {
                continue;
              }
              // add dummy element to body to test css rules
              if (!c.div) {
                c.div = doc.createElement('div');
                c.div.className = c.className;
                c.div.style.cssText = 'position:absolute;visibility:hidden;';
              }

              doc.body.appendChild(c.div);

              // when loaded clear cache entry
              if (getStyle(c.div, 'marginTop') === '-1234px') {
                cache.splice(length, 1);
              }

              // cleanup
              removeRule(c.sheet, lastIndex);
              doc.body.removeChild(c.div);
            }
          }
          if (done) {
            cache = null;
            return cssDoneLoading();
          }
          return done;
        };
        return isCssLoaded();
      };
      return isCssLoaded();
    };

    Poller.prototype.clear = function() {
      this.id != null && (this.id = global.clearTimeout(this.id));
    };

    /*------------------------------------------------------------------------*/

    // Ensure the document is not in a frame because
    // doScroll() will not throw an error when the document
    // is framed. Fallback on document readyState.
    if (!envTest('ELEMENT_ADD_EVENT_LISTENER') && envTest('ELEMENT_DO_SCROLL')) {

      // Avoid a potential browser hang when checking global.top (thanks Rich Dougherty)
      // The value of frameElement can be null or an object.
      // Checking global.frameElement could throw if not accessible.
      try { isFramed = global.frameElement != null; } catch(e) { }

      // Derived with permission from Diego Perini's IEContentLoaded
      // http://javascript.nwbox.com/IEContentLoaded/
      if (!isFramed) {
        checkDomLoadedState = function() {
          if (decoratedDoc.isLoaded()) {
            return readyStatePoller.clear();
          }
          if (doc.readyState === 'complete') {
            fireDomLoadedEvent();
          } else {
            try { fuse._div.doScroll(); } catch(e) { return; }
            fireDomLoadedEvent();
          }
        };
      }
    } else if (envTest('ELEMENT_ADD_EVENT_LISTENER')) {
      decoratedDoc.observe('DOMContentLoaded', checkDomLoadedState);
    }

    // readystate and poller are used (first one to complete wins)
    decoratedDoc.observe('readystatechange', checkDomLoadedState);
    readyStatePoller = new Poller(checkDomLoadedState);
  })();
