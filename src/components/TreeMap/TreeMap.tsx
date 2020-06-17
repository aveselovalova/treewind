import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { LightingEffect, Layer } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';

import { ICoordinate } from 'utils/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from 'utils/map';
import { colors } from 'utils/colors';

import Compass from 'components/Compass/Compass';

const TreeMap: React.FunctionComponent = () => {
	const [layers, setLayers] = useState<Layer<any>[]>([]);

	useEffect(() => {
		import('resources/data/fullTreesBerlin.csv').then(async csvTrees => {
			await d3
				.csv(csvTrees.default, (data: any) => ({
					latitude: +data.Y,
					longitude: +data.X,
					color: (data.GATTUNG || '').toLocaleLowerCase(),
				}))
				.then((scatterplotData: ICoordinate[]) => {
					// TODO: prepare data;
					const uniqueTree: string[] = d3
						.map(scatterplotData, tree => tree.color || '')
						.keys()
						.filter(tree => tree);
					// TODO: use localstorage;
					colors.generateColors(uniqueTree);
					setLayers([
						new ScatterplotLayer({
							data: scatterplotData,
							getColor: tree => colors.getColor(tree.color),
							getPosition: tree => [tree.longitude, tree.latitude],
							radiusScale: 4,
						}),
					]);
				});
		});
	}, []);

	return (
		<>
			<Compass />
			<DeckGL
				{...deckGLSize}
				initialViewState={initialViewState}
				layers={layers}
				effects={[new LightingEffect({})]}
				controller
			>
				<StaticMap {...mapboxSize} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={MAPBOX_THEME} />
			</DeckGL>
		</>
	);
};

export default TreeMap;
