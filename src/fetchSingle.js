import React from 'react';
import addons from '@storybook/addons';
import FetchSingleComponent from './components/FetchSingleComponent';
import { getDefaultValue, EVENTS } from './utils';

export default (id, Component, options) => {
  const defaultValue = getDefaultValue(options);
  const channel = addons.getChannel();
  channel.emit(EVENTS.NEW_ITEM, {
    id,
    value: defaultValue,
  });

  return <FetchSingleComponent id={id} component={Component} />;
};
