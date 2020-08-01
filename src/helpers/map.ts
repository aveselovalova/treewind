import { token as MAPBOX_ACCESS_TOKEN } from './mapToken';
import { ICoordinate, ISize } from './interfaces';

const mapCenter: ICoordinate = {
	longitude: 13.30584286581414,
	latitude: 52.6342,
};
//13.2883028371499, 52.6586786825698
const MAPBOX_THEME = 'mapbox://styles/mapbox/dark-v10';

const initialViewState = {
	...mapCenter,
	zoom: 18,
	pitch: 0,
	bearing: 0,
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
