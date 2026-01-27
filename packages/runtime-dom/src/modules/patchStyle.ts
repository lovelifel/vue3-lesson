export const patchStyle = (el, prevValue, nextValue) => {
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
