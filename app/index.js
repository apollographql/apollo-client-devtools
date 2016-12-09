import React, { Component, PropTypes } from 'react';
import Panel from './components/Panel';
import { render } from 'react-dom';

import evalInPage from './evalInPage';

// XXX add logger here once AC has the right API


render(<Panel />, document.getElementById('devtools'));
