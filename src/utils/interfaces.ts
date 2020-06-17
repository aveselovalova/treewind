export enum Quarter {
	First,
	Second,
	Third,
	Fourth,
}

export interface ICoordinate {
	latitude: number;
	longitude: number;

	color?: string;
	quarter?: Quarter;
}

export interface ISize {
	width: string | number;
	height: string | number;
}

export interface IColor {
	name: string;
	color: [number, number, number];
}
