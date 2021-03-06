const identity = x => x;
const alwaysValid = () => true;

let options = null;
export const setOptions = parameters => {
  const { fetch, map = identity, valid = alwaysValid, defaultProps = {} } = parameters;
  if (!fetch) throw new Error('fetch is required for storybook-fetch-addon');

  options = { fetch, map, valid, defaultProps };
};

export const getOptions = () => options;

export const getDefaultValue = options =>
  typeof options === 'string'
    ? options
    : !!options && !!options.defaultValue
    ? options.defaultValue
    : '';

const createCache = () => {
  const cache = {};
  return fn => key => {
    if (typeof cache[key] !== 'undefined') return Promise.resolve(cache[key]);
    return fn(key).then(val => {
      cache[key] = val;
      return val;
    });
  };
};

const cache = createCache();
export const fetchData = cache(value => getOptions().fetch(value));

export const ADDON_ID = 'fetch-addon';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const EVENTS = {
  ITEM_UPDATED: `${ADDON_ID}/onItemUpdated`,
  OPTIONS_CHANGED: `${ADDON_ID}/onOptionsChanged`,
  NEW_ITEM: `${ADDON_ID}/onNewItem`,
  FETCHED_DATA: `${ADDON_ID}/onFetchedData`,
};
