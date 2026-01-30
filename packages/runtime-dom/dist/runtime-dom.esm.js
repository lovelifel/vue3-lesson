// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  insert: (el, parent, anchor) => parent.insertBefore(el, anchor || null),
  remove(el) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  createElement: (type) => document.createElement(type),
  createText: (text) => document.createTextNode(text),
  setText: (node, text) => node.nodeValue = text,
  setElementText: (el, text) => el.textContent = text,
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => document.querySelector(selector)
};

// packages/runtime-dom/src/modules/patchClass.ts
var patchClass = (el, value) => {
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
};

// packages/runtime-dom/src/modules/patchStyle.ts
var patchStyle = (el, prevValue, nextValue) => {
  let style = el.style;
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] == null) {
        style[key] = null;
      }
    }
  }
  if (nextValue) {
    for (let key in nextValue) {
      style[key] = nextValue[key];
    }
  }
};

// packages/runtime-dom/src/modules/patchEvent.ts
var createInvoker = (handler) => {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = handler;
  return invoker;
};
var patchEvent = (el, name, handler) => {
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();
  const existingInvoker = invokers[eventName];
  if (handler && existingInvoker) {
    return existingInvoker.value = handler;
  }
  if (handler) {
    const invoker = invokers[name] = createInvoker(handler);
    return el.addEventListener(eventName, invoker);
  }
  if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[eventName] = null;
  }
};

// packages/runtime-dom/src/modules/patchAttr.ts
var patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};

// packages/runtime-dom/src/patchProp.ts
function patchProp(el, key, prevValue, nextValue) {
  if (key === "class") {
    patchClass(el, nextValue);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (key.startsWith("on")) {
    patchEvent(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
}

// packages/runtime-core/src/index.ts
var createRenderer = (renderOptions2) => {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    querySelector: hostQuerySelector,
    setText: hostSetText,
    patchProp: hostPatchProp
  } = renderOptions2;
  const render2 = (vnode, container) => {
    console.log(vnode, container);
  };
  return {
    render: render2
  };
};

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOps);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  render,
  renderOptions
};
//# sourceMappingURL=runtime-dom.esm.js.map
