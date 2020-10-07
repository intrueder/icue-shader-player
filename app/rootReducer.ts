import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import ide from './reducers/ide';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    ide: ide,
  });
}
