import React from 'react';
import { STORY_CHANGED } from '@storybook/core-events';
import copy from 'copy-to-clipboard';
import qs from 'querystring';
import Button from './Button';
import Input from './Input';
import { ADDON_ID, EVENTS } from '../utils';

const parseQueryString = queryString => {
  const params = qs.parse(queryString);

  return key => {
    const val = params[key];
    return val ? val : '';
  };
};

parseQueryString.reset = () => () => '';

const qsKey = id => `fetch-${id}`;

export default class PanelComponent extends React.Component {
  state = {
    items: {},
    currentStory: this.props.api.getUrlState().storyId,
  };

  queryParam = parseQueryString(this.props.queryString);

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
    this.queryParam = parseQueryString.reset();
    this.setState({ currentStory: kind });
  };

  onNewItem = ({ id, value }) => {
    const fromQs = this.queryParam(qsKey(id));
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

  get url() {
    const queryString = qs.stringify(
      Object.values(this.items)
        .reduce((acc, {id, value}) => {
          acc[qsKey(id)] = value;
          return acc;
        }, {}));
    
    return `${location.origin}${location.pathname}${location.search.replace(
      /\/+/,
      '/'
    )}&${queryString}`;
  }

  handleCopy = () => {
    copy(this.url);
  };

  get items() {
    const { items, currentStory } = this.state;
    return items[currentStory] || {};
  }

  render() {
    const { currentStory } = this.state;
    const { active } = this.props;

    return active ? (
      <div style={{ padding: '0 10px', height: '100%', overflow: 'auto' }}>
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
                minWidth: 100,
                flex: 'none'
              }}
            >
              {id}
            </label>
            <Input
              type="text"
              value={value}
              style={{ width: 100, flex: 'none', }}
              onChange={this.handleValueChange(id)}
            />
            <div style={{ marginLeft: 20, flex: 'auto' }}>
              {showData && (
                <textarea
                  style={{
                    height: 200,
                    width: '100%',
                    border: '1px solid #dedede',
                    display: 'block',
                    marginBottom: '20px',
                  }}
                  readOnly
                >
                  {JSON.stringify(data, null, 2)}
                </textarea>
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
            }}
          >
            <Button
              onClick={this.handleCopy}
              style={{
                borderRadius: '3px 0 0 0',
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
