import AvatarIcon from "./Avatar";
import TextCard from "./TextCard";
import boston_avatar from '../assets/boston_icon.jpg';

export default function Answer({answer}) {
    return (
            <div className="d-flex">
                <h3 >
                    <AvatarIcon img={boston_avatar} size={40}/>
                </h3>
                <div style={{maxWidth: '90%'}}>
                    <TextCard text={answer}/>
                </div>
        </div>
    )
}