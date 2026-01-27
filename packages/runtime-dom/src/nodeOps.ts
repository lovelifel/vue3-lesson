//主要对节点元素进行操作
export const nodeOps = {
  createElement(tagName: string) {
    return document.createElement(tagName);
  },
  createTextNode(text: string) {
    return document.createTextNode(text);
  },
  insert(child: Node, parent: Node, anchor?: Node) {
    parent.insertBefore(child, anchor);
  },
  remove(child: Node) {
    child.parentNode?.removeChild(child);
  },
  setElementText(el: Element, text: string) {
    el.textContent = text;
  },
};
