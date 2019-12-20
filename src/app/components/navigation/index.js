import React, { useState } from "react";
import "@reach/tabs/styles.css";
import styles from "./navigation.css";
import classnames from "classnames";
import keymirror from "keymirror";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

export const constants = keymirror({
  GRAPHIQL: null,
  QUERIES: null,
  MUTATIONS: null,
  CACHE: null,
});

function buildPanels(children) {
  return children.map((child, index) => {
    return <TabPanel key={index}>{child}</TabPanel>;
  });
}

function Navigation(props) {
  const { GRAPHIQL, QUERIES, MUTATIONS, CACHE } = constants;
  const { numberOfQueries, numberOfMutations, children } = props;

  return (
    <Tabs defaultIndex={2} className={styles.container}>
      <TabList>
        <Tab
          as={"a"}
          href="https://www.apollographql.com/"
          target="_blank"
          alt="apollo logo"
          className={styles.logo}
        ></Tab>
        <Tab className={styles.tab}>
          <div className={styles.text}>{GRAPHIQL}</div>
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
          <div className={styles.text}>{CACHE}</div>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>{/* left blank for the logo */}</TabPanel>
        {buildPanels(children)}
      </TabPanels>
    </Tabs>
  );
}

export default Navigation;
