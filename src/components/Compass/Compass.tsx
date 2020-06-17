import React, { useState, useRef } from 'react';

import './Compass.scss';

import { Icon } from 'components/Icon/Icon';
import { ICoordinate } from '../../utils/interfaces';
import { calculateWebDegree, getWindOffset } from '../../utils/helpers';

interface ICompassProps {
	callback: (offset: ICoordinate) => void;
}

const Compass: React.FunctionComponent<ICompassProps> = ({ callback }) => {
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

		const windPower = 0.008;
		callback(getWindOffset(windPower, radians));
	};

	return (
		<div
			className='compass'
			onMouseMove={onMove}
			onMouseUp={() => setIsDragged(false)}
			onMouseLeave={() => setIsDragged(false)}
		>
			<div
				className='compass__rose'
				ref={rotateRef}
				style={{ transform: `rotate(${rotation}deg)` }}
				onMouseDown={() => setIsDragged(true)}
				onMouseUp={() => setIsDragged(false)}
				onMouseLeave={() => setIsDragged(false)}
			>
				<Icon name='compass-pointer' title='pointer' className='compass__pointer' />
			</div>
		</div>
	);
};

export default Compass;
