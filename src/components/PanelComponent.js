import React from 'react';
import { STORY_CHANGED } from '@storybook/core-events';
import Button from './Button';
import Input from './Input';
import { ADDON_ID, EVENTS } from '../utils';

const parseQueryString = queryString => {
  const params = queryString
    .replace('?', '')
    .split('&')
    .map(p => p.split('='))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return key => {
    const val = params[key];
    return val ? decodeURIComponent(val) : '';
  };
};

parseQueryString.reset = () => () => '';

const qsKey = id => `fetch-${encodeURIComponent(id)}`;

export default class PanelComponent extends React.Component {
  state = {
    items: {},
    currentStory: this.props.api.getUrlState().storyId,
  };

  qs = parseQueryString(this.props.queryString);

  unsubscribeOnNewItem = null;
  unsubscribeOnFetchedData = null;
  unsubscribeOnStoryChanged = null;

  componentDidMount() {
    const { channel } = this.props;
    this.unsubscribeOnNewItem = channel.on(EVENTS.NEW_ITEM, this.onNewItem);
    this.unsubscribeOnFetchedData = channel.on(
      EVENTS.FETCHED_DATA,
      this.onFetchedData
    );
    this.unsubscribeOnStoryChanged = channel.on(
      STORY_CHANGED,
      this.onStoryChanged
    );
  }

  componentWillUnmount() {
    this.unsubscribeOnNewItem && this.unsubscribeOnNewItem();
    this.unsubscribeOnFetchedData && this.unsubscribeOnFetchedData();
    this.unsubscribeOnStoryChanged && this.unsubscribeOnStoryChanged();
  }

  onStoryChanged = kind => {
    this.qs = parseQueryString.reset();
    this.setState({ currentStory: kind });
  };

  onNewItem = ({ id, value }) => {
    const fromQs = this.qs(qsKey(id));
    const urlValue = this.setItemState(id, { id, value: fromQs || value });
  };

  onFetchedData = ({ id, data }) => {
    this.setItemState(id, { data }, false);
  };

  setItemState = (id, state, shouldEmitUpdate = true) => {
    this.setState(
      ({ items, currentStory }) => {
        const itemsInStory = items[currentStory] || {};
        const currentItem = itemsInStory[id] || {};

        return {
          items: {
            ...items,
            [currentStory]: {
              ...itemsInStory,
              [id]: { ...currentItem, ...state },
            },
          },
        };
      },
      shouldEmitUpdate ? this.emitItemUpdated(id) : undefined
    );
  };

  emitItemUpdated = id => () => {
    const { items, currentStory } = this.state;
    const { channel } = this.props;
    channel.emit(EVENTS.ITEM_UPDATED, items[currentStory][id]);
  };

  handleValueChange = id => e => {
    const { value } = e.target;
    this.setItemState(id, { id, value });
  };

  handleToggleApiData = (id, show) => () => {
    this.setItemState(id, { showData: show }, false);
  };

  handleCopy = () => {
    const el = document.getElementById(`${ADDON_ID}/url`);
    el.select();
    document.execCommand('copy');
  };

  get items() {
    const { items, currentStory } = this.state;
    return items[currentStory] || {};
  }

  get url() {
    const qs = Object.values(this.items)
      .map(({ id, value }) => `${qsKey(id)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${location.origin}${location.pathname}${location.search.replace(
      /\/+/,
      '/'
    )}&${qs}`;
  }

  render() {
    const { currentStory } = this.state;
    const { active } = this.props;

    return active ? (
      <div style={{ padding: '0 10px' }}>
        {Object.values(this.items).map(({ id, value, data, showData }) => (
          <div
            key={id}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #dedede',
              padding: '10px 0',
            }}
          >
            <label
              style={{
                fontWeight: 'bold',
                width: 150,
              }}
            >
              {id}
            </label>
            <Input
              type="text"
              value={value}
              onChange={this.handleValueChange(id)}
            />
            <div style={{ marginLeft: 20 }}>
              {showData && (
                <pre
                  style={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    border: '1px solid #dedede',
                  }}
                >
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
              <Button onClick={this.handleToggleApiData(id, !showData)}>{`${
                showData ? 'Hide' : 'Show'
              } Data`}</Button>
            </div>
          </div>
        ))}
        {Object.keys(this.items).length > 0 ? (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '100%',
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            <Input
              id={`${ADDON_ID}/url`}
              type="text"
              value={this.url}
              readOnly
              style={{
                borderRadius: 0,
                flex: '1 0 auto',
                paddingLeft: 8,
                backgroundColor: '#fcfcfc',
                borderLeft: 'none',
                borderBottom: 'none',
              }}
            />
            <Button
              onClick={this.handleCopy}
              style={{
                borderRadius: 0,
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                fontWeight: 'bold',
              }}
            >
              Copy
            </Button>
          </div>
        ) : (
          <p>Fetch is not used for this story.</p>
        )}
      </div>
    ) : null;
  }
}
