import { createStore, combineReducers } from 'redux';

function makeHydratable(reducer, hydrateActionType) {
  return (state, action) => {
    switch (action.type) {
      case hydrateActionType:
        return reducer(action.state, action);
      default:
        return reducer(state, action);
    }
  }
}

export default function configureStore(extraReducers) {
  const rootReducer = combineReducers(Object.assign({}, extraReducers));
  const reducerWithHydrate = makeHydratable(rootReducer, '@@HYDRATE');

  return createStore(reducerWithHydrate);
}
