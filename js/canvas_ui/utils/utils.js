export const isPrimitive = function (value) {
  if (value === null) return true;
  if (typeof value !== "object" && typeof value !== "function") return true;
  return false;
};

export const isObjectLiteral = function (value) {
  return (
    value !== undefined &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
};

export const isArray = function (value) {
  return Array.isArray(value);
};

export const isFunction = function (value) {
  return typeof value === "function";
};

export const isNull = function (value) {
  return value === null;
};

export const clone = function (data) {
  return JSON.parse(JSON.stringify(data));
};

export const replace = function (first, second) {
  if (!isObjectLiteral(second)) return first;
  for (const key of Object.keys(first)) {
    if (second[key] === undefined) continue;
    if (isObjectLiteral(first[key]) && isObjectLiteral(second[key]))
      replace(first[key], second[key]);
    else first[key] = second[key];
  }
  return first;
};

export const bind = function (func, args, value = () => {}) {
  return func?.bind(...args) ?? value;
};

export const mapToArray = function (map) {
  return [...map.values()];
};

export const removeElementFromArray = function (array, element) {
  const i = array.findIndex((elem) => elem === element);
  if (i === -1) return false;
  array.splice(i, 1);
  return true;
};

export const dpr = window.devicePixelRatio || 1;
