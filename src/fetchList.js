import React from 'react';
import addons from '@storybook/addons';
import FetchListComponent from './components/FetchListComponent';
import { getDefaultValue, EVENTS } from './utils';

export default (items, Component) => {
  const channel = addons.getChannel();

  items.forEach(([id, options]) => {
    const defaultValue = getDefaultValue(options);
    channel.emit(EVENTS.NEW_ITEM, {
      id,
      value: defaultValue,
    });
  });

  return (
    <FetchListComponent component={Component} ids={items.map(([id]) => id)} />
  );
};
