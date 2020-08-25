import React, { useState, useRef, useEffect } from 'react';

import './Compass.scss';

import { calculateWebDegree, toRadians } from '../../helpers/utils';

interface ICompassProps {
	callbackAngle(degrees: number);
}

const Compass: React.FunctionComponent<ICompassProps> = ({ callbackAngle }) => {
	const [isMouseUp, setIsMouseUp] = useState(true);
	const [previousRad, setPreviousRad] = useState(0);
	const [radians, setRadians] = useState(0);
	const rotateRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isMouseUp) {
			callbackAngle(radians - toRadians(90));
		}
	}, [isMouseUp, radians]);

	function down(event) {
		setIsMouseUp(false);
		const offsetRad = getRotation(event);
		setPreviousRad(offsetRad);
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	const onMove = event => {
		const newRad = getRotation(event);
		setRadians(radians + newRad - previousRad);
		setPreviousRad(newRad);
	};

	const onMouseUp = () => {
		setIsMouseUp(true);
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onMouseUp);
	};

	function getRotation(event) {
		const rotator = rotateRef?.current;
		if (!rotator) {
			return 0;
		}
		const position = getMousePosition(event, rotator);
		return Math.atan2(position.y - rotator.clientHeight * 0.5, position.x - rotator.clientWidth * 0.5);
	}

	const getMousePosition = ({ pageX, pageY }, pointer) => {
		let totalOffsetX = 0;
		let totalOffsetY = 0;
		do {
			totalOffsetX += pointer.offsetLeft - pointer.scrollLeft;
			totalOffsetY += pointer.offsetTop - pointer.scrollTop;
		} while ((pointer = pointer.offsetParent));

		return { x: pageX - totalOffsetX, y: pageY - totalOffsetY };
	};

	return (
		<div className='compass'>
			<div
				className='compass__pointer'
				ref={rotateRef}
				style={{ transform: `rotate(${calculateWebDegree(radians)}deg)` }}
				onMouseDown={down}
			/>
		</div>
	);
};

export default Compass;
