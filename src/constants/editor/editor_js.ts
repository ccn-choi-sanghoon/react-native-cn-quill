export const editor_js = `
<script>
(function (doc) {

  var getAttributes = function (node) {
    const attrArray = node?.attributes ? [...node.attributes] : [];
    return attrArray.reduce((_attr, node) => ({ ..._attr, [node.nodeName]: node.nodeValue}), {});
  }

  var sendMessage = function (message) {
    if (window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(message);
      else console.log(message)
  }

  // Get the dimensions of the quill content field
  var getDimensions = function (key) {
    const dimensionsJson = JSON.stringify({
      type: 'get-dimensions',
      key: key,
      data: {
        width: quill.root.scrollWidth,
        height: quill.root.scrollHeight
      }
    });
    sendMessage(dimensionsJson);
  }

  var getSelectedFormats = function () {
    var formats = quill.getFormat();
      var contentChanged = JSON.stringify({
                type: 'format-change',
                data: {formats} });
      sendMessage(contentChanged);
  }
  //Format text at user’s current selection
  var formatSelection = function (name, value) {
    var range = quill.getSelection();
    if (!range) quill.focus();
    quill.format(name, value);
    getSelectedFormats();
  }

  var hasFocus = function (key) {
    var hs = quill.hasFocus();

    var hsJson = JSON.stringify({
                type: 'has-focus',
                key: key,
                data: hs });
      sendMessage(hsJson);
  }

  var getContents = function (key, index, length) {
    var getContentsData = quill.getContents(index, length);
    var getContentsDataJson = JSON.stringify({
      type: 'get-contents',
      key: key,
      data: getContentsData });
      sendMessage(getContentsDataJson);
  }

  var getText = function (key, index, length) {
    var getTextData = quill.getText(index, length);
    var getTextDataJson = JSON.stringify({
      type: 'get-text',
      key: key,
      data: getTextData });
      sendMessage(getTextDataJson);
  }

  var getLength = function (key) {
    var getLengthData = quill.getLength();
    var getLengthDataJson = JSON.stringify({
      type: 'get-length',
      key: key,
      data: getLengthData });
      sendMessage(getLengthDataJson);
  }

  var getHtml = function (key) {
    var html = quill.root.innerHTML;
    var getHtmlJson = JSON.stringify({
      type: 'get-html',
      key: key,
      data: html
    });
    sendMessage(getHtmlJson);
  }

  var insertEmbed = function (index, type, value) {
    quill.insertEmbed(index, type, value);
  }

  var insertText = function (index, text, formats={}) {
    quill.insertText(index, text, formats);
  }

  var setContents = function (key, delta) {
    try {
      var setContentsData = quill.setContents(delta);
      var setContentsDataJson = JSON.stringify({
        type: 'set-contents',
        key: key,
        data: setContentsData });
        sendMessage(setContentsDataJson);
    } catch (error) {
      var errorJson = JSON.stringify({
        type: 'set-contents-error',
        key: key,
        data: { message: error.message, stack: error.stack } });
        sendMessage(errorJson);

        var setContentsDataJson = JSON.stringify({
          type: 'set-contents',
          key: key,
          data: {} });
          sendMessage(setContentsDataJson);
    }
  }

  var setText = function (text) {
    quill.setText(text);
  }

  var setPlaceholder = function (text) {
    quill.root.dataset.placeholder = text;
  }

  var updateContents = function (delta) {
    quill.updateContents(delta);
  }

  var dangerouslyPasteHTML = function (index, html) {
    quill.clipboard.dangerouslyPasteHTML(index, html);
  }

  var setSelection = function (index, length = 0, source = 'api') {
    quill.setSelection(index, length, source);
  }

  var getBounds = function (key, index, length = 0) {
    var boundsData = quill.getBounds(index, length);
    var getBoundsJson = JSON.stringify({
      type: 'get-bounds',
      key: key,
      data: boundsData });
      sendMessage(getBoundsJson);
  }

  var getSelection = function (key, focus = false) {
    var getSelectionData = quill.getSelection(focus);
    var getSelectionJson = JSON.stringify({
      type: 'get-selection',
      key: key,
      data: getSelectionData
    });
    sendMessage(getSelectionJson);
  }

  const getFormat = function (key, index, length) {
    const getFormatData = quill.getFormat(index, length);
    const getFormatJson = JSON.stringify({
      type: 'get-format',
      key: key,
      data: getFormatData
    });
    sendMessage(getFormatJson);
  }

  const getLeaf = function (key, index) {
    const [leaf, offset] = quill.getLeaf(index);
    const getLeafData = leaf ? {
      offset,
      text: leaf.text,
      length: leaf.text.length,
      index: quill.getIndex(leaf),
      attributes: getAttributes(leaf?.parent?.domNode)
    } : null
    const getLeafJson = JSON.stringify({
      type: 'get-leaf',
      key: key,
      data: getLeafData
    });
    sendMessage(getLeafJson);
  }

  const removeFormat = function (key, index, length) {
    const removeFormatData = quill.removeFormat(index, length);
    const removeFormatJson = JSON.stringify({
      type: 'remove-format',
      key: key,
      data: removeFormatData
    });
    sendMessage(removeFormatJson);
  }

  const formatText = function (key, index, length, formats, source) {
    const formatTextData = quill.formatText(index, length, formats, source);
    const formatTextJson = JSON.stringify({
      type: 'format-text',
      key: key,
      data: formatTextData
    });
    sendMessage(formatTextJson);
  }

  // [STEP_3]
  // 특정 id를 가진 element의 attribute를 모두 가져온다.
  const CL_getElementAttributeByID = function (key, id) {
    // alert('CL_getElementAttributeByID called');
    const element = document.getElementById(id);
    let result = {};

    if(element == null) {
      result = null;
    } else {
      const attributes = element.attributes;

      for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          result[attr.name] = attr.value;
      }

    }

    const msgJson = JSON.stringify({
      type: 'CL_getElementAttributeByID',
      key: key,
      data: {
        id,
        result,
      }
    });
    sendMessage(msgJson);
  }

  // 특정 id element에 classList의 add 메소드를 호출한다.
  // mdn https://developer.mozilla.org/ko/docs/Web/API/Element/classList#add_string_string_..._
  const CL_addElementClassListByID = function (key, args) {
    const element = document.getElementById(args.id);
    let result = {};


    if(element == null) {
      result = null;
    } else {
      element.classList.add(args.clz);
      const isContain = element.classList.contains(args.clz);

      result = {
        isSuccess: isContain,
      };
    }


    const msgJson = JSON.stringify({
      type: 'CL_addElementClassListByID',
      key: key,
      data: {
        id: args.id,
        result,
      }
    });
    sendMessage(msgJson);
  }

  // 특정 id element에 classList의 remove 메소드를 호출한다.
  // mdn https://developer.mozilla.org/ko/docs/Web/API/Element/classList#remove_string_string_..._
  const CL_removeElementClassListByID = function (key, args) {
    const element = document.getElementById(args.id);
    let result = null;

    if(element == null) {
      result = null; // id element가 없을 경우
    } else {
      element.classList.remove(args.clz);
      const isContain = element.classList.contains(args.clz);

      result = {
        isSuccess: !isContain,
      };
    }

    const msgJson = JSON.stringify({
      type: 'CL_removeElementClassListByID',
      key: key,
      data: {
        id: args.id,
        result,
      }
    });
    sendMessage(msgJson);
  }

  // 특정 id element에 classList의 contains 메소드를 호출한다.
  // mdn https://developer.mozilla.org/ko/docs/Web/API/Element/classList#contains_string_
  const CL_containsElementClassListByID = function (key, args) {
    const element = document.getElementById(args.id);
    let result = {};

    if(element == null) {
      result = null;
    } else {
      const isContain = element.classList.contains(args.clz);

      result = {
        isContain,
      };
    }

    const msgJson = JSON.stringify({
      type: 'CL_containsElementClassListByID',
      key: key,
      data: {
        id: args.id,
        result,
      }
    });
    sendMessage(msgJson);
  }

  //
  //
  const overlayEleID = 'overlay-border';
  const CL_SetOverlayBorderByID = function (key, args) {
    const element = document.getElementById(args.id);
    let result = {};

    if(element == null) {
      result = null;
    } else {
      if(args.isVisible) {
        // 기존에 있으면 삭제
        const orgEle = document.getElementById(overlayEleID);
        if(orgEle != null) {
          // orgEle.remove();
          result = null;
        } else {
          // 오버레이 외곽선 요소 생성
          const overlayBorder = document.createElement('div');
          overlayBorder.classList.add('overlay-border');
          overlayBorder.setAttribute(overlayEleID, 'overlay-border'); // id 설정

          // 대상 요소에 오버레이 추가
          targetElement.appendChild(overlayBorder);
          result = {
            isSuccess: true,
          };
        }
      } else {
        // 기존에 있으면 삭제
        const orgEle = document.getElementById(overlayEleID);
        if(orgEle != null) {
          orgEle.remove();
        }

        result = {
          isSuccess: true,
        };
      }

    }

    const msgJson = JSON.stringify({
      type: 'CL_SetOverlayBorderByID',
      key: key,
      data: {
        id: args.id,
        result,
      }
    });
    sendMessage(msgJson);
  }

  const CL_SetScroll = function (key, args) {
    // 에디터 컨테이너 엘리먼트 가져오기
    const editorContainer = document.querySelector('.ql-editor');
    const containerBounds = editorContainer.getBoundingClientRect();

    if(args.scrollTop) {
      editorContainer.scrollTop = args.scrollTop;
    }

    if(args.scrollOffset) {
      editorContainer.scrollTop += args.scrollOffset;
    }

    const msgJson = JSON.stringify({
      type: 'CL_SetScroll',
      key: key,
      data: {
        result:'success',
      }
    });
    sendMessage(msgJson);
  }

  var getRequest = function (event) {
    var msg = JSON.parse(event.data);
    switch (msg.command) {
      case 'format':
        formatSelection(msg.name, msg.value);
        break;
      case 'focus':
        quill.focus();
        break;
      case 'blur':
        quill.blur();
        break;
      case 'enable':
        quill.enable(msg.value);
        break;
      case 'hasFocus':
        hasFocus(msg.key);
        break;
      case 'deleteText':
        quill.deleteText(msg.index, msg.length);
        break;
      case 'getDimensions':
        getDimensions(msg.key);
        break;
      case 'getContents':
        getContents(msg.key, msg.index, msg.length);
        break;
      case 'getText':
        getText(msg.key, msg.index, msg.length);
        break;
      case 'getBounds':
        getBounds(msg.key, msg.index, msg.length);
        break;
      case 'getSelection':
        getSelection(msg.key, msg.focus);
        break;
      case 'getFormat':
        getFormat(msg.key, msg?.index, msg?.length);
        break;
      case 'getLeaf':
        getLeaf(msg.key, msg.index);
        break;
      case 'setSelection':
        setSelection(msg.index, msg.length, msg.source);
        break;
      case 'getHtml':
        getHtml(msg.key);
        break;
      case 'getLength':
        getLength(msg.key);
        break;
      case 'insertEmbed':
        insertEmbed(msg.index, msg.type, msg.value);
        break;
      case 'insertText':
        insertText(msg.index, msg.text, msg.formats);
        break;
      case 'setContents':
        setContents(msg.key, msg.delta);
        break;
      case 'setText':
        setText(msg.text);
        break;
      case 'setPlaceholder':
        setPlaceholder(msg.text);
        break;
      case 'updateContents':
        updateContents(msg.delta);
        break;
      case 'dangerouslyPasteHTML':
        dangerouslyPasteHTML(msg.index, msg.html);
        break;
      case 'removeFormat':
        removeFormat(msg.key, msg.index, msg.length);
        break;
      case 'formatText':
        formatText(msg.key, msg.index, msg.length, msg.formats, msg.source);
        break;

      // [STEP_2]
      case 'CL_getElementAttributeByID':
        CL_getElementAttributeByID(msg.key, msg.id);
        break;
      case 'CL_addElementClassListByID':
        CL_addElementClassListByID(msg.key, msg.args);
        break;
      case 'CL_removeElementClassListByID':
        CL_removeElementClassListByID(msg.key, msg.args);
        break;
      case 'CL_containsElementClassListByID':
        CL_containsElementClassListByID(msg.key, msg.args);
        break;
      case 'CL_SetOverlayBorderByID':
        CL_SetOverlayBorderByID(msg.key, msg.args);
      case 'CL_SetScroll':
        CL_SetScroll(msg.key, msg.args);
        break;
      default:
        break;
    }
  };

  document.addEventListener("message", getRequest, false);
  window.addEventListener("message", getRequest, false);

  quill.on('editor-change', function(eventName, ...args) {
    if (eventName === 'text-change') {
      getSelectedFormats();
    } else if (eventName === 'selection-change') {
      var range = quill.getSelection();
      if (range) {
        getSelectedFormats();
      }
    }
    var getEditorChange = JSON.stringify({
      type: 'editor-change',
      data: { eventName, args }
    });
    sendMessage(getEditorChange);

    // Notify of dimensions update
    const getDimensionsJson = JSON.stringify({
      type: 'dimensions-change',
      data: {
        width: quill.root.scrollWidth,
        height: quill.root.scrollHeight
      }
    });
    sendMessage(getDimensionsJson);
  });

  quill.on('text-change', function(delta, oldDelta, source) {
    var getTextChange = JSON.stringify({
      type: 'text-change',
      data: { delta, oldDelta, source }
    });
    sendMessage(getTextChange);

    // Notify of HTML update
    var html = quill.root.innerHTML;
    var getHtmlJson = JSON.stringify({
      type: 'html-change',
      data: { html }
    });
    sendMessage(getHtmlJson);
  });

  quill.on('selection-change', function(range, oldRange, source) {
    var getSelectionChange = JSON.stringify({
      type: 'selection-change',
      data: { range, oldRange, source } });
      sendMessage(getSelectionChange)
  });

  quill.root.addEventListener('blur', function () {
    sendMessage(JSON.stringify({type: 'blur'}));
  });

  quill.root.addEventListener('focus', function () {
    sendMessage(JSON.stringify({type: 'focus'}));
  });



  // Report initial dimensions when the editor is instantiated
  setTimeout(() => {
    const getDimensionsJson = JSON.stringify({
      type: 'dimensions-change',
      data: {
        width: quill.root.scrollWidth,
        height: quill.root.scrollHeight
      }
    });
    sendMessage(getDimensionsJson);
  }, 250)

})(document)
</script>
`;
