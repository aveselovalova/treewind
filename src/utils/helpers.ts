import { ICoordinate, Quarter } from './interfaces';

export const calculateWebDegree = (radians: number) => radians * (180 / Math.PI) * -1 + 90;

const chooseQuarter = (degree: number): Quarter => {
	if (degree <= 360 && degree > 180) {
		return Quarter.Second;
	} else if (degree <= 180 && degree > 90) {
		return Quarter.Third;
	} else if (degree <= 90 && degree > 0) {
		return Quarter.Fourth;
	}
	return Quarter.First;
};

export const getWindOffset = (windPower: number, radians: number): ICoordinate => {
	const degree = calculateWebDegree(radians);
	if (degree < 0) {
		radians = (180 + degree) * (Math.PI / 180);
	}
	if (degree > 180) {
		radians = (degree - 360) * (Math.PI / 180);
	}
	const windAbsRadians = Math.abs(radians);
	const xOffset = windPower * Math.sqrt(windAbsRadians);
	const yOffset = windPower * Math.sqrt(1 / windAbsRadians);
	return {
		longitude: xOffset,
		latitude: yOffset,
		quarter: chooseQuarter(calculateWebDegree(radians)),
	};
};

export const getTargetOffsetPosition = (point: ICoordinate, offset?: ICoordinate): [number, number] => {
	if (!offset) {
		return [point.longitude, point.latitude];
	}
	const { longitude, latitude, quarter } = offset;
	switch (quarter) {
		case Quarter.Second:
			return [point.longitude - longitude, point.latitude + latitude];
		case Quarter.Third:
			return [point.longitude - longitude, point.latitude - latitude];
		case Quarter.Fourth:
			return [point.longitude + longitude, point.latitude - latitude];
		case Quarter.First:
		default:
			return [point.longitude + longitude, point.latitude + latitude];
	}
};
