import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { LightingEffect, Layer } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
import * as h3 from 'h3-js';

import { ICoordinate } from 'helpers/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from 'helpers/map';
import { colors } from 'helpers/colors';

import Compass from 'components/Compass/Compass';
import { getWindLayerCoordinates } from '../../helpers/utils';

const WIND_POWER = 2; // 1 - 10
const hexSize = 12; // 14 - smallest

const TreeMap: React.FunctionComponent = () => {
	const [targetOffset, setTargetOffset] = useState<number>();
	const [scatterplotData, setScatterplotData] = useState<ICoordinate[]>();
	const [trees, setTrees] = useState<Layer<any>>(new ScatterplotLayer({}));
	const [polyWind, setPolyWind] = useState<any>(null);

	useEffect(() => {
		import('../../resources/data/out.csv').then(async csvTrees => {
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
		if (!targetOffset) {
			return;
		}
		const trees: any = [];
		scatterplotData?.forEach(tree => {
			const h3Index = h3.geoToH3(tree.latitude, tree.longitude, hexSize);
			const polygon = getWindLayerCoordinates(tree.longitude, tree.latitude, WIND_POWER, targetOffset);
			const hexagons = h3.polyfill(polygon, hexSize);
			const thex = hexagons.map(hex => {
				const opacity = 255 - h3.h3Distance(h3Index, hex) * (100 / WIND_POWER);
				return {
					mean: 73.333,
					opacity: opacity < 0 ? 0 : opacity,
					hex: hex,
					color: colors.getColor(tree.color),
				};
			});
			trees.push(...thex);
		});
		if (!trees.length) {
			return;
		}
		setPolyWind(
			new H3HexagonLayer({
				id: 'h3-wind',
				data: trees,
				pickable: true,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				wireframe: false,
				filled: true,
				extruded: true,
				elevationScale: 20,
				getHexagon: d => d.hex,
				getFillColor: d => [...d.color, d.opacity],
				getElevation: 0,
			})
		);
	}, [targetOffset]);

	return (
		<>
			<Compass callbackAngle={setTargetOffset} />
			<DeckGL
				{...deckGLSize}
				initialViewState={initialViewState}
				layers={[trees, polyWind]}
				effects={[new LightingEffect({})]}
				controller
				onClick={info => console.log(info)}
			>
				<StaticMap {...mapboxSize} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={MAPBOX_THEME} />
			</DeckGL>
		</>
	);
};

export default TreeMap;
