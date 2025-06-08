import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

const OpenGraphMeta = () => {
  const ogState = useSelector(state=>state.folders.openGraphArgs);
  console.log(ogState)
  return (
    <Helmet>
      <meta property="og:title" content={ogState.fileName || 'Document'} />
      <meta property="og:description" content={ogState.desc || 'Shared Document Content'} />
      <meta property="og:image" content={ogState.image || ''} />
      <meta property="og:url" content={ogState.url || ''} />
      <meta property="og:type" content={ogState.type || 'website'} />
      <meta property="og:site_name" content="iDoks" />
      <meta property="og:locale" content="en_US" />
    </Helmet>
  );
};

export default OpenGraphMeta;
