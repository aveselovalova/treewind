import { IColor } from './interfaces';

const DEFAULT_TREE_COLOR: IColor = {
	name: '-',
	color: [255, 255, 255],
};

export const colors = (function () {
	const treeColors: IColor[] = [];
	const generateRGBDigit = () => Math.floor(Math.random() * 255);

	return {
		generateColors: (trees: string[]) => {
			trees.forEach((treeName: string) => {
				treeColors.push({
					name: treeName,
					color: [generateRGBDigit(), generateRGBDigit(), generateRGBDigit()],
				});
			});
		},
		getColor: (treeName?: string) => {
			if (!treeColors.length || !treeName?.length) {
				return DEFAULT_TREE_COLOR.color;
			}
			return (treeColors.find(treeColor => treeColor.name === treeName) || DEFAULT_TREE_COLOR).color;
		},
	};
})();
