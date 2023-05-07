import React from 'react'
import { Link } from 'react-router-dom'

const ChapterName = (props) => {
    return (
        <Link to={`/chapter/${props.chapter}`}>
            <li>
                <p>
                    <span>{props.chapter}</span> {props.name_az}
                </p>
                <p>{props.name_ar}
                    <span>{props.verse_count} ayə</span>
                </p>
            </li>
        </Link>
    )
}

export default ChapterName