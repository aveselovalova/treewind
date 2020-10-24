import React, { useState, useEffect } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';

import './Sidebar.scss';

import Compass from 'components/Compass/Compass';

interface ICompassProps {
	uniqueTrees: string[];
	onCalculate(windPower: number, directionRadiansAngle: number, trees: string[]);
	onChecked(treeNames: string[]);
}

const Sidebar: React.FunctionComponent<ICompassProps> = ({ onCalculate, uniqueTrees, onChecked }) => {
	const [checked, setChecked] = useState<string[]>([]);
	const [windPower, setWindPower] = useState(5);
	const [radians, setRadians] = useState<number>(0);

	useEffect(() => {
		if (uniqueTrees?.length) {
			setChecked(uniqueTrees);
		}
	}, [uniqueTrees]);

	const calculate = () => onCalculate(windPower, radians, checked);

	return (
		<div className='sidebar'>
			<h3>Wind direction</h3>
			<div className='sidebar__center'>
				<Compass callbackAngle={setRadians} />
			</div>
			<h3>Wind power</h3>
			<Slider
				value={windPower}
				getAriaValueText={value => `${value}m/c`}
				aria-labelledby='discrete-slider'
				valueLabelDisplay='auto'
				marks
				step={1}
				min={2}
				max={10}
				onChange={(event, value: number) => {
					setWindPower(value);
				}}
			/>
			<div className='sidebar__center'>
				<Button variant='contained' color='secondary' onClick={calculate}>
					Calculate
				</Button>
			</div>
			<h3>Trees filter</h3>
			<FormControlLabel
				control={
					<Checkbox
						checked={checked?.length === uniqueTrees?.length}
						onChange={({ currentTarget }) => {
							const allTrees = currentTarget.checked ? uniqueTrees : [];
							setChecked(allTrees);
							onChecked(allTrees);
						}}
						color='primary'
					/>
				}
				label='all'
			/>
			<ul className='sidebar__checkboxes'>
				{uniqueTrees.map(tree => (
					<li key={tree}>
						<FormControlLabel
							control={
								<Checkbox
									checked={!!~checked.findIndex(ch => ch === tree)}
									onChange={({ currentTarget }) => {
										let trees: string[] = [];
										if (currentTarget.checked) {
											trees = [...checked, tree];
										} else {
											const index = checked.indexOf(tree);
											if (~index) {
												trees = [...checked.slice(0, index), ...checked.slice(index + 1)];
											}
										}
										setChecked(trees);
										onChecked(trees);
									}}
									color='primary'
								/>
							}
							label={tree}
						/>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Sidebar;
