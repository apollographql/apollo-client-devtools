import React, { useState } from 'react';
import styles from './list-panel.css';
import classnames from 'classnames';

function buildListItems(listItems) {
  const items = Object.keys(listItems);

  if (!items.length) {
    return <li>No items found</li>
  }

  return items.map((key, index) => {
    const item = listItems[key];

    return (
      <li className={styles.listItem} key={index}>
        {key}
      </li>
    );
  });
}

function ListPanel(props) {
  const { listItems, listType } = props;
  const numberOfActiveItems = Object.keys(listItems).length;

  return (
    <div className={styles.container}>
      {/* TODO, implement search functionality. It will search over these list items and the right panel's content */}
      <div className={styles.search}>Search {listType}</div>
      <div>
        <p className={styles.headline}>ACTIVE {listType.toUpperCase()} ({numberOfActiveItems})</p>
        <ul className={styles.list}>
          {buildListItems(listItems)}
        </ul>
      </div>
    </div>
  )
}

export default ListPanel;
