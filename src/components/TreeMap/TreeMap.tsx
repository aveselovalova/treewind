import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { LightingEffect } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
import * as h3 from 'h3-js';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

import { ICoordinate, IH3Point } from 'helpers/interfaces';
import { MAPBOX_ACCESS_TOKEN, initialViewState, deckGLSize, MAPBOX_THEME, mapboxSize } from 'helpers/map';
import { colors } from 'helpers/colors';

import Sidebar from 'components/Sidebar/Sidebar';

const hexSize = 12; // 14 - smallest

const TreeMap: React.FunctionComponent = () => {
	const [initialData, setInitialData] = useState<ICoordinate[]>([]);
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

	const filterTrees = (filteredTreeNames: string[]): ICoordinate[] => {
		if (filteredTreeNames?.length !== uniqueTrees?.length) {
			return initialData.filter(value => filteredTreeNames.some(t => t === value.color));
		}
		return initialData;
	};

	const calculateHex = (filteredTrees: ICoordinate[], windPower, offsetAngle) => {
		const trees: IH3Point[] = [];
		const promises = [];
		filteredTrees.forEach(tree => {
			const h3Index = h3.geoToH3(tree.latitude, tree.longitude, hexSize);
			const request = {
				resolution: hexSize,
				longitude: tree.longitude,
				latitude: tree.latitude,
				windPower: windPower,
				offset: offsetAngle,
			};
			promises.push(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				axios
					.post('http://127.0.0.1:8000/hexagons', {
						body: JSON.stringify(request),
					})
					.then(({ data }) => {
						const hexagons = JSON.parse(data.hex);
						const tmp: IH3Point[] = [];
						hexagons.forEach(hex => {
							const direction = h3.h3Distance(h3Index, hex);
							const opacity = 255 - direction * (80 / windPower);
							if (opacity > 0) {
								tmp.push({ opacity: h3.h3Distance(h3Index, hex), hex, color: tree.color });
							}
						});
						trees.push(...tmp);
					})
					.catch(err => console.log(err))
			);
		});
		Promise.all(promises).then(() => {
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
					getFillColor: d => {
						const o = 255 - d.opacity * (80 / windPower);
						return [...colors.getColor(d.color), o > 0 ? o : 10];
					},
					getElevation: 0,
				})
			);
		});
	};

	const getWindSettings = (windPower: number, directionRadiansAngle: number, filteredTrees: string[]) => {
		const filtered = filterTrees(filteredTrees);
		setTrees(
			new ScatterplotLayer({
				data: filtered,
				getFillColor: tree => colors.getColor(tree.color),
				getPosition: tree => [tree.longitude, tree.latitude],
				radiusScale: 4,
			})
		);
		console.log(filtered.length);
		console.time('tree');
		calculateHex(filtered, windPower, directionRadiansAngle);
		console.timeEnd('tree');
	};

	return (
		<>
			{uniqueTrees?.length && <Sidebar uniqueTrees={uniqueTrees} getWindSettings={getWindSettings} />}
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
