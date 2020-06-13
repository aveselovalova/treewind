import React, { useState, useEffect } from 'react';

import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { LightingEffect, Layer } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import { csv } from 'd3';

import './TreeMap.scss';

import { ICoordinate } from '../../utils/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from '../../utils/map';

const TreeMap: React.FunctionComponent = () => {
	const [layers, setLayers] = useState<Layer<any>[]>([]);

	useEffect(() => {
		import('../../data/fullTreesBerlin.csv').then(async csvTrees => {
			await csv(csvTrees.default, (data: any) => ({
				latitude: +data.Y,
				longitude: +data.X,
			})).then((scatterplotData: ICoordinate[]) => {
				setLayers([
					new ScatterplotLayer({
						data: scatterplotData,
						getColor: [144, 238, 144],
						getPosition: point => [point.longitude, point.latitude],
						radiusScale: 4,
					}),
				]);
			});
		});
	}, []);

	return (
		<DeckGL
			{...deckGLSize}
			initialViewState={initialViewState}
			layers={layers}
			effects={[new LightingEffect({})]}
			controller
		>
			<StaticMap {...mapboxSize} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={MAPBOX_THEME} />
		</DeckGL>
	);
};

export default TreeMap;
