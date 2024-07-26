# Webpack Preact App with Responsive Images

This project is a Progressive Web App (PWA) built with Preact and Webpack, featuring responsive image loading and optimization. It provides a solid foundation for building performant web applications with modern web technologies.

## Features

- Preact for efficient rendering
- Webpack for bundling and optimization
- Progressive Web App (PWA) capabilities
- Responsive image loading with lazy-loading support
- SASS support for styling
- Production optimizations including code splitting, tree shaking, and minification
- Development server with hot reloading

## Prerequisites

- Node.js (version 14 or later recommended)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/jameswquinn/Webpack-Preact-App-with-Responsive-Images.git
   cd Webpack-Preact-App-with-Responsive-Images
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

### Development

To start the development server:

```
npm start
```

This will start the development server at `http://localhost:9001`. The app will automatically reload if you change any of the source files.

### Production Build

To create a production build:

```
npm run build
```

This will generate optimized files in the `dist` directory, ready for deployment.

## Project Structure

```
webpack-preact-app/
├── src/
│   ├── assets/
│   │   ├── example-image.jpg
│   │   └── icon.png
│   ├── components/
│   │   └── ResponsiveImage.jsx
│   ├── styles/
│   │   └── main.scss
│   ├── App.jsx
│   ├── index.html
│   └── index.js
├── babel.config.js
├── package.json
├── postcss.config.js
├── README.md
└── webpack.config.js
```

## Responsive Images

The project includes a `ResponsiveImage` component that handles responsive image loading. To use it:

1. Place your images in the `src/assets/` directory.
2. Import the image in your component:
   ```jsx
   import exampleImage from '../assets/example-image.jpg';
   ```
3. Use the `ResponsiveImage` component:
   ```jsx
   <ResponsiveImage
     src={exampleImage}
     alt="Description of the image"
     sizes="(max-width: 300px) 300px, (max-width: 600px) 600px, 1200px"
   />
   ```

The `responsive-loader` will generate multiple sizes of your image, and the browser will choose the most appropriate size based on the device's screen size and resolution.

## Customization

- Modify `webpack.config.js` to adjust the build process.
- Update `src/styles/main.scss` for global styles.
- Edit `src/index.html` to change the HTML template.
- Modify PWA settings in the `WebpackPwaManifest` plugin configuration in `webpack.config.js`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
