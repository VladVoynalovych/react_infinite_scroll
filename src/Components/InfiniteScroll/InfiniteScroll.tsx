import axios from "axios";
import './index.css';
import flickr from "../../Configs/flickr";
import {useCallback, useEffect, useRef, useState} from "react";
import {ImageItem} from "../ImageItem/ImageItem";

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

type State = {
    images: Image[];
    page: number
}

export const InfiniteScroll = () => {
    const [{images, page}, setImagesState] = useState<State>({images: [], page: 1});

    const rootRef = useRef<HTMLDivElement>(null);
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
            GET_RECENT: 'flickr.photos.getRecent',
        };

        const reqBody = `api_key=${flickr.key}&format=json&nojsoncallback=1&per_page=40&page=${page}`;

        const reqResult = await axios.get(`${REQUEST_URL}${METHODS.GET_RECENT}&${reqBody}`);
        return reqResult.data.photos.photo;
    }
    const getData = useCallback(
        async () => {
        const serverData = await getPhotos(page);
        const formattedData = formatData(serverData);

        setImagesState( ({images, page}) => {
            console.log(page)
                return {
                    images: [...images, ...formattedData],
                    page: page + 1
            }
        })
    }, [page])

    useEffect(() => {
        if (!rootRef.current) return;
        const rootItem = rootRef.current.lastChild ?? rootRef.current
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    getData();
                }
            })
        }, {
            root: rootItem as Element,
            threshold: 0.5
        })

        observer.observe(rootItem as Element)

    }, [getData])

    return <div className="scroll-wrapper" ref={rootRef}>
        {
            images.map((image, index) => <ImageItem key={index} src={image.src}/>)
        }
    </div>

}