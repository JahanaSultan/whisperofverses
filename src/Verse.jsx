const Verse = (props) => {
  return (
    <li id={`verse${props.verse}`}>
      <span>{props.verse}.</span>
      <div className="chapter-text">
        <p>{props.verse_ar}</p>
        {props.audio ?
          (<div className="audio">
            <audio controls>
              <source src={props.audio} type="audio/ogg" />
            </audio>
          </div>) : null}
        <p>{props.verse_az}</p>
      </div>
    </li>
  )
}

export default Verse