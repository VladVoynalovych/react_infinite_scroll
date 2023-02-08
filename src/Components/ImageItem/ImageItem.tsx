import './index.css'

type ImageProps = {
    src?: string
}
export const ImageItem = ({src}: ImageProps) => {


    return <div className="image-wrapper">
        <img src={src} alt=""/>
    </div>
}
