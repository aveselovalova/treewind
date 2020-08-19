import { COORDINATES_OFFSET, LATITUDE_WIND_INCREMENT, MIN_POINTS_IN_POLYGON } from './constants';

export const calculateWebDegree = (radians: number) => radians * (180 / Math.PI) * -1 + 90;

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

const toRadians = degree => degree * (Math.PI / 180);

function rotate(treeLon, treeLat, x, y, degree) {
	const radians = toRadians(degree);
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	const nx = cos * (x - treeLon) + sin * (y - treeLat) + treeLon;
	const ny = cos * (y - treeLat) - sin * (x - treeLon) + treeLat;
	return [nx, ny];
}

export const getWindLayerCoordinates = (longitude: number, latitude: number, windPower = 0, degree?) => {
	// пр часовой стрелке
	const longitudes = generateFibonacciLongitudes(longitude, windPower);

	const l = generateLeftFunction(longitudes, [[longitude, latitude]], LATITUDE_WIND_INCREMENT);
	const r = generateRightFunction(longitudes, l, latitude);
	const rotated = r.map(a => rotate(longitude, latitude, a[0], a[1], degree)); // angle has +90 degrees offset
	const a = [...rotated, [longitude, latitude]];
	return a.map(item => [item[1], item[0]]);
};
