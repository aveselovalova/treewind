import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { LightingEffect, Layer } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
import * as h3 from 'h3-js';

import { ICoordinate } from 'helpers/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from 'helpers/map';
import { colors } from 'helpers/colors';

import Compass from 'components/Compass/Compass';
import { getTargetOffsetPosition, getWindLayerCoordinates } from '../../helpers/utils';

const { longitude, latitude } = initialViewState;
const WIND_POWER = 10; // 1 - 10
const geo3res = 11;
const h3Index = h3.geoToH3(latitude, longitude, geo3res);
const polygon = getWindLayerCoordinates(longitude, latitude, WIND_POWER);
const hexagons = h3.polyfill(polygon, geo3res);
const data = hexagons.map(hex => ({
	mean: 73.333,
	opacity: 255 - h3.h3Distance(h3Index, hex) * (100 / WIND_POWER),
	hex: hex,
}));

const TreeMap: React.FunctionComponent = () => {
	const [targetOffset, setTargetOffset] = useState<ICoordinate>();
	const [scatterplotData, setScatterplotData] = useState<ICoordinate[]>();
	const [wind, setWind] = useState<Layer<any>>(new LineLayer({}));
	const [trees, setTrees] = useState<Layer<any>>(new ScatterplotLayer({}));
	const [polyWind] = useState<any>(
		new H3HexagonLayer({
			id: 'h3-cluster-layer',
			data: [...data],
			pickable: true,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			wireframe: false,
			filled: true,
			extruded: true,
			elevationScale: 20,
			getHexagon: d => d.hex,
			getFillColor: d => [255, 255, 0, d.opacity],
			getElevation: 0,
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
