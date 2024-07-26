import { h } from 'preact';
import ResponsiveImage from './components/ResponsiveImage';
import exampleImage from './assets/example-image.jpg';

const App = () => (
  <div>
    <h1>Hello, Preact!</h1>
    <ResponsiveImage
      src={exampleImage}
      alt="An example responsive image"
      sizes="(max-width: 300px) 300px, (max-width: 600px) 600px, 1200px"
    />
  </div>
);

export default App;
