import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { LightingEffect } from '@deck.gl/core';
import { StaticMap } from 'react-map-gl';
import * as d3 from 'd3';
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
		import('./assets/100trees.csv').then(async csvTrees => {
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
		const requestData = {
			resolution: hexSize,
			windPower: windPower,
			offset: offsetAngle,
			trees: filteredTrees,
		};
		axios
			.post('http://127.0.0.1:8000/get-hexagons', {
				body: JSON.stringify(requestData),
			})
			.then(({ data }) => {
				const trees: IH3Point[] = JSON.parse(data.hex);
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
						getFillColor: d => [...colors.getColor(d.color), d.opacity],
						getElevation: 0,
					})
				);
			})
			.catch(err => console.log(err));
	};

	const filterTreesOnChecked = (treeNames: string[]): ICoordinate[] => {
		const filtered = filterTrees(treeNames);
		setTrees(
			new ScatterplotLayer({
				data: filtered,
				getFillColor: tree => colors.getColor(tree.color),
				getPosition: tree => [tree.longitude, tree.latitude],
				radiusScale: 4,
			})
		);
		console.log('TREES COUNT: ', filtered?.length);
		return filtered;
	};

	const getWindSettings = (windPower: number, directionRadiansAngle: number, filteredTrees: string[]) => {
		const filtered = filterTreesOnChecked(filteredTrees);
		calculateHex(filtered, windPower, directionRadiansAngle);
	};

	return (
		<>
			{uniqueTrees?.length && (
				<Sidebar uniqueTrees={uniqueTrees} onCalculate={getWindSettings} onChecked={filterTreesOnChecked} />
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
