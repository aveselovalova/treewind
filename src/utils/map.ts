import { token } from './mapToken';
import { ICoordinate, ISize } from './interfaces';

const mapCenter: ICoordinate = {
	longitude: 13.3904503,
	latitude: 52.5190909,
};

const MAPBOX_ACCESS_TOKEN = token;
const MAPBOX_THEME = 'mapbox://styles/mapbox/dark-v10';

const initialViewState = {
	...mapCenter,
	zoom: 14,
	pitch: 30,
	bearing: -30,
};

const deckGLSize: ISize = {
	width: '100%',
	height: '100vh',
};

const mapboxSize: ISize = {
	width: '',
	height: '',
};

export { MAPBOX_ACCESS_TOKEN, MAPBOX_THEME, initialViewState, deckGLSize, mapboxSize };
