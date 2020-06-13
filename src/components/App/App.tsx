import React, { FunctionComponent } from 'react';
import './App.scss';

import TreeMap from '../TreeMap/TreeMap';

// TODO: preloader
const App: FunctionComponent = () => (
	<div className='app'>
		<TreeMap />
	</div>
);

export default App;
