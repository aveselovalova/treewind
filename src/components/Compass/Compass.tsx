import React, { useState, useRef } from 'react';

import './Compass.scss';

import { Icon } from 'components/Icon/Icon';
import { calculateWebDegree } from '../../helpers/utils';

interface ICompassProps {
	callbackAngle(degrees: number);
}

const Compass: React.FunctionComponent<ICompassProps> = ({ callbackAngle }) => {
	const [isDragged, setIsDragged] = useState(false);
	const [rotation, setRotation] = useState(-90);
	const rotateRef = useRef<HTMLDivElement>(null);

	const onMove = event => {
		event.preventDefault();
		const rotator = rotateRef?.current;
		if (!isDragged || !rotator) {
			return;
		}
		const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = rotator;
		const { pageX, pageY } = event;

		const centerX = offsetLeft + offsetWidth / 2;
		const centerY = offsetTop + offsetHeight / 2;
		const radians = Math.atan2(pageX - centerX, pageY - centerY);
		setRotation(calculateWebDegree(radians));
	};

	const requestCallback = () => {
		if (isDragged) {
			callbackAngle(rotation);
		}
		setIsDragged(false);
	};

	return (
		<div className='compass' onMouseMove={onMove} onMouseUp={requestCallback} onMouseLeave={requestCallback}>
			<div
				className='compass__rose'
				ref={rotateRef}
				style={{ transform: `rotate(${rotation}deg)` }}
				onMouseDown={() => setIsDragged(true)}
				onMouseUp={requestCallback}
				onMouseLeave={requestCallback}
			>
				<Icon name='compass-pointer' title='pointer' className='compass__pointer' />
			</div>
		</div>
	);
};

export default Compass;
