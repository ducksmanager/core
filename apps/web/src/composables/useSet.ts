export default () => {
  const toggleSetElement = <T>(set: T[], element: T): void => {
    if (set.includes(element)) {
      set.splice(set.indexOf(element), 1);
    } else {
      set.push(element);
    }
  };
  return {
    toggleSetElement,
  };
};
