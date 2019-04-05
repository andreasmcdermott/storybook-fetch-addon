import React from 'react';
import addons from '@storybook/addons';
import { getOptions, fetchData, EVENTS } from '../utils';

export default class AsinsComponent extends React.Component {
  state = {};

  mounted = false;
  unsubscribeItemUpdated = null;
  unsubscribeOptionsChanged = null;

  componentDidMount() {
    this.mounted = true;
    const channel = addons.getChannel();
    this.unsubscribeAsinUpdated = channel.on(
      EVENTS.ITEM_UPDATED,
      this.onItemUpdated
    );
    this.unsubscribeOptionsChanged = channel.on(
      EVENTS.OPTIONS_CHANGED,
      this.onOptionsChanged
    );
  }

  componentWillUnmount() {
    this.mounted = false;
    this.unsubscribeItemUpdated && this.unsubscribeItemUpdated();
    this.unsubscribeOptionsChanged && this.unsubscribeOptionsChanged();
  }

  onOptionsChanged = () => {
    if (this.mounted) {
      this.forceUpdate();
    }
  };

  emitItemData = id => () => {
    addons
      .getChannel()
      .emit(EVENTS.FETCHED_DATA, { id, data: this.state[id].data });
  };

  onItemUpdated = ({ value, id }) => {
    if (!this.props.ids.includes(id)) return;

    this.setState({ [id]: { loaded: false } }, () => {
      if (getOptions().valid(value)) {
        fetchData(value)
          .then(data => {
            if (!this.mounted) return;

            this.setState(
              state => ({
                ...state,
                [id]: {
                  loaded: true,
                  error: false,
                  data,
                },
              }),
              this.emitItemData(id)
            );
          })
          .catch(err => {
            if (!this.mounted) return;

            this.setState(
              state => ({
                ...state,
                [id]: {
                  loaded: true,
                  error: true,
                  data: null,
                },
              }),
              this.emitItemData(id)
            );
          });
      }
    });
  };

  render() {
    const { component: Component, ids } = this.props;
    const { defaultProps, map } = getOptions();

    return (
      <Component
        items={ids.map(id => {
          const { data, loaded, error } = this.state[id] || {};
          return {
            props: { ...defaultProps, asin: id, ...map(data) },
            loaded,
            error,
          };
        })}
      />
    );
  }
}
