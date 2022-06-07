import React from 'react';
import './App.less';
import { BrowserRouter,HashRouter, Route, Routes } from 'react-router-dom';

import AsignacionesList from './modules/asignaciones/AsignacionesList';
import AsignacionesSave from './modules/asignaciones/AsignacionesSave';
import PublicadoresSave from './modules/publicadores/PublicadoresSave';
import PublicadoresList from './modules/publicadores/PublicadoresList';
import ReunionEntresemana from './modules/asignaciones/ReunionEntresemana';


const App = () => (
  <HashRouter basename={process.env.REACT_APP_BASENAME}>
              <Routes >
                <Route path="/" element={<AsignacionesList />} />
                <Route path="/asignaciones/guardar" element={<AsignacionesSave />} />
                <Route path="/asignaciones/guardar/:id" element={<AsignacionesSave />} />

                <Route path="/publicadores" element={<PublicadoresList />} />
                <Route path="/publicadores/guardar" element={<PublicadoresSave />} />
                <Route path="/publicadores/guardar/:id" element={<PublicadoresSave />} />

                <Route path="/asignaciones/entresemana" element={<ReunionEntresemana />} />

              </Routes>
    </HashRouter>
);

export default App;