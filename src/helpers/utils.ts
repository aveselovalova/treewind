import { COORDINATES_OFFSET, LATITUDE_WIND_INCREMENT, MIN_POINTS_IN_POLYGON } from './constants';

export const calculateWebDegree = (radians: number) => -radians * (180 / Math.PI); // radians * (180 / Math.PI) * -1 + 90;

const fibonacci = (n: number) => {
	let preNumb = 0,
		res = 1;
	while (n-- > 1) {
		const tmp = preNumb;
		preNumb = res;
		res += tmp;
	}
	return res;
};

const generateFibonacciLongitudes = (longitude: number, windPower = 0): number[] => {
	let fibNum = 3;
	const longitudes: number[] = [];
	let arrIndex = 0;
	const cuttedWindPower = windPower > 6 ? windPower - 1 : windPower;
	const windPoints = MIN_POINTS_IN_POLYGON + cuttedWindPower;
	while (fibNum < windPoints) {
		longitudes.push(
			fibonacci(fibNum) * COORDINATES_OFFSET + (arrIndex === 0 ? longitude : longitudes[arrIndex - 1])
		);
		fibNum++;
		arrIndex++;
	}
	return longitudes;
};

const generateFunction = (windLongitudes: number[], latitude, longitude, increment: number): number[][] => {
	const l = [[latitude, longitude]];
	const r: number[][] = [];
	const isLastPoint = windLongitudes.length - 1;
	for (let i = 0; i < windLongitudes.length; i++) {
		const currentLat = l[i][0];
		const currentLon = windLongitudes[i];
		l.push([i === isLastPoint ? currentLat : currentLat + increment, currentLon]);

		let item = latitude - LATITUDE_WIND_INCREMENT * (i + 1);
		if (i === isLastPoint) {
			item = r[r.length - 1][0];
		}
		r.push([item, currentLon]);
	}
	return [...l, ...r.reverse()];
};

const generateFunctionGeoJson = (windLongitudes: number[], latitude, longitude, increment: number): number[][] => {
	const l = [[longitude, latitude]];
	const r: number[][] = [];
	const isLastPoint = windLongitudes.length - 1;
	for (let i = 0; i < windLongitudes.length; i++) {
		const currentLat = l[i][1];
		const currentLon = windLongitudes[i];
		l.push([currentLon, i === isLastPoint ? currentLat : currentLat + increment]);

		let item = latitude - increment * (i + 1);
		if (i === isLastPoint) {
			item = r[r.length - 1][1];
		}
		r.push([currentLon, item]);
	}
	return [...l, ...r.reverse()];
};

export const toRadians = degree => degree * (Math.PI / 180);

function rotate(treeLon, treeLat, x, y, radians) {
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [cos * (y - treeLat) - sin * (x - treeLon) + treeLat, cos * (x - treeLon) + sin * (y - treeLat) + treeLon];
}

function rotateGeoJson(treeLon, treeLat, x, y, radians) {
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [cos * (x - treeLon) + sin * (y - treeLat) + treeLon, cos * (y - treeLat) - sin * (x - treeLon) + treeLat];
}

export const getWindLayerCoordinates = (longitude: number, latitude: number, windPower = 0, radians?) => {
	const longitudes = generateFibonacciLongitudes(longitude, windPower); // web 0 === 90 of azimuth (->)
	const generated = generateFunction(longitudes, latitude, longitude, LATITUDE_WIND_INCREMENT);
	const rotated = generated.map(a => rotate(longitude, latitude, a[1], a[0], radians)); // angle has +90 degrees offset
	return [...rotated, [latitude, longitude]];
};

export const getWindLayerCoordinatesGeoJson = (longitude: number, latitude: number, windPower = 0, radians?) => {
	const longitudes = generateFibonacciLongitudes(longitude, windPower); // web 0 === 90 of azimuth (->)
	const generated = generateFunctionGeoJson(
		longitudes,
		latitude,
		longitude,
		windPower >= 6 ? LATITUDE_WIND_INCREMENT / 2 : LATITUDE_WIND_INCREMENT
	);
	const rotated = generated.map(a => rotateGeoJson(longitude, latitude, a[0], a[1], radians)); // angle has +90 degrees offset
	return [...rotated, [longitude, latitude]];
};
