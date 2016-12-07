// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension

import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import Explorer from './Explorer';

render(<Explorer />, document.getElementsByTagName('body')[0]);
