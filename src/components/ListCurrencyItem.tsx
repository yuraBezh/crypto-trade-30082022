import * as React from 'react';
import { Box, ListItem, ListItemText, Slider } from '@mui/material';

const marks = [
	{
		value: 1000,
		label: '$ 1.000',
	},
	{
		value: 5000,
		label: '$ 5,000',
	},
	{
		value: 10000,
		label: '$ 10,000',
	},
];

const minDistance = 10;

export const ListCurrencyItem = ({ item, rowsMap, onSelectionEnd }: any) => {
	const [value, setValue] = React.useState([400, 2000]);

	const handleChange = (event: any, newValue: any, activeThumb: any) => {
		if (!Array.isArray(newValue)) {
			return;
		}

		if (activeThumb === 0) {
			setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
		} else {
			setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
		}

		onSelectionEnd({ value, item });
	};

	return (
		<ListItem>
			<ListItemText primary={rowsMap[item].name} />
			<ListItemText>
				<Box sx={{ width: 400 }}>
					<Slider
						getAriaLabel={() => 'Minimum distance'}
						value={value}
						onChange={handleChange}
						valueLabelDisplay="auto"
						disableSwap
						marks={marks}
						min={0}
						max={10000}
					/>
				</Box>
			</ListItemText>
		</ListItem>
	);
};
