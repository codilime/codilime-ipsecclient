export function objectClone(input) {
  return Object.assign({}, input);
}

export function isEmptyObject(obj = {}) {
  if (obj === null) {
    return null;
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function findIndexOfObjectWithPropertyValueInArray(
  array,
  value,
  property = "id"
) {
  if (Array.isArray(array)) {
    return array.findIndex(function (item) {
      return item[property] == value;
    });
  }

  return null;
}

export function findIndexOfObjectWithPropertyValueInAssocArray(array, value) {
  let index = -1;

  Object.keys(array).map(function (key) {
    if (key == value) {
      index = key;
    }
  });

  return index;
}

export function findObjectWithPropertyValueInArray(
  array,
  value,
  property = "id"
) {
  let index = findIndexOfObjectWithPropertyValueInArray(array, value, property);

  if (index === null || index === -1) {
    return null;
  }

  return array[index];
}

export function findObjectWithPropertyValueInAssocArray(array, value) {
  let index = findIndexOfObjectWithPropertyValueInAssocArray(array, value);

  if (index === null || index === -1) {
    return null;
  }

  return array[index];
}
