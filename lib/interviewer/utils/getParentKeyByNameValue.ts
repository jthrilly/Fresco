import { find, has, isEmpty } from 'lodash';

const findCategoricalKey = (
  object: Record<string | number, unknown>,
  toFind: string,
) => {
  // make list of possible var_option pairs
  let previousIndex = 0;
  const collection = [];
  while (toFind.indexOf('_', previousIndex) !== -1) {
    previousIndex = toFind.indexOf('_', previousIndex) + 1;
    const name = toFind.substr(0, previousIndex - 1);
    const option = toFind.substr(previousIndex, toFind.length);
    if (name && option) {
      collection.push({ name, option });
    }
  }
  let foundKey;

  // check for a categorical variable with a valid option value
  const categoricalVariable = collection.find((pair) => {
    foundKey = findKey(
      object,
      (objectItem) =>
        (objectItem as { name: string | number }).name.toString() ===
        pair.name.toString(),
    );

    return (
      foundKey &&
      has(object[foundKey], 'options') &&
      find(
        (object[foundKey] as { options: { value: string | number }[] }).options,
        (option) => option.value.toString() === pair.option.toString(),
      )
    );
  });
  if (has(categoricalVariable, 'option')) {
    return `${foundKey}_${categoricalVariable.option}`;
  }
  return undefined;
};

function findKey<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: string, obj: T) => boolean,
): string | undefined {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (predicate(value, key, obj)) {
        return key;
      }
    }
  }
  return undefined;
}

/**
 * Utility function that can be used to help with translating external data
 * variable labels to UUIDs, if a match is possible.
 *
 * Assuming that {object} contains other objects, keyed by a UUID, this function
 * first checks if the string to find is a valid key in the object, and returns it
 * if so (equivalent to codebook.node.uuid === toFind )
 *
 * if not, it iterates the keys of the object, and tests the keys of each child object
 * to see if the 'name' property equals {toFind}. This is equivalent to
 * codebook.node.uuid.name === toFind. Where this child object is found, its key within
 * the parent object is returned.
 *
 * Finally, if neither approach finds a UUID, {toFind} is returned.
 */

const getParentKeyByNameValue = (
  object: Record<string | number, unknown>,
  toFind: string,
) => {
  if (isEmpty(object) || object[toFind]) {
    return toFind;
  }

  // Iterate object keys and return the key (itself )
  let foundKey = findKey(object, (objectItem) => {
    if (objectItem && typeof objectItem === 'object') {
      return (objectItem as { name: string }).name === toFind;
    }
    return false;
  });

  // check for special cases

  // possible location
  if (!foundKey && toFind && (toFind.endsWith('_x') || toFind.endsWith('_y'))) {
    const locationName = toFind.substring(0, toFind.length - 2);
    foundKey = findKey(
      object,
      (objectItem) => (objectItem as { name: string }).name === locationName,
    );
    if (foundKey) {
      foundKey += toFind.substring(toFind.length - 2);
    }
  }

  // possible categorical
  if (!foundKey && toFind && toFind.includes('_')) {
    foundKey = findCategoricalKey(object, toFind);
  }

  return foundKey ?? toFind;
};

export default getParentKeyByNameValue;