interface Event {
  composedPath(): EventTarget[];
}

if (!('composedPath' in Event.prototype)) {

  Object.defineProperty(Event.prototype, 'composedPath', {
    value() {
      let element = this.target || null;
      const pathArray = [element];

      if (!element || !element.parentElement) {
        return [];
      }

      while (element.parentElement) {
        element = element.parentElement;
        pathArray.unshift(element);
      }

      return pathArray;
    }
  });
}
