import React from 'react';
import addons, { types } from '@storybook/addons';
import PanelComponent from './components/PanelComponent';
import { PANEL_ID, ADDON_ID } from './utils';

addons.register(ADDON_ID, api => {
  const channel = api.getChannel();
  const queryString = location.search;
  const render = ({ active, key }) => (
    <PanelComponent
      key={key}
      api={api}
      channel={channel}
      active={active}
      queryString={queryString}
    />
  );

  const title = 'Fetch';

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title,
    render,
  });
});
