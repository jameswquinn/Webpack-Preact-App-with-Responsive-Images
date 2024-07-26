import { h, render } from 'preact';
import App from './App';
import './styles/main.scss';

// Check if the browser supports lazy loading
if ('loading' in HTMLImageElement.prototype) {
  // Browser supports `loading`
  render(<App />, document.getElementById('root'));
} else {
  // Dynamically import the LazySizes library
  import('lazysizes').then(() => {
    // Now render the app
    render(<App />, document.getElementById('root'));
  });
}
