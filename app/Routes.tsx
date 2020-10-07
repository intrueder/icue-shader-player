/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './components/App';

// Lazily load routes and code split with webpack
const LazyHomePage = React.lazy(() =>
  import(/* webpackChunkName: "HomePage" */ './components/Home.container')
);

const HomePage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyHomePage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
