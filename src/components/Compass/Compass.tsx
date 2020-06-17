import React, { useState, useRef } from 'react';

import './Compass.scss';

import { Icon } from 'components/Icon/Icon';

const Compass: React.FunctionComponent = () => {
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
		const degree = radians * (180 / Math.PI) * -1 + 90;
		setRotation(degree);
	};

	const UnsubscribedDiv = props => (
		<div {...props} onMouseUp={() => setIsDragged(false)} onMouseLeave={() => setIsDragged(false)} />
	);

	return (
		<UnsubscribedDiv className='compass' onMouseMove={onMove}>
			<div
				className='compass__rose'
				ref={rotateRef}
				style={{ transform: `rotate(${rotation}deg)` }}
				onMouseDown={() => setIsDragged(true)}
			>
				<Icon name='compass-pointer' title='pointer' className='compass__pointer' />
			</div>
		</UnsubscribedDiv>
	);
};

export default Compass;
