export const createRenderer = (renderOptions) => {
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
    patchProp: hostPatchProp,
  } = renderOptions;

  const render = (vnode, container) => {
    //
    console.log(vnode, container);
  };

  return {
    render,
  };
};
