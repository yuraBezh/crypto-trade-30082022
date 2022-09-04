import React from 'react';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { Box, createTheme } from '@mui/material';

import DataGrid from './components/Table';
import './App.css';
import About from './components/About';

function App() {
	const darkTheme = createTheme({
		palette: {
			mode: 'dark',
		},
	});
	return (
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={darkTheme}>
				<BrowserRouter>
					<>
						<Box sx={{ width: 400, color: '#c2c2c2' }}>
							<Link to="/" className="link">
								Home
							</Link>
							|
							<Link to="about" className="link">
								About
							</Link>
						</Box>
						<div className="App-header">
							<Routes>
								<Route path="/" element={<DataGrid />} />
								<Route path="/about" element={<About />} />
							</Routes>
						</div>
					</>
				</BrowserRouter>
			</ThemeProvider>
		</StyledEngineProvider>
	);
}

export default App;
