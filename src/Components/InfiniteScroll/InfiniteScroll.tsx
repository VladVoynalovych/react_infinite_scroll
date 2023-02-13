import axios from 'axios';
import './index.css';
import flickr from '../../Configs/flickr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageItem } from '../ImageItem/ImageItem';
import { TailSpin } from 'react-loader-spinner';

type ApiData = {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
};
type Image = {
  src: string;
};

const formatData = (unformattedData: Array<ApiData>): Array<Image> => {
  return unformattedData.map(({ farm, server, id, secret }) => {
    return {
      src: `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}_m.jpg`,
    };
  });
};

const getPhotos = async (page = 1) => {
  const REQUEST_URL = 'https://www.flickr.com/services/rest/?method=';
  const METHODS = {
    SEARCH: 'flickr.photos.search',
  };

  const reqBody = `api_key=${flickr.key}&text=africa+nature&format=json&nojsoncallback=1&per_page=40&page=${page}`;

  const reqResult = await axios.get(`${REQUEST_URL}${METHODS.SEARCH}&${reqBody}`);
  return reqResult.data.photos.photo;
};

export const InfiniteScroll = () => {
  const [images, setImagesState] = useState<Image[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  const requestProcess = useCallback(async (page: number) => {
    const serverData = await getPhotos(page);
    const formattedData = formatData(serverData);

    setImagesState((images) => {
      return [...images, ...formattedData];
    });
    setPage(page);
  }, []);

  const loadPage = useCallback(async () => {
    if (!isLoading) {
      try {
        setIsLoading(true);
        await requestProcess(page + 1);
      } catch (e) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading, page, requestProcess]);

  const retryRequest = () => {
    setIsError(false);
    loadPage();
  };

  useEffect(() => {
    if (!rootRef.current || !spinnerRef.current || isLoading || isError) return;

    const target = spinnerRef.current;

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            console.log('intersected');
            loadPage();
          }
        });
      },
      {
        root: rootRef.current as Element,
        threshold: 1.0,
      }
    );

    observer.observe(target as Element);

    return () => {
      observer.unobserve(target as Element);
    };
  }, [isError, page, isLoading, loadPage]);

  return (
    <div className={`scroll-wrapper ${images.length ? '' : 'empty'}`} ref={rootRef}>
      {images.map((image, index) => (
        <ImageItem key={index} src={image.src} index={index} />
      ))}
      {!isError ? (
        <div className={`spinner ${isLoading ? '' : 'disabled'}`} ref={spinnerRef}>
          <TailSpin
            height='80'
            width='80'
            color='#4fa94d'
            ariaLabel='tail-spin-loading'
            radius='1'
            wrapperStyle={{}}
            wrapperClass=''
            visible={true}
          />
        </div>
      ) : (
        <div className='error-wrapper'>
          <button className='retry-button' onClick={retryRequest}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
