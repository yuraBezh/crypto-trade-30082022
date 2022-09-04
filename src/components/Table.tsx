import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Alert, Button, List, Snackbar } from '@mui/material';
import { ListCurrencyItem } from './ListCurrencyItem';
import { generateUUID } from '../utils/uuid';

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

const columns = [
	{ field: 'name', headerName: 'Name', width: 230 },
	{ field: 'symbol', headerName: 'Symbol', width: 130 },
	{
		field: 'price_usd',
		headerName: 'Price',
		type: 'number',
		width: 230,
		valueFormatter: (params: any) => formatter.format(params.value),
	},
	{
		field: 'percent_change_usd_last_24_hours',
		headerName: '24 Change',
		width: 160,
		type: 'number',
		valueFormatter: (params: any) => `${Math.round(params.value * 100) / 100}%`,
	},
];

const uuid = generateUUID();

export default function DataTable() {
	const [rows, setRows] = useState<any>([]);
	const [rowsMap, setRowsMap] = useState<any>({});
	const [selectedItems, setSelectedItems] = useState<any>([]);
	const [connection, setConnection] = useState<any>();
	const [placedItems, setPlacedItems] = useState<any>({});
	const [snack, setSnack] = useState<any>({
		open: false,
		vertical: 'top',
		horizontal: 'center',
		message: [],
	});

	const { open, message, accepted } = snack;

	useEffect(() => {
		const requests = ['btc', 'eth', 'bnb', 'dot', 'doge'].map(crypto =>
			fetch(`https://data.messari.io/api/v1/assets/${crypto}/metrics`)
				.then(response => response.json())
				.then(response => ({
					...response.data,
					price_usd: response.data.market_data.price_usd,
					percent_change_usd_last_24_hours:
						response.data.market_data.percent_change_usd_last_24_hours,
				}))
		);

		Promise.all(requests).then(data => {
			setRows(data);
			setRowsMap(
				data.reduce((acc, curr) => {
					acc[curr.id] = curr;
					return acc;
				}, {})
			);
		});
	}, []);

	useEffect(() => {
		const socket = new WebSocket(
			'wss://demo.piesocket.com/v3/channel_1?api_key=oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm&notify_self'
		);

		setConnection(socket);

		socket.onmessage = function (event: MessageEvent) {
			let data: any;
			try {
				data = JSON.parse(event.data);
				data = data.data ? JSON.parse(data.data) : data;
			} catch {
				data = null;
			}
			if (!data || !data.uuid || data.uuid === uuid) {
				return;
			}
			setSnack((state: any) => ({
				...state,
				open: true,
				message: data?.selectedItems,
				accepted: data?.accepted,
			}));
		};

		socket.onclose = function (event: CloseEvent) {
			if (event.wasClean) {
				console.log(`[close], code=${event.code} reason=${event.reason}`);
			} else {
				console.log('[close] connection interrupted');
			}
		};

		socket.onerror = function (error: Event) {
			console.log(`[error] ${error}`);
		};
	}, []);

	const handlePlacingRequest = () => {
		console.log(selectedItems);
		console.log(placedItems);
		connection.send(
			JSON.stringify({
				action: 'sendmessage',
				data: JSON.stringify({
					uuid,
					selectedItems: selectedItems.map((id: any) => ({
						crypto: rowsMap[id].symbol,
						value: placedItems[id] || [400, 2000],
					})),
				}),
			})
		);
	};

	const handleInGame = () => {
		connection.send(
			JSON.stringify({
				action: 'sendmessage',
				data: JSON.stringify({
					uuid,
					accepted: `User ${uuid} interested in your placement`,
				}),
			})
		);
	};

	const handleSelectionEnd = ({ item, value }: any) => {
		setPlacedItems((state: any) => ({
			...state,
			[item]: value,
		}));
	};

	const handleClose = () => {
		setSnack({ ...snack, open: false });
	};

	return (
		<>
			<p>User {uuid}</p>
			<div style={{ height: 400, width: '100%' }}>
				<DataGrid
					rows={rows}
					columns={columns}
					pageSize={5}
					rowsPerPageOptions={[5]}
					onSelectionModelChange={setSelectedItems}
					checkboxSelection
				/>
			</div>

			<section style={{ width: '100%' }}>
				{selectedItems.length ? (
					<>
						<List sx={{ width: '100%', bgcolor: 'background.paper' }}>
							{selectedItems.map((item: string) => (
								<ListCurrencyItem
									key={item}
									item={item}
									rowsMap={rowsMap}
									onSelectionEnd={handleSelectionEnd}
								/>
							))}
						</List>
						<Button
							style={{ display: 'flex', margin: '40px auto' }}
							variant="outlined"
							onClick={handlePlacingRequest}
						>
							Place request
						</Button>
					</>
				) : null}
				<Snackbar
					anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
					open={open}
					onClose={handleClose}
					autoHideDuration={120000}
				>
					<Alert onClose={handleClose} severity="warning">
						{message && (
							<>
								<div>
									{message.map((el: any) => (
										<p>
											<span style={{ marginRight: '10px' }}>{el.crypto}</span>
											<span>
												{el.value[0]} - {el.value[1]}
											</span>
										</p>
									))}
								</div>
								<Button
									style={{ display: 'flex', margin: '10px auto' }}
									variant="outlined"
									onClick={handleInGame}
								>
									I'm in
								</Button>
							</>
						)}
						{accepted && (
							<span style={{ marginRight: '10px' }}>{accepted}</span>
						)}
					</Alert>
				</Snackbar>
			</section>
		</>
	);
}
