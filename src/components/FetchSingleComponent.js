import React from 'react';
import addons from '@storybook/addons';
import { getOptions, EVENTS, fetchData } from '../utils';

export default class FetchSingleComponent extends React.Component {
  state = {
    loaded: false,
    error: false,
    data: {},
  };

  mounted = false;
  unsubscribeItemUpdated = null;
  unsubscribeOptionsChanged = null;

  componentDidMount() {
    this.mounted = true;
    const channel = addons.getChannel();
    this.unsubscribeItemUpdated = channel.on(
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

  emitItemData = () => {
    addons
      .getChannel()
      .emit(EVENTS.FETCHED_DATA, { id: this.props.id, data: this.state.data });
  };

  onItemUpdated = ({ value, id }) => {
    if (!this.mounted || id !== this.props.id) return;

    this.setState({ loaded: false }, () => {
      if (getOptions().valid(value)) {
        fetchData(value)
          .then(data => {
            if (!this.mounted) return;

            this.setState(
              {
                loaded: true,
                error: false,
                data,
              },
              this.emitItemData
            );
          })
          .catch(err => {
            if (!this.mounted) return;

            this.setState(
              {
                loaded: true,
                error: true,
                data: null,
              },
              this.emitItemData
            );
          });
      }
    });
  };

  render() {
    const { component: Component } = this.props;
    const { loaded, error, data } = this.state;
    const { defaultProps, map } = getOptions();

    return (
      <Component
        props={{ ...defaultProps, ...map(data) }}
        loaded={loaded}
        error={error}
      />
    );
  }
}
