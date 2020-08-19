import { token as MAPBOX_ACCESS_TOKEN } from './mapToken';
import { ICoordinate, ISize } from './interfaces';

const mapCenter: ICoordinate = {
	longitude: 13.288302837149901,
	latitude: 52.6586786825698,
};
//13.2883028371499, 52.6586786825698
const MAPBOX_THEME = 'mapbox://styles/mapbox/dark-v10';

const initialViewState = {
	...mapCenter,
	zoom: 15,
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
