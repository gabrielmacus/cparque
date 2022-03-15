import React from 'react';
import './App.less';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';

import AsignacionesList from './modules/asignaciones/AsignacionesList';
import AsignacionesSave from './modules/asignaciones/AsignacionesSave';
import PublicadoresSave from './modules/publicadores/PublicadoresSave';


const App = () => (
  <HashRouter >
              <Routes >
                <Route path={`${process.env.REACT_APP_BASENAME}/`} element={<AsignacionesList />} />
                <Route path={`${process.env.REACT_APP_BASENAME}/asignaciones/guardar`} element={<AsignacionesSave />} />
                <Route path={`${process.env.REACT_APP_BASENAME}/asignaciones/guardar/:id`} element={<AsignacionesSave />} />
                <Route path={`${process.env.REACT_APP_BASENAME}/publicadores/guardar`} element={<PublicadoresSave />} />
              </Routes>
    </HashRouter>
);

export default App;