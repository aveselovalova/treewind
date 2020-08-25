export interface ICoordinate {
	latitude: number;
	longitude: number;

	color?: string;
}

export interface ISize {
	width: string | number;
	height: string | number;
}

export interface IColor {
	name: string;
	color: [number, number, number];
}

export interface IH3Point {
	opacity: number;
	hex: string;

	color?: string;
}
