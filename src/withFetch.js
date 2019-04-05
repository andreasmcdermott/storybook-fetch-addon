import React from 'react';
import addons, { makeDecorator } from '@storybook/addons';
import { setOptions, EVENTS } from './utils';

export default makeDecorator({
  name: 'withFetch',
  parameterName: 'fetch',
  skipIfNoParametersOrOptions: true,
  wrapper: (getStory, context, { parameters }) => {
    const channel = addons.getChannel();
    setOptions(parameters);
    channel.emit(EVENTS.OPTIONS_CHANGED);
    return getStory(context);
  },
});
