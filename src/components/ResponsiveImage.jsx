import { h } from 'preact';

const ResponsiveImage = ({ src, alt, sizes = '100vw' }) => {
  if (!src.srcSet) {
    return <img src={src} alt={alt} />;
  }

  return (
    <img
      src={src.src}
      srcSet={src.srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
    />
  );
};

export default ResponsiveImage;
