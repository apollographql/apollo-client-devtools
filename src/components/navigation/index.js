import React, { useState } from 'react';
import styles from './navigation.css';
import classnames from 'classnames';
import keymirror from 'keymirror';

export const constants = keymirror({
  'GRAPHIQL': null,
  'QUERIES': null,
  'MUTATIONS': null,
  'CACHE': null
});

function setActiveItem(activeItem) {
  return function getClasses(name) {
    return classnames(styles.item, {
      [styles.active]: activeItem === name
    })
  }
}

function Navigation(props) {
  const { GRAPHIQL, QUERIES, MUTATIONS, CACHE } = constants;
  const defaultActiveItem = QUERIES;
  const [active, setActive] = useState(defaultActiveItem);
  const getClasses = setActiveItem(active);
  const { client: { numberOfQueries, numberOfMutations } } = props;

  return (
    <div className={styles.container}>
      <div className={styles.logo}></div>
      <div onClick={() => { setActive(GRAPHIQL) }} className={getClasses(GRAPHIQL)}>
        {GRAPHIQL}
      </div>
      <div onClick={() => { setActive(QUERIES) }} className={getClasses(QUERIES)}>
        {QUERIES} ({numberOfQueries})
      </div>
      <div onClick={() => { setActive(MUTATIONS) }} className={getClasses(MUTATIONS)}>
        {MUTATIONS} ({numberOfMutations})
      </div>
      <div onClick={() => { setActive(CACHE) }} className={getClasses(CACHE)}>
        {CACHE}
      </div>
    </div>
  )
}

export default Navigation;
