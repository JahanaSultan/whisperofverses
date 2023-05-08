import { Link } from 'react-router-dom'


const Verse = (props) => {
  return (
    <li id={`verse${props.verse}`}>
        <span>{props.verse}.</span>
        <div className="chapter-text">
            <div>{props.verse_ar? props.verse_ar : (<Link to={`/chapter/${props.chapter}`}>{props.chapter_name} <i class="ri-arrow-right-double-line"></i></Link>)}</div>
            {props.audio?
            (<div className="audio">
                <audio controls>
                    <source src={props.audio} type="audio/ogg" />
                </audio>
            </div>):null}
            <div>{props.verse_az}</div>
        </div> 
    </li>
  )
}

export default Verse