import { ICoordinate, Quarter } from './interfaces';
import { COORDINATES_OFFSET, LATITUDE_WIND_INCREMENT, MIN_POINTS_IN_POLYGON } from './constants';

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
	const { longitude, latitude } = point;
	if (!offset) {
		return [longitude, latitude];
	}
	const { longitude: offsetLon, latitude: offsetLat, quarter } = offset;
	switch (quarter) {
		case Quarter.Second:
			return [longitude - offsetLon, latitude + offsetLat];
		case Quarter.Third:
			return [longitude - offsetLon, latitude - offsetLat];
		case Quarter.Fourth:
			return [longitude + offsetLon, latitude - offsetLat];
		case Quarter.First:
		default:
			return [longitude + offsetLon, latitude + offsetLat];
	}
};

const fibonacci = (n: number) => (n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2));

const generateFibonacciLongitudes = (longitude: number, windPower = 0): number[] => {
	let fibNum = 3;
	const longitudes: number[] = [longitude];
	let arrIndex = 1;
	while (fibNum < MIN_POINTS_IN_POLYGON + (windPower !== 0 ? windPower : 0)) {
		longitudes.push(fibonacci(fibNum) * COORDINATES_OFFSET + longitudes[arrIndex - 1]);
		fibNum++;
		arrIndex++;
	}
	return longitudes.splice(1);
};

const generateLeftFunction = (
	longitudes: number[],
	polygon: number[][],
	increment: number,
	shadow?: boolean
): number[][] => {
	const updatedPoly = polygon;
	longitudes.forEach((lon, key) => {
		// значения должны повторяться для выравнивания графика функции
		if (shadow) {
			if (key !== longitudes.length - 1) {
				updatedPoly.push([lon, updatedPoly[key][1] + increment]);
			}
		} else {
			updatedPoly.push([
				lon,
				key === longitudes.length - 1 ? updatedPoly[key][1] : updatedPoly[key][1] + increment,
			]);
		}
	});
	return updatedPoly;
};
const generateRightFunction = (
	longitudes: number[],
	polygon: number[][],
	latitude: number,
	shadow?: boolean
): number[][] => {
	const updatedPoly = polygon;
	const longitudesCount = longitudes.length - 1;
	for (let i = longitudesCount; i >= 0; i--) {
		let item = latitude - LATITUDE_WIND_INCREMENT * i;
		if (i === longitudesCount - 1 && !shadow) {
			// значения должны повторяться для выравнивания графика функции
			item = updatedPoly[updatedPoly.length - 1][1];
		} else if (i < longitudesCount - 1) {
			item = latitude - LATITUDE_WIND_INCREMENT * (i + 1);
		}
		updatedPoly.push([longitudes[i], item]);
	}
	return updatedPoly;
};

export const getWindLayerCoordinates = (longitude: number, latitude: number, windPower = 0) => {
	// пр часовой стрелке
	const longitudes = generateFibonacciLongitudes(longitude, windPower);
	const a = [
		...generateRightFunction(
			longitudes,
			generateLeftFunction(longitudes, [[longitude, latitude]], LATITUDE_WIND_INCREMENT),
			latitude
		),
		[longitude, latitude],
	];
	return a.map(item => [item[1], item[0]]);
};

export const getWindShadow = (longitude: number, latitude: number, windPower = 0) => {
	// пр часовой стрелке
	const longitudes = generateFibonacciLongitudes(longitude, windPower);
	const d = getWindLayerCoordinates(longitude, latitude, windPower);
	console.log(d);
	console.log(~~(d.length / 2));
	const middle = ~~(d.length / 2);
	console.log([...d.slice(0, middle - 1), ...d.slice(middle + 1)]);
	return [...d.slice(0, middle - 1), ...d.slice(middle + 1)];
};
