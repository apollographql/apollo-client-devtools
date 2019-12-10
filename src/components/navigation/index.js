import React, { useState } from 'react';
import "@reach/tabs/styles.css";
import styles from './navigation.css';
import classnames from 'classnames';
import keymirror from 'keymirror';
import { Tabs, TabList, Tab } from "@reach/tabs";

export const constants = keymirror({
  'GRAPHIQL': null,
  'QUERIES': null,
  'MUTATIONS': null,
  'CACHE': null
});

function Navigation(props) {
  const { GRAPHIQL, QUERIES, MUTATIONS, CACHE } = constants;
  const { client: { numberOfQueries, numberOfMutations } } = props;

  return (
    <Tabs defaultIndex={2} className={styles.container}>
      <TabList>
        <Tab className={styles.logo}></Tab>
        <Tab className={styles.tab}>
          <div className={styles.text}>
            {GRAPHIQL}
          </div>
        </Tab>
        <Tab className={styles.tab}>
          <div className={styles.text}>
            {QUERIES} ({numberOfQueries})
          </div>
        </Tab>
        <Tab className={styles.tab}>
          <div className={styles.text}>
            {MUTATIONS} ({numberOfMutations})
          </div>
        </Tab>
        <Tab className={styles.tab}>
          <div className={styles.text}>
            {CACHE}
          </div>
        </Tab>
      </TabList>
    </Tabs>
  )
}

export default Navigation;
