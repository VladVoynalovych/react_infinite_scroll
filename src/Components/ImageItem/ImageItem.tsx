import './index.css'

type ImageProps = {
    src?: string,
    index?: number
}
export const ImageItem = ({src, index}: ImageProps) => {


    return <div className={`image-wrapper image-wrapper-${index}`}>
        <img src={src} alt=""/>
    </div>
}
