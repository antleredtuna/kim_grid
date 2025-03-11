import React from 'react';
import { ImageProvider } from './context/ImageContext';
import { GridProvider } from './context/GridContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import EditorContainer from './containers/EditorContainer';
import GridContainer from './containers/GridContainer';

function App() {
  return (
    <ImageProvider>
      <GridProvider>
        <div className="flex flex-col min-h-screen bg-pink-50">
          <Header />
          <main className="flex-1 p-6 container mx-auto">
            <EditorContainer />
            <GridContainer />
          </main>
          <Footer />
        </div>
      </GridProvider>
    </ImageProvider>
  );
}

export default App;
