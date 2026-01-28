//div onClick=fn

const createInvoker = (handler) => {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = handler;
  return invoker;
};

export const patchEvent = (el, name, handler) => {
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();
  const existingInvoker = invokers[eventName];
  if (handler && existingInvoker) {
    return (existingInvoker.value = handler);
  }
  if (handler) {
    const invoker = (invokers[name] = createInvoker(handler));
    return el.addEventListener(eventName, invoker);
  }
  if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[eventName] = null;
  }
};
