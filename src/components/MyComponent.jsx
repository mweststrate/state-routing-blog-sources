import React from 'react';
import { observer } from 'mobx-react';

function MyComponent({ store }) {
  const clickButton = store.clickButton.bind(store);
  return (
    <div>
      <button type="button" onClick={ clickButton }>Click me!</button>
      <h4>You've clicked the button { store.numClicks } times.</h4>
      <h5>You've clicked button an { store.oddOrEven } number of times.</h5>
    </div>
  );
}

MyComponent.propTypes = {
  store: React.PropTypes.object,
};

export default observer(MyComponent);
