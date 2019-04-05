# storybook-fetch-addon
Storybook addon for fetching data from api

## Install

```
npm i --save-dev storybook-fetch-addon
```

## Setup

```js
// In addons.js

import 'storybook-fetch-addon/register';
```

```js
// In config.js

import { addDecorator, addParameters } from '@storybook/react';
import { withFetch } from 'storybook-fetch-addon';

addDecorator(withFetch);

addParameters({
  fetch: {
     // Required:
    fetch: param => fetch(`https://my-api.com?id=${param}`),
    map: data => { 
      // transform data from api
      return props;
    },
    
    // Optional
    defaultProps: {
      return { /* default props */ };
    }
  }
```

## API

### fetchSingle

`(id, component, defaultValue) => Component`

* id: string that identifies the item.
* component: React component that will be passed the fetched props.
* defaultValue: string that will be used as default value for fetching data.


### fetchList

`(items, component) => Component`

* items: array of id/defaultValue pairs. [[id, defaultValue], [id, defaultValue]]
* component: React component that will be passed the fetched props for all items.

### Example

```js
import { fetchSingle, fetchList } from 'storybook-fetch-addon';

storiesOf('My Component')
  .add('single', () => fetchSingle(
    'Item 1', 
    ({ props, loaded, error }) => <MyComponent {...props} />,
    'default value'
  ))
  .add('list', () => fetchList(
    [
      ['Item 1', 'default 1'],
      ['Item 2', 'default 2']
    ],
    ({ items }) => (
      <ul>
        {items.map(({ props, loaded, error }) => <MyComponent key={props.id} {...props} />)}
      </ul>
    )
  ));
```
