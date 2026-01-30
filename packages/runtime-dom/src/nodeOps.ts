//主要对节点元素进行操作
export const nodeOps = {
  insert: (el: Node, parent: Node, anchor?: Node | null) =>
    parent.insertBefore(el, anchor || null),

  remove(el: Node) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },

  createElement: (type: string) => document.createElement(type),

  createText: (text: string) => document.createTextNode(text),

  setText: (node: Text, text: string) => (node.nodeValue = text),

  setElementText: (el: Element, text: string) => (el.textContent = text),

  parentNode: (node: Node) => node.parentNode as Element | null,

  nextSibling: (node: Node) => node.nextSibling,

  querySelector: (selector: string) => document.querySelector(selector),
};
