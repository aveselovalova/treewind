import React, { useState } from 'react';
import { ReactSVG } from 'react-svg';

export interface IIconProps {
	name: string;
	title: string;

	onClick?: (event) => void;
	className?: string;
}

export const Icon: React.FunctionComponent<IIconProps> = ({ name, title, onClick, className }) => {
	const [src, setSrc] = useState('');
	import(`resources/icons/${name}.svg`).then(svg => setSrc(svg.default));
	return (
		<ReactSVG
			src={src}
			title={title}
			onClick={onClick}
			fallback={() => <>{title}</>}
			className={className}
			wrapper='span'
		/>
	);
};
