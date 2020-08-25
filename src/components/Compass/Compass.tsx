import React, { useState, useRef } from 'react';

import './Compass.scss';

import { calculateWebDegree, toRadians } from '../../helpers/utils';

interface ICompassProps {
	callbackAngle(degrees: number);
}

const Compass: React.FunctionComponent<ICompassProps> = ({ callbackAngle }) => {
	const [isDragged, setIsDragged] = useState(false);
	const [radians, setRadians] = useState(0);
	const rotateRef = useRef<HTMLDivElement>(null);

	const onMove = event => {
		// TODO: fix it
		event.preventDefault();
		const rotator = rotateRef?.current;
		if (!isDragged || !rotator) {
			return;
		}
		const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = rotator;
		const { pageX, pageY } = event;

		const centerX = offsetLeft + offsetWidth / 2;
		const centerY = offsetTop + offsetHeight / 2;
		setRadians(Math.atan2(pageX - centerX, pageY - centerY));
	};

	const requestCallback = () => {
		if (isDragged) {
			callbackAngle(-radians - toRadians(90));
		}
		setIsDragged(false);
	};

	return (
		<div className='compass' onMouseMove={onMove} onMouseUp={requestCallback} onMouseLeave={requestCallback}>
			<div
				className='compass__rose'
				ref={rotateRef}
				style={{ transform: `rotate(${calculateWebDegree(radians)}deg)` }}
				onMouseDown={() => setIsDragged(true)}
				onMouseUp={requestCallback}
				onMouseLeave={requestCallback}
			/>
		</div>
	);
};

export default Compass;
