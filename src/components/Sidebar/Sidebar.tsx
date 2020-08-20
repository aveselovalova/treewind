import React, { useState, useEffect } from 'react';

import './Sidebar.scss';

import Compass from 'components/Compass/Compass';

interface ICompassProps {
	uniqueTrees: string[];
	callbackAngle(degrees: number);
	filterCallback(trees: string[]);
}

const Sidebar: React.FunctionComponent<ICompassProps> = ({ callbackAngle, uniqueTrees, filterCallback }) => {
	const [checked, setChecked] = useState<string[]>([]);
	const [isTouched, setIsTouched] = useState(false);

	useEffect(() => {
		if (uniqueTrees?.length) {
			setChecked(uniqueTrees);
		}
	}, [uniqueTrees]);

	useEffect(() => {
		if (isTouched) {
			filterCallback(checked);
		}
	}, [checked, isTouched]);

	return (
		<div className='sidebar'>
			<Compass callbackAngle={callbackAngle} />
			<h3>Wind power</h3>
			{/* TODO: slider */}
			<h3>Trees filter</h3>
			<ul className='sidebar__checkboxes'>
				<li>
					<label>
						<input
							type='checkbox'
							checked={checked?.length === uniqueTrees?.length}
							onChange={event => {
								setIsTouched(true);
								setChecked(event.currentTarget.checked ? uniqueTrees : []);
							}}
						/>
						all
					</label>
				</li>
				{uniqueTrees.map(tree => (
					<li key={tree}>
						<label>
							<input
								type='checkbox'
								checked={!!~checked.findIndex(ch => ch === tree)}
								onChange={event => {
									setIsTouched(true);
									if (event.currentTarget.checked) {
										setChecked([...checked, tree]);
									} else {
										const index = checked.indexOf(tree);
										if (~index) {
											setChecked([...checked.slice(0, index), ...checked.slice(index + 1)]);
										}
									}
								}}
							/>
							{tree}
						</label>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Sidebar;
