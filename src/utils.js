export const toQueryString = params =>
  Object.entries(params)
    .map(
      ([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    )
    .join('&');

let options = null;

export const setOptions = parameters => {
  const { map, fetch, defaultProps = {} } = parameters;
  if (!map) throw new Error('map is required for fetch-addon');
  if (!fetch) throw new Error('fetch is required for fetch-addon');

  options = { fetch, map, defaultProps };
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
