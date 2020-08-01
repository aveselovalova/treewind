import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { LineLayer, ScatterplotLayer, PolygonLayer } from '@deck.gl/layers';
import { LightingEffect, Layer } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';

import { ICoordinate } from 'helpers/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from 'helpers/map';
import { colors } from 'helpers/colors';

import Compass from 'components/Compass/Compass';
import { getTargetOffsetPosition, getWindLayerCoordinates } from '../../helpers/utils';

const TreeMap: React.FunctionComponent = () => {
	const [targetOffset, setTargetOffset] = useState<ICoordinate>();
	const [scatterplotData, setScatterplotData] = useState<ICoordinate[]>();
	const [wind, setWind] = useState<Layer<any>>(new LineLayer({}));
	const [trees, setTrees] = useState<Layer<any>>(new ScatterplotLayer({}));
	const [polyWind, setPolyWind] = useState<Layer<any>>(
		new PolygonLayer({
			id: 'poly-layers',
			data: [{ contours: getWindLayerCoordinates(13.3058, 52.6342), name: 'tmp_example' }],
			stroked: false,
			filled: true,
			extruded: false,
			wireframe: true,
			lineWidthMinPixels: 1,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			getPolygon: d => d.contours,
			getFillColor: [80, 80, 80, 80],
			getLineWidth: 250,
		})
	);

	useEffect(() => {
		import('../../resources/data/fullTreesBerlin.csv').then(async csvTrees => {
			await d3
				.csv(csvTrees.default, (data: any) => ({
					latitude: +data.Y,
					longitude: +data.X,
					color: (data.GATTUNG || '').toLocaleLowerCase(),
				}))
				.then((scatterplotData: ICoordinate[]) => {
					// TODO: prepare data;
					setScatterplotData(scatterplotData);
					const uniqueTree: string[] = d3
						.map(scatterplotData, tree => tree.color || '')
						.keys()
						.filter(tree => tree);
					// TODO: use localstorage;
					colors.generateColors(uniqueTree);
					setTrees(
						new ScatterplotLayer({
							data: scatterplotData,
							getColor: tree => colors.getColor(tree.color),
							getPosition: tree => [tree.longitude, tree.latitude],
							radiusScale: 4,
						})
					);
				});
		});
	}, []);

	useEffect(() => {
		if (!targetOffset || !wind.props.data) {
			return;
		}

		// TODO: setPolyWind rotation

		setWind(
			new LineLayer({
				id: 'flight-paths',
				data: scatterplotData,
				opacity: 0.8,
				getSourcePosition: d => [d.longitude, d.latitude],
				getTargetPosition: d => getTargetOffsetPosition(d, targetOffset),
				getColor: tree => colors.getColor(tree.color),
				updateTriggers: {
					getTargetPosition: d => getTargetOffsetPosition(d, targetOffset),
				},
			})
		);
	}, [targetOffset]);

	return (
		<>
			<Compass callback={setTargetOffset} />
			<DeckGL
				{...deckGLSize}
				initialViewState={initialViewState}
				layers={[trees, polyWind]}
				effects={[new LightingEffect({})]}
				controller
			>
				<StaticMap {...mapboxSize} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={MAPBOX_THEME} />
			</DeckGL>
		</>
	);
};

export default TreeMap;
