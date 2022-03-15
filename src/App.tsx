import React from 'react';
import './App.less';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AsignacionesList from './modules/asignaciones/AsignacionesList';
import AsignacionesSave from './modules/asignaciones/AsignacionesSave';
import PublicadoresSave from './modules/publicadores/PublicadoresSave';


const App = () => (
  <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
              <Routes >
                <Route path="/" element={<AsignacionesList />} />
                <Route path="/asignaciones/guardar" element={<AsignacionesSave />} />
                <Route path="/asignaciones/guardar/:id" element={<AsignacionesSave />} />
                <Route path="/publicadores/guardar" element={<PublicadoresSave />} />
              </Routes>
    </BrowserRouter>
);

export default App;