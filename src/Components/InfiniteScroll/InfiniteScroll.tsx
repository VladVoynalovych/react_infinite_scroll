import axios from "axios";
import './index.css';
import flickr from "../../Configs/flickr";
import { useEffect, useRef, useState} from "react";
import {ImageItem} from "../ImageItem/ImageItem";
import { TailSpin } from  'react-loader-spinner'

type ApiData = {
    id: string,
    owner: string,
    secret: string,
    server: string,
    farm: number,
    title: string,
    ispublic: number,
    isfriend: number,
    isfamily: number
};
type Image = {
    src: string;
}

export const InfiniteScroll = () => {
    const [images, setImagesState] = useState<Array<Image>>([]);
    const [page, setPage] = useState(0);
    const [isLoading, setLoadingState] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const spinnerRef = useRef<HTMLDivElement>(null);

    const formatData = (unformattedData: Array<ApiData>): Array<Image> => {
        const formattedData = unformattedData.map(({farm, server, id, secret}) => {
            return {
                src:`https://farm${farm}.staticflickr.com/${server}/${id}_${secret}_m.jpg`,
            }
        })

        return formattedData;
    }

    const getPhotos = async (page = 1) => {
        const REQUEST_URL = 'https://www.flickr.com/services/rest/?method=';
        const METHODS = {
            SEARCH: 'flickr.photos.search',
        };

        const reqBody = `api_key=${flickr.key}&text=africa+nature&format=json&nojsoncallback=1&per_page=40&page=${page}`;

        const reqResult = await axios.get(`${REQUEST_URL}${METHODS.SEARCH}&${reqBody}`);
        return reqResult.data.photos.photo;
    }



    useEffect(() => {
        const getData = async (page: number) => {
            const serverData = await getPhotos(page);
            const formattedData = formatData(serverData);

            setImagesState( (images) => {
                return [...images, ...formattedData];
            })
            setPage(page);

            return true;
        };

        const loadPage = async () => {
            if (!isLoading) {
                setLoadingState(true)
                const data = await getData(page + 1);
                if (data) setLoadingState(false);
            }
        }

        if (!rootRef.current || !spinnerRef.current) return;

        const target = spinnerRef.current;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    console.log('intersected')
                    loadPage();
                }
            })
        }, {
            root: rootRef.current as Element,
            threshold: 1,
        })

        if (!isLoading) {
            observer.observe(target as Element)
            console.log(target)
        }

        return () => {
            observer.unobserve(target as Element);
        }
    }, [page, isLoading])

    return <div className={`scroll-wrapper ${images.length ? '': 'empty'}`} ref={rootRef} >
        {
            images.map((image, index) => <ImageItem key={index} src={image.src} index={index}/>)
        }
        <div className={`spinner ${ isLoading ? '' : 'disabled' }`}
             ref={spinnerRef}
        >
            <TailSpin
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
    </div>

}