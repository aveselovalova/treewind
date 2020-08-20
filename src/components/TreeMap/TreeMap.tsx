import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { LightingEffect, Layer } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
import * as h3 from 'h3-js';
import 'mapbox-gl/dist/mapbox-gl.css';

import { ICoordinate } from 'helpers/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from 'helpers/map';
import { colors } from 'helpers/colors';

import Sidebar from 'components/Sidebar/Sidebar';
import { getWindLayerCoordinates } from '../../helpers/utils';

const WIND_POWER = 5; // 1 - 10
const hexSize = 11; // 14 - smallest
const colorFade = 100 / (WIND_POWER + 20);

const TreeMap: React.FunctionComponent = () => {
	const [targetOffset, setTargetOffset] = useState<number>();
	const [initialData, setInitialData] = useState<ICoordinate[]>([]);
	const [scatterplotData, setScatterplotData] = useState<ICoordinate[]>([]);
	const [uniqueTrees, setuniqueTrees] = useState<string[]>([]);
	const [trees, setTrees] = useState(new ScatterplotLayer({}));
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
					setInitialData(scatterplotData);
					const uniqueTreeArr: string[] = d3
						.map(scatterplotData, tree => tree.color || '')
						.keys()
						.filter(tree => tree);
					// TODO: use localstorage;
					setuniqueTrees(uniqueTreeArr);
					colors.generateColors(uniqueTreeArr);
					setTrees(
						new ScatterplotLayer({
							data: scatterplotData,
							getFillColor: tree => colors.getColor(tree.color),
							getPosition: tree => [tree.longitude, tree.latitude],
							radiusScale: 4,
						})
					);
				});
		});
	}, []);

	useEffect(() => {
		if (!targetOffset && !scatterplotData.length) {
			return;
		}
		const trees: any = [];
		console.time('hex');
		scatterplotData.forEach(tree => {
			const h3Index = h3.geoToH3(tree.latitude, tree.longitude, hexSize);
			const polygon = getWindLayerCoordinates(tree.longitude, tree.latitude, WIND_POWER, targetOffset);
			const hexagons = h3.polyfill(polygon, hexSize);
			const color = colors.getColor(tree.color);
			trees.push(
				...hexagons.map(hex => {
					const opacity = 255 - h3.h3Distance(h3Index, hex) * (100 / WIND_POWER) - 150;
					return { opacity, hex, color };
				})
			);
		});
		console.timeEnd('hex');

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
				getFillColor: d => [...d.color, d.opacity < 0 ? 0 : d.opacity],
				getElevation: 0,
			})
		);
	}, [targetOffset]);

	const filterCallback = filteredTrees => {
		if (filteredTrees?.length !== uniqueTrees) {
			const filtered = initialData.filter(value => filteredTrees.some(t => t === value.color));
			setScatterplotData(filtered);
			setTrees(
				new ScatterplotLayer({
					data: filtered,
					getFillColor: tree => colors.getColor(tree.color),
					getPosition: tree => [tree.longitude, tree.latitude],
					radiusScale: 4,
				})
			);
		}
	};

	return (
		<>
			{uniqueTrees?.length && (
				<Sidebar callbackAngle={setTargetOffset} uniqueTrees={uniqueTrees} filterCallback={filterCallback} />
			)}
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
